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
import { program } from "commander";

program
  .option('--config <string>', 'Path to config file', "subgen.json")

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

const main = async () => {
  program.parse()
  const configRaw = await fs.readFile(program.opts()["config"]);
  const config: Config = JSON.parse(configRaw.toString());

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
