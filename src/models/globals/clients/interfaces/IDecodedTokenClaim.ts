/**
 * @summary Interface for decoded token claims.
 */
interface IDecodedTokenClaim {
    /**
     * @summary Subject identifier - the unique ID of the user.
     * @example "1234567890"
     */
    readonly sub: string
    /**
     * @summary Issuer identifier - the URL of the identity provider.
     * @example "https://auth.example.com"
     */
    readonly iss: string
    /**
     * @summary Audience(s) for which the token is intended.
     * @example "https://app.example.com"
     * @example ["https://app.example.com", "https://app.example.com/api"]
     */
    readonly aud: string | string[]
    /**
     * @summary Expiration time (Unix timestamp).
     * @example 1715145600
     */
    readonly exp: number
    /**
     * @summary Issued at time (Unix timestamp).
     * @example 1715145600
     */
    readonly iat: number
    /**
     * @summary Session ID identifier.
     * @example "1234567890"
     */
    readonly sid: string
    /**
     * @summary Dictionary of permissions granted to the user, where keys are resource names and values are permission levels.
     * @example
     * ```json
     * {
     *     "read": 1,
     *     "write": 0
     * }
     * ```
     */
    readonly permissions: Record<string, number>
    /**
     * @summary Permission version.
     * @example 1
     */
    readonly pver?: number
    /**
     * @summary Space-separated list of scopes.
     * @example "openid profile email"
     */
    readonly scope?: string
    /**
     * @summary Allow additional claims.
     * @example
     * ```json
     * {
     *     "custom": "custom-value"
     * }
     * ```
     */
    readonly [key: string]: unknown
}

export type { IDecodedTokenClaim }
