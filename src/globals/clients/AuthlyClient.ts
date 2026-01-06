import { DEFAULT_JWKS_PATH } from "../../config"
import { JWTVerifier } from "./internal/JWTVerifier"
import type { Claims } from "../../models/Claims"

/**
 * Options for initializing the AuthlyClient.
 */
export interface AuthlyClientOptions {
    /**
     * The base URL of the identity provider (e.g., "https://auth.example.com").
     */
    issuer: string
    /**
     * The expected audience claim (aud) in the token.
     */
    audience: string
    /**
     * The ID of the service in Authly.
     */
    serviceId: string
    /**
     * The path to the JWKS endpoint relative to the issuer. Defaults to "/.well-known/jwks.json".
     */
    jwksPath?: string
    /**
     * A list of allowed signing algorithms. If omitted, defaults to ["RS256"].
     */
    algorithms?: string[]
}

/**
 * A client for verifying Authly JWT tokens.
 *
 * This client handles the validation of tokens against a specific issuer and audience,
 * fetching the public keys (JWKS) automatically.
 */
export class AuthlyClient {
    private readonly verifier: JWTVerifier
    private readonly serviceId: string
    private readonly issuer: string

    constructor(options: AuthlyClientOptions) {
        this.issuer = options.issuer.replace(/\/$/, "")
        this.serviceId = options.serviceId
        const jwksPath = options.jwksPath || DEFAULT_JWKS_PATH

        this.verifier = new JWTVerifier({
            issuer: this.issuer,
            audience: options.audience,
            jwksUrl: `${this.issuer}${jwksPath}`,
            algorithms: options.algorithms,
        })
    }

    /**
     * Verify a JWT token and return its decoded claims.
     *
     * This method verifies the token's signature using the provider's JWKS,
     * and validates standard claims like expiration, issuer, and audience.
     *
     * @param token - The encoded JWT token string.
     * @returns A promise that resolves to the token claims (e.g., sub, iss, aud).
     * @throws {TokenExpiredError} If the token has expired.
     * @throws {TokenInvalidError} If the token is invalid (e.g., bad signature, invalid audience).
     */
    public async verify(token: string): Promise<Claims> {
        return this.verifier.verify(token)
    }
}
