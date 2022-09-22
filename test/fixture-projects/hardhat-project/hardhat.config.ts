// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.14",
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  paths: {
    // storageLayouts: ".storage-layouts",
  },
  defaultNetwork: "hardhat",
  storageLayoutConfig: {
    contracts: ["Hello"],
    fullPath: false,
  },
};

export default config;
