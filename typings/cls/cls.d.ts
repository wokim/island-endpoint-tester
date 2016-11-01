// Type definitions for Continuation-Local-Storage
// Project: https://github.com/othiym23/node-continuation-local-storage
// Definitions by: Jang-Ho Hwang <https://github.com/rath>
// Definitions:

declare module ContinuationLocalStorage {
  interface Namespace {
    set(key: string, value: any): any;
    get(key: string): any;
    run(callback: any): void;
  }
  function createNamespace(name: string): Namespace;
  function getNamespace(name: string): Namespace;
  function destroyNamespace(name: string): void;
}

declare module "continuation-local-storage" {
  export = ContinuationLocalStorage;
}
