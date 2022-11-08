import { readFile, writeFile } from "fs/promises";
import path from "path";
import { AbiInput, AbiNode, Config, ContractEventDescription } from "./types";
import Handlebars from "handlebars";
import { capitalize } from "./utils";

interface Context {
  contracts: {
    name: string;
    factories: {
      name: string;
      fields: {
        name: string;
        isArray: boolean;
        factory?: string;
      }[];
    }[];
  }[];
}

const processEntities = (events: AbiNode[], contractName: string) => {
  const factories: Context["contracts"][0]["factories"] = [];
  const processInput = (input: AbiInput, prefix: string) => {
    if (!input.components) {
      return null;
    }

    const baseName = `${prefix}${capitalize(input.name)}`;
    const fieldsFactories = input.components.map((i) =>
      processInput(i, baseName)
    );
    factories.push({
      name: baseName,
      fields: input.components.map((e, idx) => ({
        name: e.name,
        isArray: e.type.endsWith("[]"),
        factory: fieldsFactories[idx],
      })),
    });
    return baseName;
  };
  events.forEach((event) => {
    event.inputs.forEach((input) =>
      processInput(input, `${contractName}${event.name}`)
    );
  });
  return factories;
};

export default async (
  config: Config,
  descriptions: ContractEventDescription[]
) => {
  const template = Handlebars.compile(
    (
      await readFile(path.resolve(__dirname, "../templates/factories.ts.hbs"))
    ).toString()
  );
  const data: Context = {
    contracts: descriptions.map((description) => {
      return {
        name: description.contractName,
        factories: processEntities(
          description.events,
          description.contractName
        ),
      };
    }),
  };

  const result = template(data);
  await writeFile(path.resolve(config.outDir, "src", "factories.ts"), result);
};
