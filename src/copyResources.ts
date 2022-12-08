import fs from "fs/promises";
import path from "path";
import { Config } from "./types";
export default async (config: Config) => {
  await fs.copyFile(
    path.resolve(__dirname, "../templates/package.json"),
    path.resolve(config.outDir, "package.json")
  );
  await fs.copyFile(
    path.resolve(__dirname, "../templates/tsconfig.json"),
    path.resolve(config.outDir, "tsconfig.json")
  );
};
