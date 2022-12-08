import { readFile } from "fs/promises";
import { AbiNode, ContractEventDescription } from "./types";
import type { Config } from "./types";

const parseOne = async ({
  name,
  address,
  path,
}: Config["contracts"][0]): Promise<ContractEventDescription> => {
  const source = await readFile(path);
  const abi: AbiNode[] = JSON.parse(source.toString())["abi"]
  const nodes = abi.filter((e) => e.type === "event");

  return {
    contractName: name,
    contractAddress: address,
    events: nodes,
  };
};

export const parse = async (
  contracts: Config["contracts"]
): Promise<ContractEventDescription[]> => {
  return await Promise.all(contracts.map((contract) => parseOne(contract)));
};
