import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { Config, ContractEventDescription } from "./types";
import Handlebars from "handlebars";
import { capitalize } from "./utils";

interface Context {
  contracts: {
    name: string;
    events: {
      name: string;
      fields: {
        name: string;
        isArray: boolean;
        factory?: string;
      }[];
    }[];
  }[];
}

export default async (
  config: Config,
  descriptions: ContractEventDescription[]
) => {
  await mkdir(path.resolve(config.outDir, "src"), { recursive: true });

  const template = Handlebars.compile<Context["contracts"][0]>(
    (
      await readFile(path.resolve(__dirname, "../templates/contract.ts.hbs"))
    ).toString()
  );
  const data: Context = {
    contracts: descriptions.map((description) => {
      return {
        name: description.contractName,
        events: description.events.map((event) => {
          return {
            name: event.name,
            fields: event.inputs.map((input) => {
              return {
                name: input.name,
                isArray: input.type.endsWith("[]"),
                factory: input.components
                  ? `${description.contractName}${event.name}${capitalize(
                      input.name
                    )}__factory`
                  : null,
              };
            }),
          };
        }),
      };
    }),
  };

  await Promise.all(
    data.contracts.map((contract) => {
      const result = template(contract);
      return writeFile(
        path.resolve(config.outDir, "src", `${contract.name}.ts`),
        result
      );
    })
  );
};
