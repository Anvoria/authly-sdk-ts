/**
 * @summary Utilities for PKCE (Proof Key for Code Exchange).
 */
export class PKCEUtils {
    /**
     * @summary Generate a random string for state or code verifier.
     * @param length - The length of the string.
     * @returns The generated string.
     */
    public static generateRandomString(length: number = 43): string {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
        let result = ""
        const randomValues = new Uint8Array(length)
        if (typeof window !== "undefined" && window.crypto) {
            window.crypto.getRandomValues(randomValues)
        } else {
            for (let i = 0; i < length; i++) {
                randomValues[i] = Math.floor(Math.random() * 256)
            }
        }

        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length]
        }
        return result
    }

    /**
     * @summary Generate the code challenge from the code verifier.
     * @param codeVerifier - The code verifier.
     * @returns A promise that resolves to the code challenge.
     */
    public static async generateCodeChallenge(codeVerifier: string): Promise<string> {
        const encoder = new TextEncoder()
        const data = encoder.encode(codeVerifier)

        if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", data)
            return this.base64URLEncode(hashBuffer)
        }

        // TODO: Add a fallback for non-browser environments. (crypto module)
        throw new Error("Crypto API is not available in this environment.")
    }

    /**
     * @summary Base64 URL encode a buffer.
     * @param buffer - The buffer to encode.
     * @returns The base64 URL encoded string.
     */
    private static base64URLEncode(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    }
}
