import { readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
import { AbiInput, AbiNode, Config, ContractEventDescription } from "./types";

interface Context {
  contracts: {
    name: string;
    entities: {
      name: string;
      isEvent: boolean;
      fields: {
        name: string;
        type: string;
      }[];
    }[];
  }[];
}

type Entities = Context["contracts"][0]["entities"];

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const basicType = {
  address: "Bytes!",
  bytes: "Bytes!",
  uint256: "BigInt!",
  uint128: "BigInt!",
  uint64: "BigInt!",
  uint32: "Int!",
  bytes32: "Int!",
  uint16: "Int!",
  uint8: "Int!",
  bool: "Boolean!",
};

const processEntities = (events: AbiNode[], prefix: string): Entities => {
  const entities = [];
  const processField = (prefix: string) => (input: AbiInput) => {
    if ("components" in input) {
      const typeName = `${prefix}${capitalizeFirstLetter(input.name)}`;
      processEntity(input.components, typeName, false);
      if (input.type === "tuple[]") {
        return {
          name: input.name,
          type: "[" + typeName + "]",
        };
      } else {
        return {
          name: input.name,
          type: typeName,
        };
      }
    }

    if (input.type in basicType) {
      return {
        name: input.name,
        type: basicType[input.type],
      };
    }

    if (input.type.endsWith("[]") && input.type.slice(0, -2) in basicType) {
      return {
        name: input.name,
        type: "[" + basicType[input.type] + "]",
      };
    }

    throw new Error(`Unsupported type: ${input.type}`);
  };

  const processEntity = (
    inputs: AbiInput[],
    name: string,
    isEvent: boolean
  ) => {
    entities.push({
      name,
      isEvent,
      fields: inputs.map(processField(name)),
    });
  };

  events.forEach((event) =>
    processEntity(
      event.inputs,
      prefix + capitalizeFirstLetter(event.name),
      true
    )
  );

  return entities;
};

export default async (
  config: Config,
  descriptions: ContractEventDescription[]
) => {
  const template = Handlebars.compile(
    (
      await readFile(path.resolve(__dirname, "../templates/schema.graphql.hbs"))
    ).toString()
  );
  const data: Context = {
    contracts: descriptions.map((description) => {
      return {
        name: description.contractName,
        entities: processEntities(description.events, description.contractName),
      };
    }),
  };

  const result = template(data);
  await writeFile(path.resolve(config.outDir, "schema.graphql"), result);
};
