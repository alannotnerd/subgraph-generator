import Parser, { SyntaxNode, Tree } from "tree-sitter";
import { typescript } from "tree-sitter-typescript";
import { readFile } from "fs/promises";
import { AbiNode, ContractEventDescription } from "./types";
import type { Config } from "./types";

const findAbiNode = (tree: Tree) => {
  const abiNode = tree.rootNode.children
    .filter((child) => child.type === "lexical_declaration")
    .filter((child) => child.child(0).type === "const")
    .map((child) => child.child(1))
    .filter((child) => child.child(0).text === "_abi")
    .map((child) => child.child(2));
  return abiNode[0];
};

const node2Json = (root: SyntaxNode) => {
  let nodes = [root];
  const result = [];

  while (true) {
    const node = nodes.shift();
    if (!node) {
      break;
    }
    if (node.childCount === 0) {
      if (node.type === "property_identifier") {
        result.push('"', node.text, '"');
      } else if (node.type === "]" || node.type === "}") {
        const last = result.pop();
        result.push(last === "," ? "" : last, node.text);
      } else {
        result.push(node.text);
      }
    } else {
      const nextNodes = [...node.children, ...nodes];
      nodes = nextNodes;
    }
  }
  return result.join("");
};

const parseOne = async ({
  name,
  address,
  path,
}: Config["contracts"][0]): Promise<ContractEventDescription> => {
  const source = await readFile(path);
  const parser = new Parser();
  parser.setLanguage(typescript);

  const tree = parser.parse(source.toString());

  const abiNode = findAbiNode(tree);

  const nodes = abiNode.children
    .filter((e) => e.type === "object")
    .map((e) => JSON.parse(node2Json(e)) as AbiNode)
    .filter((e) => e.type === "event");

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
