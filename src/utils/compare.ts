import { StorageEntry, StorageType, Results } from "../types";

/**
 * Compares two storage layouts and returns a list of changes.
 * @param expected storage layout that is stored, is the correct one
 * @param actual storage layout that included any changes made by the user to contracts
 */
export function compareStorageEntries(
  expectedEntries: StorageEntry[],
  actualEntries: StorageEntry[],
  expectedTypes: { [key: string]: StorageType },
  actualTypes: { [key: string]: StorageType },
  results: Results,
  depth: number
): 0 | 1 {
  let returnCode: 0 | 1 = 0;
  for (const expected of expectedEntries) {
    const actualEntriesFilter = actualEntries.filter(
      (actual) => expected.label === actual.label
    );
    if (actualEntriesFilter.length === 0) {
      results.push([
        "error",
        `"${expected.label}": not found in updated contract. The variable might have been renamed or removed.`,
        depth,
      ]);
      returnCode = 1;
    } else if (actualEntriesFilter.length > 1) {
      // if multiple private variables in the contract have same name, try using astId
      const actual = actualEntries.find(
        (actual) =>
          expected.astId === actual.astId && expected.label === actual.label
      );
      if (!actual) {
        results.push([
          "error",
          `"${expected.label}": multiple labels found in contract. These might be private variables from multiple inherited contracts. Either rename them to be unique or ignore check (TODO add link how to ignore).`,
          depth,
        ]);
        returnCode = 1;
      } else {
        actual.compared = true;
      }
    } else {
      // actualEntriesFilter.length === 1
      const actual = actualEntriesFilter[0];
      const isSameSlot = expected.slot === actual.slot;
      const isSameOffset = expected.offset === actual.offset;
      if (!isSameSlot && !isSameOffset) {
        results.push([
          "error",
          `"${expected.label}": changed location from slot ${expected.slot} offset ${expected.offset} to slot ${actual.slot} offset ${actual.offset}`,
          depth,
        ]);
        returnCode = 1;
      } else if (isSameSlot && !isSameOffset) {
        results.push([
          "error",
          `"${expected.label}": changed offset from ${expected.offset} to ${actual.offset}`,
          depth,
        ]);
        returnCode = 1;
      } else if (!isSameSlot && isSameOffset) {
        results.push([
          "error",
          `"${expected.label}": changed slot from ${expected.slot} to ${actual.slot}`,
          depth,
        ]);
        returnCode = 1;
      } else {
        results.push(["info", `"${expected.label}": at same location`, depth]);
        compareTypes(
          expected.label,
          expected.type,
          actual.type,
          expectedTypes,
          actualTypes,
          results,
          depth + 1
        );
        actual.compared = true;
      }
    }
  }

  const uncomparedActualEntries = actualEntries.filter(
    (actual) => !actual.compared
  );
  for (const actual of uncomparedActualEntries) {
    results.push([
      "warning",
      `"${actual.label}": found new storage entry at slot ${actual.slot} offset ${actual.offset}`,
      depth,
    ]);
  }
  actualEntries.forEach((actual) => delete actual.compared);
  return returnCode;
}

export function compareTypes(
  name: string,
  expectedTypeName: string,
  actualTypeName: string,
  expectedTypes: { [key: string]: StorageType },
  actualTypes: { [key: string]: StorageType },
  results: Results,
  depth: number
): 0 | 1 {
  if (expectedTypeName !== actualTypeName) {
    results.push([
      "warning",
      `"${name}": type changed from "${expectedTypeName}" to "${actualTypeName}"`,
      depth,
    ]);
  }

  const expectedType = expectedTypes[expectedTypeName];
  const actualType = actualTypes[actualTypeName];
  if (expectedType.label !== actualType.label) {
    results.push([
      "warning",
      `"${name}": label changed from "${expectedTypeName}" to "${actualTypeName}"`,
      depth,
    ]);
  }

  if (expectedType.numberOfBytes !== actualType.numberOfBytes) {
    results.push([
      "warning",
      `"${name}": numberOfBytes changed from "${expectedType.numberOfBytes}" to "${actualType.numberOfBytes}"`,
      depth,
    ]);
  }

  if (expectedType.encoding !== actualType.encoding) {
    results.push([
      "error",
      `"${name}": encoding changed from "${expectedType.encoding}" to "${actualType.encoding}"`,
      depth,
    ]);
    return 1;
  }

  if (
    expectedType.encoding === "inplace" &&
    actualType.encoding === "inplace" // for typescript
  ) {
    // more checks only if this is a struct
    if (expectedType.members && !actualType.members) {
      results.push([
        "error",
        `"${name}": members not present in actual type. Probably, struct type was changed to a non-struct type`,
        depth,
      ]);
      return 1;
    } else if (!expectedType.members && actualType.members) {
      results.push([
        "error",
        `"${name}": members not present in expected type. Probably, non-struct type was changed to a struct type`,
        depth,
      ]);
      return 1;
    } else if (
      expectedType.members !== undefined &&
      actualType.members !== undefined
    ) {
      if (expectedType.members.length !== actualType.members.length) {
        results.push([
          "warning",
          `"${name}": number of struct members changed from ${expectedType.members.length} to ${actualType.members.length}`,
          depth,
        ]);
      }

      if (
        compareStorageEntries(
          expectedType.members,
          actualType.members,
          expectedTypes,
          actualTypes,
          results,
          depth + 1
        )
      ) {
        return 1;
      }
    }
  } else if (expectedType.encoding === "bytes") {
    // no more checks for bytes
  } else if (
    expectedType.encoding === "dynamic_array" &&
    actualType.encoding === "dynamic_array" // for typescript
  ) {
    if (expectedType.base !== actualType.base) {
      results.push([
        "warning",
        `"${name}": base type changed from ${expectedType.base} to ${actualType.base}`,
        depth,
      ]);
    }
    if (
      compareTypes(
        name,
        expectedType.base,
        actualType.base,
        expectedTypes,
        actualTypes,
        results,
        depth + 1
      )
    ) {
      return 1;
    }
  } else if (
    expectedType.encoding === "mapping" &&
    actualType.encoding === "mapping" // for typescript
  ) {
    if (expectedType.key !== actualType.key) {
      results.push([
        "warning",
        `"${name}": mapping key type changed from ${expectedType.key} to ${actualType.key}`,
        depth,
      ]);
    }
    if (
      compareTypes(
        name + "-key",
        expectedType.key,
        actualType.key,
        expectedTypes,
        actualTypes,
        results,
        depth + 1
      )
    ) {
      return 1;
    }

    if (expectedType.value !== actualType.value) {
      results.push([
        "warning",
        `"${name}": mapping value type changed from ${expectedType.value} to ${actualType.value}`,
        depth,
      ]);
    }
    if (
      compareTypes(
        name + "-value",
        expectedType.value,
        actualType.value,
        expectedTypes,
        actualTypes,
        results,
        depth + 1
      )
    ) {
      return 1;
    }
  } else {
    throw new Error(
      `Unknown encoding ${expectedType.encoding}. Please report this error to the plugin author.`
    );
  }

  return 0;
}
