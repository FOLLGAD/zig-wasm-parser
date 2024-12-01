import { readFileSync } from "node:fs";
const wasmBuffer = readFileSync("./zig-out/bin/langtest.wasm");

const input2 = `{"password": "test", "array": [{"value": 123, "name": "test"}, {"value": 456, "name": "test2"}], "database": "test`;
const input = readFileSync("./weather.json").toString()

WebAssembly.instantiate(wasmBuffer, {}).then((wasmModule) => {
  const { parseJson, ptrLen, memory } = wasmModule.instance.exports;
  const buffer = new Uint8Array(memory.buffer);
  const offset = 0;
  
  console.time("wasm");
  // put the input string into the wasm memory
  const uint8arr = new TextEncoder().encode(input);
  buffer.set(uint8arr, offset);
  
  // run the wasm function and calculate length
  
  const pointer = parseJson(offset, uint8arr.length);
  const len = ptrLen(pointer);
  
  // read the string from the wasm memory
  let str = new TextDecoder().decode(
    new Uint8Array(memory.buffer, pointer, len),
  );
  console.timeEnd("wasm");
  // console.log(str)
});
