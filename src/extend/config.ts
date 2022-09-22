import { extendConfig } from "hardhat/config";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";

declare module "hardhat/types/config" {
  // This is an example of an extension to one of the Hardhat config values.

  export interface HardhatUserConfig {
    storageLayoutCheck?: {
      contracts?: string[];
    };
  }

  export interface HardhatConfig {
    storageLayoutCheck: {
      contracts: string[];
    };
  }
}

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const storageLayoutCheck = {
      contracts: userConfig?.storageLayoutCheck?.contracts || [],
    };
    config.storageLayoutCheck = storageLayoutCheck;
  }
);
