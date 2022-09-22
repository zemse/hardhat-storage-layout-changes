import { extendConfig } from "hardhat/config";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";

declare module "hardhat/types/config" {
  // This is an example of an extension to one of the Hardhat config values.

  export interface HardhatUserConfig {
    storageLayoutChanges?: {
      contracts?: string[];
      fullPath?: boolean;
    };
  }

  export interface ProjectPathsUserConfig {
    storageLayouts?: string;
  }

  export interface HardhatConfig {
    storageLayoutChanges: {
      contracts: string[];
      fullPath: boolean;
    };
  }

  export interface ProjectPathsConfig {
    storageLayouts: string;
  }
}

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const storageLayoutConfig = {
      contracts: userConfig?.storageLayoutChanges?.contracts ?? [],
      fullPath: userConfig?.storageLayoutChanges?.fullPath ?? true,
    };
    config.storageLayoutChanges = storageLayoutConfig;

    const storageLayouts =
      userConfig.paths?.storageLayouts ?? "storage-layouts";
    config.paths.storageLayouts = storageLayouts;
  }
);
