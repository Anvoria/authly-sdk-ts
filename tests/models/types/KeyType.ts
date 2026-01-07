import { generateKeyPair } from "jose"

/**
 * @summary The type of a key.
 */
type KeyType = Awaited<ReturnType<typeof generateKeyPair>>["publicKey"]

export type { KeyType }
