import type { JWTVerifyGetKey } from "jose"

/**
 * @summary Options for the JWTVerifier class.
 */
interface IJWTVerifierOptions {
    /**
     * @summary The issuer of the token.
     * @example "https://auth.example.com"
     */
    readonly issuer: string
    /**
     * @summary The audience of the token.
     * @example "https://app.example.com"
     */
    readonly audience: string
    /**
     * @summary The URL of the JWKS endpoint.
     * @example "https://auth.example.com/.well-known/jwks.json"
     */
    readonly jwksUrl: string
    /**
     * @summary The algorithms to use for the token.
     * @example ["RS256", "ES256"]
     * @default ["RS256"]
     */
    readonly algorithms?: string[]
    /**
     * @summary The JWKS to use for the token.
     * @example async () => publicKey
     */
    readonly jwks?: JWTVerifyGetKey
}

export type { IJWTVerifierOptions }
