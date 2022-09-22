# hardhat-storage-layout-changes

_Hardhat plugin to check for storage layout changes_

## What

When working with complex and upgradable contracts, it can be difficult to manually see whether some solidity changes broke the storage layout or not. A mistake can cause undefined behavior in deployed contracts. This plugin aims to help notice any storage layout breakings while dev works on solidity changes.

## Installation

```bash
npm install hardhat-storage-layout-changes
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-storage-layout-changes");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-storage-layout-changes";
```

## Tasks

This plugin adds the _storage-layout_ task to Hardhat:

```
Usage: hardhat [GLOBAL OPTIONS] storage-layout [--check] [--update]

OPTIONS:

  --check       Checks if storage layout has changed
  --update      Updates storage layout artifact
```

## Configuration

This plugin extends the `HardhatUserConfig`'s `ProjectPathsUserConfig` object with an optional
`storageLayouts` field and also adds a `storageLayoutConfig`.

This is an example of how to set it:

```js
module.exports = {
  paths: {
    storageLayouts: ".storage-layouts",
  },
  storageLayoutConfig: {
    contracts: ["Pool"],
    fullPath: false
  };
};
```

## Usage

### `npx hardhat storage-layout --check`

```
Contract: Pool
   "accounts": at same location
         "user": at same location
         "balance": at same location
   "owner": changed slot from 1 to 2
   "lastUpdate": found new storage entry at slot 1 offset 0
   "owner": found new storage entry at slot 2 offset 0

Error: Storage Layout Changed. If this was intentional, please update the storage layout files using "npx hardhat storage-layout --update".
```

### `npx hardhat storage-layout --update`

```
Contract: Pool
updating Pool.json
```
