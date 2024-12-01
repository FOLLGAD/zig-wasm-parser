const mecha = @import("mecha");
const std = @import("std");

const ArenaAllocator = std.heap.ArenaAllocator;
var arena = ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();

const Value = union(enum) {
    Null,
    Bool: bool,
    Number: f64,
    String: []const u8,
    Array: []Value,
    Object: std.StringHashMap(?Value),

    pub fn format(
        self: Value,
        comptime fmt: []const u8,
        options: std.fmt.FormatOptions,
        writer: anytype,
    ) !void {
        switch (self) {
            .Null => try writer.writeAll("null"),
            .Bool => |b| try writer.print("{}", .{b}),
            .Number => |n| try writer.print("{d}", .{n}),
            .String => |s| try writer.print("\"{s}\"", .{s}),
            .Array => |a| {
                try writer.writeAll("[");
                for (a, 0..) |item, i| {
                    if (i > 0) try writer.writeAll(", ");
                    try item.format(fmt, options, writer);
                }
                try writer.writeAll("]");
            },
            .Object => |o| {
                try writer.writeAll("{");
                var it = o.iterator();
                var index: usize = 0;
                while (it.next()) |entry| {
                    if (index > 0) try writer.writeAll(", ");
                    try writer.print("\"{s}\": ", .{entry.key_ptr.*});
                    try entry.value_ptr.*.?.format(fmt, options, writer);
                    index += 1;
                }
                try writer.writeAll("}");
            },
        }
    }
};
fn parseNull() mecha.Parser(Value) {
    return mecha.oneOf(.{
        mecha.combine(.{mecha.string("null")}),
        mecha.combine(.{ mecha.string("n"), ws, mecha.eos }),
        mecha.combine(.{ mecha.string("nu"), ws, mecha.eos }),
        mecha.combine(.{ mecha.string("nul"), ws, mecha.eos }),
    }).map(struct {
        fn map(_: []const u8) Value {
            return .Null;
        }
    }.map);
}

fn parseBool() mecha.Parser(Value) {
    return mecha.oneOf(.{
        mecha.oneOf(.{
            mecha.combine(.{ mecha.string("t"), ws, mecha.eos }),
            mecha.combine(.{ mecha.string("tr"), ws, mecha.eos }),
            mecha.combine(.{ mecha.string("tru"), ws, mecha.eos }),
            mecha.string("true"),
        })
            .map(struct {
            fn map(_: []const u8) Value {
                return .{ .Bool = true };
            }
        }.map),

        mecha.oneOf(.{
            mecha.combine(.{ mecha.string("f"), ws, mecha.eos }),
            mecha.combine(.{ mecha.string("fa"), ws, mecha.eos }),
            mecha.combine(.{ mecha.string("fal"), ws, mecha.eos }),
            mecha.combine(.{ mecha.string("fals"), ws, mecha.eos }),
            mecha.string("false"),
        }).map(struct {
            fn map(_: []const u8) Value {
                return .{ .Bool = false };
            }
        }.map),
    });
}

const digidig = mecha.ascii.range('0', '9');
const digits = digidig.many(.{ .min = 1 });

fn parseNumber() mecha.Parser(Value) {
    const integer = mecha.int(i64, .{
        .parse_sign = true,
        .max_digits = 20,
    });
    const fraction = mecha.combine(.{ mecha.ascii.char('.').discard(), digits });
    const exponent = mecha.combine(.{
        mecha.oneOf(.{ mecha.ascii.char('e'), mecha.ascii.char('E') }).discard(),
        mecha.oneOf(.{ mecha.ascii.char('+'), mecha.ascii.char('-') }).opt(),
        mecha.int(i64, .{
            .parse_sign = false,
            .max_digits = 10,
        }),
    });

    return mecha.combine(.{
        integer,
        fraction.opt(),
        exponent.opt(),
    }).map(struct {
        fn map(tuple: std.meta.Tuple(&.{ i64, ?[]const u8, ?std.meta.Tuple(&.{ ?u8, i64 }) })) Value {
            const int_part = tuple[0];
            const frac_part = tuple[1];
            const exp_part = tuple[2];

            var result: f64 = @floatFromInt(int_part);

            if (frac_part) |frac| {
                var frac_value: f64 = 0;
                for (frac, 0..) |digit, i| {
                    frac_value += @as(f64, @floatFromInt(digit - '0')) * std.math.pow(f64, 10, -@as(f64, @floatFromInt(i + 1)));
                }
                result += if (int_part < 0) -frac_value else frac_value;
            }

            if (exp_part) |exp| {
                const exp_sign: i64 = if (exp[0] != null and exp[0].? == '-') -1 else 1;
                const exp_value = exp[1];
                result *= std.math.pow(f64, 10, @as(f64, @floatFromInt(exp_sign * exp_value)));
            }

            return .{ .Number = result };
        }
    }.map);
}

fn parseString() mecha.Parser(Value) {
    const stringChar = mecha.oneOf(.{
        mecha.ascii.range(0x20, 0x21).asStr(),
        mecha.ascii.range(0x23, 0x5B).asStr(),
        mecha.ascii.range(0x5D, 0x7E).asStr(),
        mecha.string("\\\""),
        mecha.string("\\\\"),
        mecha.string("\\/"),
        mecha.string("\\b"),
        mecha.string("\\f"),
        mecha.string("\\n"),
        mecha.string("\\r"),
        mecha.string("\\t"),
    });

    return mecha.combine(.{
        mecha.ascii.char('"').discard(),
        mecha.many(stringChar, .{}).asStr(),
        mecha.ascii.char('"').opt().discard(),
    }).map(struct {
        fn map(value: []const u8) Value {
            return .{ .String = value };
        }
    }.map);
}

const ws = mecha.many(mecha.oneOf(.{
    mecha.utf8.char(0x0020),
    mecha.utf8.char(0x000A),
    mecha.utf8.char(0x000D),
    mecha.utf8.char(0x0009),
}), .{ .min = 0, .collect = false }).discard();

fn parseArray() mecha.Parser(Value) {
    const openBracket = mecha.ascii.char('[');
    const closeBracket = mecha.oneOf(.{
        mecha.ascii.char(']').discard(),
        mecha.eos.discard(),
    });
    const comma = mecha.ascii.char(',');

    const arrayElement = mecha.combine(.{
        ws,
        mecha.ref(parseValue),
        ws,
    });

    const arrayContents = mecha.combine(.{
        arrayElement,
        mecha.many(mecha.combine(.{
            comma.discard(),
            arrayElement,
        }), .{}),
        comma.opt().discard(),
    }).map(struct {
        fn map(tuple: std.meta.Tuple(&.{ Value, []Value })) Value {
            var array = std.ArrayList(Value).init(allocator);
            array.append(tuple[0]) catch unreachable;
            array.appendSlice(tuple[1]) catch unreachable;
            return .{ .Array = array.toOwnedSlice() catch unreachable };
        }
    }.map);

    return mecha.combine(.{
        openBracket.discard(),
        ws,
        arrayContents.opt(),
        ws,
        closeBracket.discard(),
    }).map(struct {
        fn map(value: ?Value) Value {
            if (value) |contents| {
                return contents;
            } else {
                return .{ .Array = &.{} };
            }
        }
    }.map);
}

fn parseValue() mecha.Parser(Value) {
    return mecha.combine(.{
        ws,
        mecha.oneOf(.{
            parseNull(),
            parseBool(),
            parseNumber(),
            parseString(),
            parseArray(),
            parseObject(),
        }),
        ws,
    });
}

const ObjectRepr = struct { key: []const u8, value: ?Value };

fn parseObject() mecha.Parser(Value) {
    const openBrace = mecha.ascii.char('{');
    const closeBrace = mecha.oneOf(.{
        mecha.ascii.char('}').discard(),
        mecha.eos.discard(),
    });
    const colon = mecha.ascii.char(':');
    const comma = mecha.ascii.char(',');

    const pair = mecha.combine(.{
        ws,
        parseString(),
        ws,
        mecha.combine(.{
            colon.discard(),
            ws,
            mecha.ref(parseValue).opt(),
        }).opt(),
        ws,
    }).map(struct {
        fn map(tuple: std.meta.Tuple(&.{ Value, ??Value })) ObjectRepr {
            return .{ .key = tuple[0].String, .value = tuple[1] orelse null };
        }
    }.map);

    const objectContents = mecha.combine(.{
        pair,
        mecha.many(mecha.combine(.{
            comma.discard(),
            pair,
        }), .{}),
        comma.opt().discard(),
    }).map(struct {
        fn map(tuple: std.meta.Tuple(&.{ ObjectRepr, []ObjectRepr })) Value {
            var map2 = std.StringHashMap(?Value).init(allocator);
            map2.put(tuple[0].key, tuple[0].value) catch unreachable;
            for (tuple[1]) |item| {
                map2.put(item.key, item.value) catch unreachable;
            }
            return .{ .Object = map2 };
        }
    }.map);

    return mecha.combine(.{
        openBrace.discard(),
        ws,
        objectContents.opt(),
        ws,
        closeBrace,
    }).map(struct {
        fn map(value: ?Value) Value {
            if (value) |v| return v;
            return .{ .Object = std.StringHashMap(?Value).init(allocator) };
        }
    }.map);
}

pub fn parseJson(json: []const u8) !Value {
    defer arena.deinit();

    const parser = parseValue();
    const result = try parser.parse(allocator, json);

    return result.value;
}
