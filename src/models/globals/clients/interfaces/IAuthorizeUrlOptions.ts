/**
 * @summary Options for generating an authorization URL.
 */
interface IAuthorizeUrlOptions {
    /**
     * @summary The URI to redirect back to after authentication.
     * @example "https://app.example.com/callback"
     */
    readonly redirectUri: string
    /**
     * @summary A unique state string to prevent CSRF.
     * @example "1234567890"
     */
    readonly state: string
    /**
     * @summary The PKCE code challenge.
     * @example "1234567890"
     */
    readonly codeChallenge: string
    /**
     * @summary The PKCE code challenge method.
     * @example "S256"
     */
    readonly codeChallengeMethod?: "S256" | "plain"
    /**
     * @summary The requested scopes.
     * @example "openid profile email"
     */
    readonly scope?: string
    /**
     * @summary The OAuth2 response type.
     * @example "code"
     */
    readonly responseType?: string
}

export type { IAuthorizeUrlOptions }
