const std = @import("std");
const jsonp = @import("jsonp.zig");

const walloc = std.heap.wasm_allocator;

export fn parseJson(offset: usize, len: usize) [*]u8 {
    const ptr: [*]const u8 = @ptrFromInt(offset);
    const array: []const u8 = ptr[0..len];

    var memory = std.ArrayList(u8).init(walloc);

    const out = jsonp.parseJson(array) catch {
        const errorString: []const u8 = "Error";
        _ = memory.writer().write(errorString) catch unreachable;
        return memory.items.ptr;
    };

    memory.writer().print("{?}", .{out}) catch unreachable;

    // TODO: set len as the first item in the array
    return memory.items.ptr;
}

fn c_strlen(ptr: [*]const u8) usize {
    var i: usize = 0;
    while (ptr[i] != 0) : (i += 1) {}
    return i;
}

export fn ptrLen(a: [*]u8) usize {
    return c_strlen(a);
}
