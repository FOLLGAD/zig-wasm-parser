const fs = require("node:fs");
const wasmBuffer = fs.readFileSync("./zig-out/bin/langtest.wasm");

WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  const { parseJson, ptrLen, memory } = wasmModule.instance.exports;

  const pointer = parseJson();
  const len = ptrLen(pointer);

  let str = new TextDecoder().decode(
    new Uint8Array(memory.buffer, pointer, len),
  );
  console.log(str);
});
