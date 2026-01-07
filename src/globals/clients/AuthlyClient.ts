import { JWTVerifier } from "./internal/JWTVerifier"
import type { Claims } from "../../models/Claims"
import { AuthlyConfiguration } from "../../AuthlyConfiguration"

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
     * The path to the authorize endpoint relative to the issuer. Defaults to "/v1/oauth/authorize".
     */
    authorizePath?: string
    /**
     * A list of allowed signing algorithms. If omitted, defaults to ["RS256"].
     */
    algorithms?: string[]
}

/**
 * Options for generating an authorization URL.
 */
export interface AuthorizeUrlOptions {
    /**
     * The URI to redirect back to after authentication.
     */
    redirectUri: string
    /**
     * A unique state string to prevent CSRF.
     */
    state: string
    /**
     * The PKCE code challenge.
     */
    codeChallenge: string
    /**
     * The PKCE code challenge method. Defaults to "S256".
     */
    codeChallengeMethod?: "S256" | "plain"
    /**
     * The requested scopes. Defaults to "openid profile email".
     */
    scope?: string
    /**
     * The OAuth2 response type. Defaults to "code".
     */
    responseType?: string
}

/**
 * A client for interacting with Authly.
 *
 * This client handles the validation of tokens against a specific issuer and audience,
 * fetching the public keys (JWKS) automatically, and provides utilities for
 * starting the OAuth2 flow.
 */
export class AuthlyClient {
    private readonly verifier: JWTVerifier
    private readonly serviceId: string
    private readonly issuer: string
    private readonly authorizePath: string

    constructor(options: AuthlyClientOptions) {
        this.issuer = options.issuer.replace(/\/$/, "")
        this.serviceId = options.serviceId
        const jwksPath = options.jwksPath || AuthlyConfiguration.DEFAULT_JWKS_PATH
        this.authorizePath = options.authorizePath || AuthlyConfiguration.DEFAULT_AUTHORIZE_PATH

        this.verifier = new JWTVerifier({
            issuer: this.issuer,
            audience: options.audience,
            jwksUrl: `${this.issuer}${jwksPath}`,
            algorithms: options.algorithms,
        })
    }

    /**
     * Generate the authorization URL to redirect the user to.
     *
     * @param options - Options for generating the URL.
     * @returns The full authorization URL.
     */
    public getAuthorizeUrl(options: AuthorizeUrlOptions): string {
        const url = new URL(`${this.issuer}${this.authorizePath}`)

        url.searchParams.set("client_id", this.serviceId)
        url.searchParams.set("redirect_uri", options.redirectUri)
        url.searchParams.set("response_type", options.responseType || "code")
        url.searchParams.set("scope", options.scope || "openid profile email")
        url.searchParams.set("state", options.state)
        url.searchParams.set("code_challenge", options.codeChallenge)
        url.searchParams.set("code_challenge_method", options.codeChallengeMethod || "s256")

        return url.toString()
    }

    /**
     * Verify a JWT token and return its decoded claims.
     *
     * This method verifies the token's signature using the provider's JWKS,
     * and validates standard claims like expiration, issuer, and audience.
     *
     * @param token - The encoded JWT token string.
     * @returns A promise that resolves to the token claims (e.g., sub, iss, aud).
     * @throws {AuthlyTokenExpiredError} If the token has expired.
     * @throws {AuthlyTokenInvalidError} If the token is invalid (e.g., bad signature, invalid audience).
     */
    public async verify(token: string): Promise<Claims> {
        return this.verifier.verify(token)
    }
}
