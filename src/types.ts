export interface StorageEntry {
  astId: number;
  contract: string;
  label: string;
  offset: number;
  slot: string;
  type: string;
  compared?: boolean;
}

// export interface StorageType {
//   base?: string;
//   encoding: "inplace" | "bytes" | "dynamic_array" | "mapping";
//   label: string;
//   numberOfBytes: string;
//   members?: StorageEntry[];
// }

export type StorageType =
  | InplaceStorageType
  | BytesStorageType
  | DynamicArrayStorageType
  | MappingStorageType;

export interface InplaceStorageType {
  encoding: "inplace";
  label: string;
  numberOfBytes: string;
  members?: StorageEntry[]; // for inplace structs
}

export interface BytesStorageType {
  encoding: "bytes";
  label: string;
  numberOfBytes: string;
}

export interface DynamicArrayStorageType {
  base: string;
  encoding: "dynamic_array";
  label: string;
  numberOfBytes: string;
}

export interface MappingStorageType {
  encoding: "mapping";
  key: "string";
  label: string;
  numberOfBytes: string;
  value: string;
}

export interface StorageLayout {
  storage: StorageEntry[];
  types: { [typeName: string]: StorageType };
}

export type Verbosity = "error" | "warning" | "info";
export type Results = Array<[Verbosity, string, number]>;
