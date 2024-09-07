import { readFileSync } from "node:fs";
const wasmBuffer = readFileSync("./zig-out/bin/langtest.wasm");

const input = `{"password": "test", "array": [{"value": 123, "name": "test"}, {"value": 456, "name": "test2"}], "database": "test`;

WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  const { parseJson, ptrLen, memory } = wasmModule.instance.exports;

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
