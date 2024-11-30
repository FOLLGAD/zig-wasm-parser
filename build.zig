const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
    });

    const optimize: std.builtin.OptimizeMode = .ReleaseSmall;

    const mecha = b.dependency("mecha", .{
        .target = target,
        .optimize = optimize,
    });

    const exe = b.addExecutable(.{
        .name = "langtest",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe.rdynamic = true;
    exe.entry = .disabled;
    exe.root_module.addImport("mecha", mecha.module("mecha"));

    b.installArtifact(exe);
}
