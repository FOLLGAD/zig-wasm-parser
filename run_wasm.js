const fs = require("node:fs");

const wasmBuffer = fs.readFileSync("./zig-out/bin/langtest.wasm");

WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  // Exported function live under instance.exports
  const { parseit, lenit, memory } = wasmModule.instance.exports;

  const pointer = parseit();
  const len = lenit(pointer);

  let str = new TextDecoder().decode(
    new Uint8Array(memory.buffer, pointer, len),
  );
  console.log(str);
});
