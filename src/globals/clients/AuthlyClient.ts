import { JWTVerifier } from "../internal/JWTVerifier"
import { HttpClient } from "../internal/HttpClient"
import { PKCEUtils } from "../internal/PKCEUtils"
import { AuthlyConfiguration } from "../configuration/AuthlyConfiguration"
import type { IAuthlyClientOptions } from "../../models/globals/clients/interfaces/IAuthlyClientOptions"
import type { IAuthorizeUrlOptions } from "../../models/globals/clients/interfaces/IAuthorizeUrlOptions"
import type { IDecodedTokenClaim } from "../../models/globals/clients/interfaces/IDecodedTokenClaim"
import type { ITokenResponse } from "../../models/globals/clients/interfaces/ITokenResponse"
import type { IAuthlyStorage } from "../../models/globals/clients/interfaces/IAuthlyStorage"

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
     * @summary The token path of the client.
     */
    private readonly tokenPath: string
    /**
     * @summary The redirect URI for the client.
     */
    private readonly redirectUri?: string
    /**
     * @summary The storage implementation.
     */
    private readonly storage?: IAuthlyStorage

    /**
     * @summary Constructs a new AuthlyClient.
     * @param options - The options for the client.
     */
    public constructor(options: IAuthlyClientOptions) {
        this.issuer = options.issuer.replace(/\/$/, "")
        this.serviceId = options.serviceId
        this.authorizePath = options.authorizePath || AuthlyConfiguration.DEFAULT_AUTHORIZE_PATH
        this.tokenPath = options.tokenPath || AuthlyConfiguration.DEFAULT_TOKEN_PATH
        this.redirectUri = options.redirectUri
        this.storage = options.storage

        if (!this.storage && typeof window !== "undefined" && window.sessionStorage) {
            this.storage = window.sessionStorage
        }

        this.verifier = new JWTVerifier({
            issuer: this.issuer,
            audience: options.audience,
            jwksUrl: `${this.issuer}${options.jwksPath || AuthlyConfiguration.DEFAULT_JWKS_PATH}`,
            algorithms: options.algorithms,
        })
    }

    /**
     * @summary Prepares the authorization request, stores PKCE state, and returns the URL.
     * @param options - Optional overrides for the authorization request.
     * @returns A promise that resolves to the authorization URL.
     */
    public async authorize(options?: Partial<IAuthorizeUrlOptions>): Promise<string> {
        if (!this.storage) {
            throw new Error("Storage is not configured. Cannot save state and code verifier.")
        }

        if (!this.redirectUri && !options?.redirectUri) {
            throw new Error("Redirect URI is required but not configured.")
        }

        const state = options?.state || PKCEUtils.generateRandomString()
        const codeVerifier = PKCEUtils.generateRandomString()
        const codeChallenge = await PKCEUtils.generateCodeChallenge(codeVerifier)

        await this.storage.setItem("pkce_state", state)
        await this.storage.setItem("pkce_verifier", codeVerifier)

        return this.getAuthorizeUrl({
            redirectUri: this.redirectUri!,
            ...options,
            state,
            codeChallenge,
            codeChallengeMethod: "S256",
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
     * @summary Exchanges the authorization code for tokens using PKCE flow and state validation.
     * @description This method performs the full OAuth2/OIDC code exchange flow:
     * 1. Validates the state parameter against the stored state (anti-CSRF).
     * 2. Retrieves the stored code verifier.
     * 3. Exchanges the code for tokens.
     * 4. Clears the stored state and verifier.
     * @param urlParams - The URLSearchParams containing 'code' and 'state'.
     * @returns A promise that resolves to the token response.
     * @throws {Error} If state is invalid, code is missing, or storage is not configured.
     */
    public async exchangeToken(urlParams: URLSearchParams): Promise<ITokenResponse> {
        const code = urlParams.get("code")
        const state = urlParams.get("state")

        if (!code) {
            throw new Error("No authorization code found in URL parameters.")
        }

        if (!this.storage) {
            throw new Error("Storage is not configured. Cannot retrieve state and code verifier.")
        }

        const storedState = await this.storage.getItem("pkce_state")
        if (!state || state !== storedState) {
            throw new Error("Invalid state. Possible CSRF attack.")
        }

        const codeVerifier = await this.storage.getItem("pkce_verifier")
        if (!codeVerifier) {
            throw new Error("No code verifier found in storage.")
        }

        if (!this.redirectUri) {
            throw new Error("Redirect URI is not configured in AuthlyClient options.")
        }

        const tokenResponse = await this.exchangeCodeForToken(code, this.redirectUri, codeVerifier)

        await this.storage.removeItem("pkce_state")
        await this.storage.removeItem("pkce_verifier")

        return tokenResponse
    }

    /**
     * @summary Exchange the authorization code for an access token.
     * @param code - The authorization code received from the callback.
     * @param redirectUri - The redirect URI used in the authorize request.
     * @param codeVerifier - The PKCE code verifier (required if used in authorize).
     * @returns A promise that resolves to the token response.
     */
    public async exchangeCodeForToken(
        code: string,
        redirectUri: string,
        codeVerifier?: string,
    ): Promise<ITokenResponse> {
        const url = `${this.issuer}${this.tokenPath}`
        const body: Record<string, string> = {
            grant_type: "authorization_code",
            client_id: this.serviceId,
            code,
            redirect_uri: redirectUri,
        }

        if (codeVerifier) {
            body.code_verifier = codeVerifier
        }

        const response = await HttpClient.post<ITokenResponse>(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(body).toString(),
        })

        if (!response.success) {
            throw new Error(response.error?.message || "Failed to exchange code for token")
        }

        return response.data!
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
