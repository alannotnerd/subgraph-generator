import { parse } from "./parser";
import { Config } from "./types";
import generateSubgraphManifest from "./generateSubgraphManifest";
import fs from "fs/promises";
import generateGraphqlSchema from "./generateGraphqlSchema";
import copyResources from "./copyResources";
import generateAbi from "./generateAbi";
import generateTsCode from "./generateTsCode";
import generateFactory from "./generateFactory";
import Handlebars from "handlebars";
import { capitalize } from "./utils";
Handlebars.registerHelper("safeId", function (context) {
  if (context === "id") {
    return "tid";
  }
  return context;
});

Handlebars.registerHelper("capitalize", function (context) {
  return capitalize(context);
});

Handlebars.registerHelper("wrapStruct", function (context, contract) {
  return context.slice(contract.length) + "Struct";
});

const config: Config = {
  startBlock: 7648760,
  outDir: "../generated-graph",
  contracts: [
    {
      name: "PoolCore",
      address: "0xfE54AEF5540C40C8C9e0ad1bAFDbd64e334D101B",
      path: "./data/PoolCore.ts",
    },
    {
      name: "PoolMarketplace",
      address: "0x88888888888880C8C9e0ad1bAFDbd64e334D101B",
      path: "./data/PoolMarketplace.ts",
    },
  ],
};

const main = async () => {
  await fs.mkdir(config.outDir, {
    recursive: true,
  });
  const data = await parse(config.contracts);
  await Promise.all([
    generateAbi(config, data),
    generateSubgraphManifest(config, data),
    generateGraphqlSchema(config, data),
    generateFactory(config, data),
    generateTsCode(config, data),
    copyResources(config),
  ]);
};

main().then(() => process.exit());
