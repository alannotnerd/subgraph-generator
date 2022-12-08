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
  startBlock: 7900000,
  outDir: "../generated-graph",
  contracts: [
    {
      name: "PoolCore",
      address: "0xD496950582236b5E0DAE7fA13acc018492bE9c29",
      path: "/Users/alanwang/repo/para-space/paraspace-core/types/factories/protocol/pool/PoolCore__factory.ts",
    },
    {
      name: "PoolMarketplace",
      address: "0xD496950582236b5E0DAE7fA13acc018492bE9c29",
      path: "/Users/alanwang/repo/para-space/paraspace-core/types/factories/protocol/pool/PoolMarketplace__factory.ts",
    },
    {
      name: "PoolConfigurator",
      address: "0xF8BA554C70f6dA7ac1699Ab35EE1C34C517eab56",
      path: "/Users/alanwang/repo/para-space/paraspace-core/types/factories/protocol/pool/PoolConfigurator__factory.ts",
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
