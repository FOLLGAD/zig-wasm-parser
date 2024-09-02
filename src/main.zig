const std = @import("std");
const jsonp = @import("jsonp.zig");

const walloc = std.heap.wasm_allocator;

export fn parseJson() [*]u8 {
    const json =
        \\ {
        \\   "firstName": "John",
        \\   "num": [1,23,456],
        \\   "arr":[{
        \\     "a": 1,
        \\     "b": 2,
        \\     "c": 3
    ;

    const out = jsonp.parseJson(json);

    var memory = std.ArrayList(u8).init(walloc);
    memory.writer().print("{?}", .{out}) catch unreachable;

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
