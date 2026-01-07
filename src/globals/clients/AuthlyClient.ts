import { JWTVerifier } from "../internal/JWTVerifier"
import { AuthlyConfiguration } from "../configuration/AuthlyConfiguration"
import type { IAuthlyClientOptions } from "../../models/globals/clients/interfaces/IAuthlyClientOptions"
import type { IAuthorizeUrlOptions } from "../../models/globals/clients/interfaces/IAuthorizeUrlOptions"
import type { IDecodedTokenClaim } from "../../models/globals/clients/interfaces/IDecodedTokenClaim"

/**
 * @summary A client for interacting with Authly.
 * @description This client handles the validation of tokens against a specific issuer and audience,
 * fetching the public keys (JWKS) automatically, and provides utilities for
 * starting the OAuth2 flow.
 */
class AuthlyClient {
    /**
     * @summary The JWT verifier for the client.
     */
    private readonly verifier: JWTVerifier
    /**
     * @summary The service ID of the client.
     */
    private readonly serviceId: string
    /**
     * @summary The issuer of the client.
     */
    private readonly issuer: string
    /**
     * @summary The authorize path of the client.
     */
    private readonly authorizePath: string

    /**
     * @summary Constructs a new AuthlyClient.
     * @param options - The options for the client.
     */
    public constructor(options: IAuthlyClientOptions) {
        this.issuer = options.issuer.replace(/\/$/, "")
        this.serviceId = options.serviceId
        this.authorizePath = options.authorizePath || AuthlyConfiguration.DEFAULT_AUTHORIZE_PATH
        this.verifier = new JWTVerifier({
            issuer: this.issuer,
            audience: options.audience,
            jwksUrl: `${this.issuer}${options.jwksPath || AuthlyConfiguration.DEFAULT_JWKS_PATH}`,
            algorithms: options.algorithms,
        })
    }

    /**
     * @summary Generate the authorization URL to redirect the user to.
     * @param options - Options for generating the URL.
     * @returns The full authorization URL.
     */
    public getAuthorizeUrl(options: IAuthorizeUrlOptions): string {
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
     * @summary Verify a JWT token and return its decoded claims.
     * @description This method verifies the token's signature using the provider's JWKS,
     * and validates standard claims like expiration, issuer, and audience.
     * @param token - The encoded JWT token string.
     * @returns A promise that resolves to the token claims (e.g., sub, iss, aud).
     * @throws {AuthlyTokenExpiredError} If the token has expired.
     * @throws {AuthlyTokenInvalidError} If the token is invalid (e.g., bad signature, invalid audience).
     */
    public async verify(token: string): Promise<IDecodedTokenClaim> {
        return this.verifier.verify(token)
    }
}

export { AuthlyClient }
