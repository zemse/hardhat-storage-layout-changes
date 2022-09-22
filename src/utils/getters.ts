import fs from "fs-extra";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StorageLayout, StorageEntry } from "../types";

export async function getStorageLayoutCheckContracts(
  hre: HardhatRuntimeEnvironment
): Promise<
  Array<{
    sourceName: string;
    contractName: string;
    fullyQualifiedName: string;
  }>
> {
  const fullNames = await hre.artifacts.getAllFullyQualifiedNames();
  const contracts = hre.config.storageLayoutChanges.contracts;
  return (contracts.length
    ? contracts.map((userContractStr) => {
        const fullNamesFiltered = fullNames.filter((fullName) => {
          if (fullName === userContractStr) {
            return true;
          } else {
            const [, contractName] = fullName.split(":");
            return contractName === userContractStr;
          }
        });
        if (fullNamesFiltered.length > 1) {
          throw new Error(
            `Contract ${userContractStr} is ambiguous. Please use fully qualified name.`
          );
        } else if (fullNamesFiltered.length === 0) {
          throw new Error(
            `Contract ${userContractStr} not found. Please make sure it is compiled or use fully qualified name.`
          );
        }
        return fullNamesFiltered[0];
      })
    : fullNames.filter((fullName) => fullName.startsWith("contracts"))
  ).map((fullyQualifiedName) => {
    const [sourceName, contractName] = fullyQualifiedName.split(":");
    return { sourceName, contractName, fullyQualifiedName };
  });
}

export async function getStorageLayout(
  hre: HardhatRuntimeEnvironment,
  sourceName: string,
  contractName: string
): Promise<StorageLayout> {
  const paths = await hre.artifacts.getBuildInfoPaths();

  for (const path of paths) {
    const buildInfoJson = await fs.readJSON(path);
    if (
      buildInfoJson.output.contracts &&
      buildInfoJson.output.contracts[sourceName] &&
      buildInfoJson.output.contracts[sourceName][contractName]
    ) {
      const contractBuildInfo =
        buildInfoJson.output.contracts[sourceName][contractName];
      if (contractBuildInfo.storageLayout) {
        return contractBuildInfo.storageLayout;
      } else {
        throw new Error(
          `Please include storageLayout in compiler output. See https://docs.soliditylang.org/en/v0.8.11/using-the-compiler.html#compiler-input-and-output-json-description
          Example of solidity settings in hardhat config:
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
            `
        );
      }
    }
  }

  throw new Error("Cannot find storage layout");
}

export function getEntryFromStorage(
  storage: StorageEntry[],
  astIdOrLabel: string | number
): StorageEntry {
  const entry =
    typeof astIdOrLabel === "number"
      ? storage.find((s) => s.astId === astIdOrLabel)
      : storage.find((s) => s.label === astIdOrLabel);
  if (entry === undefined) {
    throw new Error(
      `${
        typeof astIdOrLabel === "number" ? "AstId" : "Label"
      } ${astIdOrLabel} not found in storage`
    );
  }
  return entry;
}
