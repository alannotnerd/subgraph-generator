# Subgraph Generator
Simple tool to generate a Subgraph to subscribe all events

## Usage
```bash
$ cat subgen.json
{
  "startBlock": "789000",
  "outDir": "./generated",
  "contracts": [
    {
      name: "Foo",
      address: "0xfE54AEF5540C40C8C9e0ad1bAFDbd64e334D101B",
      path: "abi/Foo.json",
    }
  ]
}

$subgen --config subgen.json
```

The above snippet will generate repo to specified outDir
