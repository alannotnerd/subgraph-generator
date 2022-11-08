import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Config, ContractEventDescription } from "./types";

export default async (
  config: Config,
  descriptions: ContractEventDescription[]
) => {
  await mkdir(path.resolve(config.outDir, "abis"), { recursive: true });
  await Promise.all(
    descriptions.map(({ events, contractName }) =>
      writeFile(
        path.resolve(config.outDir, "abis", `${contractName}.json`),
        JSON.stringify(events, null, 2)
      )
    )
  );
};
