/* eslint-disable no-unused-vars */
/**
 * @summary Interface for storage used by AuthlyClient.
 */
export interface IAuthlyStorage {
    /**
     * @summary Retrieve an item from storage.
     * @param _key - The key of the item to retrieve.
     * @returns The value of the item, or null if not found.
     */
    getItem(_key: string): string | null | Promise<string | null>

    /**
     * @summary Add key and value to storage.
     * @param _key - The key of the item to add.
     * @param _value - The value of the item to add.
     */
    setItem(_key: string, _value: string): void | Promise<void>

    /**
     * @summary Remove an item from storage.
     * @param _key - The key of the item to remove.
     */
    removeItem(_key: string): void | Promise<void>
}
