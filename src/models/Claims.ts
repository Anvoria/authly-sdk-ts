/**
 * Decoded JWT claims found in an Authly token.
 *
 * This interface contains both standard OIDC claims and Authly-specific claims
 * like session ID (sid) and permissions.
 */
export interface Claims {
    /**
     * Subject identifier - the unique ID of the user.
     */
    sub: string

    /**
     * Issuer identifier - the URL of the identity provider.
     */
    iss: string

    /**
     * Audience(s) for which the token is intended.
     */
    aud: string | string[]

    /**
     * Expiration time (Unix timestamp).
     */
    exp: number

    /**
     * Issued at time (Unix timestamp).
     */
    iat: number

    /**
     * Session ID identifier.
     */
    sid: string

    /**
     * Dictionary of permissions granted to the user, where keys are resource names and values are permission levels.
     */
    permissions: Record<string, number>

    /**
     * Permission version.
     */
    pver?: number

    /**
     * Space-separated list of scopes.
     */
    scope?: string

    /**
     * Allow additional claims.
     */
    [key: string]: unknown
}
