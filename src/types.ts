export interface Config {
  startBlock: number;
  outDir: string;
  contracts: {
    name: string;
    address: string;
    path: string;
  }[];
}

export interface AbiField {
  name: string;
  type: string;
}

export interface AbiInput extends AbiField {
  indexed?: boolean;
  components?: AbiField[];
}

export interface AbiNode {
  inputs: AbiInput[];
  name: string;
  type: string;
}

export interface ContractEventDescription {
  contractName: string;
  contractAddress: string;
  events: AbiNode[];
}
