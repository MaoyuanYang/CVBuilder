import { PROFILE_STORAGE_KEY, type StorageBackend } from "../shared/storage";

export interface FakeStorageBackend extends StorageBackend {
  failNextRead(): void;
  failNextWrite(): void;
  storedValue(): unknown;
  writeCount(): number;
}

export function createFakeBackend(initial?: unknown): FakeStorageBackend {
  const store = new Map<string, unknown>();
  if (initial !== undefined) {
    store.set(PROFILE_STORAGE_KEY, initial);
  }
  let nextReadFails = false;
  let nextWriteFails = false;
  let writes = 0;

  return {
    failNextRead() {
      nextReadFails = true;
    },
    failNextWrite() {
      nextWriteFails = true;
    },
    storedValue() {
      return store.get(PROFILE_STORAGE_KEY);
    },
    writeCount() {
      return writes;
    },
    async get(key) {
      if (nextReadFails) {
        nextReadFails = false;
        throw new Error("storage read failed");
      }
      const value = store.get(key);
      return value === undefined ? undefined : { [key]: value };
    },
    async set(key, value) {
      if (nextWriteFails) {
        nextWriteFails = false;
        throw new Error("storage write failed");
      }
      writes += 1;
      store.set(key, value);
    },
  };
}
