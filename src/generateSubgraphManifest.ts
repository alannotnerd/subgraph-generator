import { readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
import { AbiInput, AbiNode, Config, ContractEventDescription } from "./types";

const input2Sig = (input: AbiInput) => {
  const indexed = input.indexed ?? false;

  if ("components" in input) {
    const componentsSig = inputs2Sig(input.components);
    if (input.type === "tuple[]") {
      return `${componentsSig}[]`;
    } else {
      return componentsSig;
    }
  }

  if (indexed) {
    return `indexed ${input.type}`;
  } else {
    return input.type;
  }
};

const inputs2Sig = (inputs: AbiInput[]): string => {
  const sig = inputs.map(input2Sig).join(",");
  return `(${sig})`;
};

interface Context {
  startBlock: number;
  contracts: {
    name: string;
    address: string;
    events: {
      name: string;
      sig: string;
    }[];
  }[];
}

export default async (
  config: Config,
  descriptions: ContractEventDescription[]
) => {
  const template = Handlebars.compile(
    (
      await readFile(path.resolve(__dirname, "../templates/subgraph.yml.hbs"))
    ).toString()
  );
  const data: Context = {
    startBlock: config.startBlock,
    contracts: descriptions.map((description) => {
      return {
        name: description.contractName,
        address: description.contractAddress,
        events: description.events.map((eventAbi) => ({
          name: eventAbi.name,
          sig: `${eventAbi.name}${inputs2Sig(eventAbi.inputs)}`,
        })),
      };
    }),
  };
  const result = template(data);
  await writeFile(path.resolve(config.outDir, "subgraph.yaml"), result);
};
