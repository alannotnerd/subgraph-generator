import fs from "fs/promises";
import path from "path";
import { Config } from "./types";
export default async (config: Config) => {
  await fs.copyFile(
    "./templates/package.json",
    path.resolve(config.outDir, "package.json")
  );
  await fs.copyFile(
    "./templates/tsconfig.json",
    path.resolve(config.outDir, "tsconfig.json")
  );
};
