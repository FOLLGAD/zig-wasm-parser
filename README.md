# Partial-JSON parser

A "partial" JSON parser for WASM.

## Why?

LLM stream parsing is hard. Parsers are often used to extract data from unstructured text.
One of the most common data formats is JSON, and while it's streaming, it might look like this:

```json
{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "123
```

Since this is not valid JSON, it is difficult to extract the data, especially multiple times a second in-browser while waiting for the LLM response.

What Partial-JSON does is it parses the JSON in a streaming fashion, and returns a valid JSON object with correct syntax,
letting you display the available data real-time to the user.

For the above input, Partial-JSON would return:

```json
{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  }
}
```

## Fast

The parser is implemented in Zig, and compiled to WebAssembly.

It is able to parse, correct and return a 50KB document in under **6ms** (most of the time is spent on JS-WASM data transfer).

## Building

```bash
$ zig build zig build -Dtarget=wasm32-wasi
```

## Demo

Check [the demo](https://wasm-test.ahlback-emil.workers.dev) for a live demo.
Also found in the [example](./example) folder.
