/**
 * @summary Options for initializing the AuthlyClient.
 */
interface IAuthlyClientOptions {
    /**
     * @summary The base URL of the identity provider.
     * @example "https://auth.example.com"
     */
    readonly issuer: string
    /**
     * @summary The expected audience claim (aud) in the token.
     * @example "https://app.example.com"
     */
    readonly audience: string
    /**
     * @summary The ID of the service in Authly.
     * @example "1234567890"
     */
    readonly serviceId: string
    /**
     * @summary The path to the JWKS endpoint relative to the issuer.
     * @example "/.well-known/jwks.json"
     * @default "/.well-known/jwks.json"
     */
    readonly jwksPath?: string
    /**
     * @summary The path to the authorize endpoint relative to the issuer.
     * @example "/v1/oauth/authorize"
     * @default "/authorize"
     */
    readonly authorizePath?: string
    /**
     * @summary A list of allowed signing algorithms.
     * @example ["RS256"]
     * @default ["RS256"]
     */
    readonly algorithms?: string[]
}

export type { IAuthlyClientOptions }
