import fs from "fs-extra";
import { task } from "hardhat/config";
import { Results, StorageLayout } from "../types";

import {
  compareStorageEntries,
  getStorageLayout,
  getStorageLayoutCheckContracts,
  printResults,
} from "../utils";

task("storage-layout", "Updates storage layout")
  .addFlag("check")
  .addFlag("update")
  .setAction(async (args, hre) => {
    if (!args.check && !args.update) {
      throw new Error("Must use either --check or --update");
    }

    if (args.check && args.update) {
      throw new Error("Cannot use both --check and --update");
    }

    const contracts = await getStorageLayoutCheckContracts(hre);

    let shouldThrowError;

    for (const contract of contracts) {
      console.log("Contract:", contract.contractName);

      const subPath = `storage-layout/${contract.fullyQualifiedName}.json`;
      const path = `${hre.config.paths.root}/${subPath}`;
      const contractStorageLayout = await getStorageLayout(
        hre,
        contract.sourceName,
        contract.contractName
      );

      let results: Results = [];

      const pathExists = await fs.pathExists(path);
      if (pathExists) {
        const storedStorageLayout: StorageLayout = await fs.readJSON(path);
        compareStorageEntries(
          storedStorageLayout.storage,
          contractStorageLayout.storage,
          storedStorageLayout.types,
          contractStorageLayout.types,
          results,
          1 // depth
        );
      }
      const warningResults = results.filter((r) => r[0] !== "info");
      const errorResults = results.filter((r) => r[0] === "error");
      if (errorResults.length > 0) {
        shouldThrowError = true;
      }

      if (args.check) {
        // run checks, do not update
        if (!pathExists) {
          console.warn(
            `Storage layout not captured for ${contract.fullyQualifiedName}. Please run "npx hardhat storage-layout --update".`
          );
        } else {
          printResults(results, "info");
        }
      } else {
        if (!pathExists || warningResults.length > 0) {
          // update storage layout file
          console.log(`updating ${subPath}`);
          await fs.ensureFile(path);
          await fs.writeJSON(path, contractStorageLayout, { spaces: 2 });
        } else {
          console.log(`no need to update ${subPath}`);
        }
      }
    }

    if (args.check && shouldThrowError) {
      throw new Error(
        `Storage Layout Changed. If this was intentional, please update the storage layout files using "npx hardhat storage-layout --update".`
      );
    }

    return;
  });
