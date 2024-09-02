const fs = require("node:fs");

const wasmBuffer = fs.readFileSync("./zig-out/bin/langtest.wasm");

const mem = new WebAssembly.Memory({ initial: 1 });

WebAssembly.instantiate(wasmBuffer, {
  imports: {
    memory: mem,
  },
  env: {
    // Ensure the memory is linked correctly
    memory: mem,
  },
  js: { memory: mem },
}).then((wasmModule) => {
  // Exported function live under instance.exports
  const { parseit, lenit } = wasmModule.instance.exports;
  const pointer = parseit();
  const len = lenit(pointer);
  console.log(pointer, len);

  console.log(mem.buffer);
  let str = new TextDecoder().decode(new Uint8Array(mem.buffer, pointer, len));
  console.log(str);
});
