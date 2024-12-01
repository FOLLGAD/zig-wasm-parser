# creating a zig wasm project

```zig
const target = .{
    .cpu_arch = .wasm32,
    .os_tag = .freestanding,
}
```

in build.zig:
```zig
// import outside package
const mecha = b.dependency("mecha", .{
    .target = target,
    .optimize = optimize,
});

// add main file
const exe = b.addExecutable(.{
    .name = "langtest",
    .root_source_file = b.path("src/main.zig"),
    .target = target,
    .optimize = optimize,
});
exe.rdynamic = true;
exe.entry = .disabled; // wasm doesn't have an entry point
exe.root_module.addImport("mecha", mecha.module("mecha")); // Add outside package

b.installArtifact(exe);
```


# Wasm from node/browser

```ts
WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  const { fnFromZig } = wasmModule.instance.exports;
  
  fnFromZig(); // Run fn
});
```

```ts
const input = "hello world";
WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  const { fnFromZig } = wasmModule.instance.exports;

  // put the input string into the wasm memory
  const uint8arr = new TextEncoder().encode(input);
  const buffer = new Uint8Array(memory.buffer);
  const offset = 0;
  buffer.set(uint8arr, offset);

  // run the wasm function and calculate length
  const pointer = parseJson(offset, uint8arr.length);
  const len = ptrLen(pointer);

  // read the string from the wasm memory
  let str = new TextDecoder().decode(
    new Uint8Array(memory.buffer, pointer, len),
  );
  console.log(str);
});
```