const std = @import("std");
const jsonp = @import("jsonp.zig");

var memory = std.mem.zeroes([1024:0]u8);

export fn parseit() [*]u8 {
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
    //now, format to string and copy to allocator
    _ = std.fmt.bufPrint(&memory, "{?}", .{out}) catch unreachable;
    return @ptrCast(&memory);
}

fn c_strlen(ptr: [*]const u8) usize {
    var i: usize = 0;
    while (ptr[i] != 0) : (i += 1) {}
    return i;
}

export fn lenit(a: [*]u8) usize {
    return c_strlen(a);
}
