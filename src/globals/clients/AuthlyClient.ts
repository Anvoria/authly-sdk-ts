import { decodeJwt } from "jose"
import { JWTVerifier } from "../internal/JWTVerifier"
import { HttpClient } from "../internal/HttpClient"
import { PKCEUtils } from "../internal/PKCEUtils"
import { AuthlyConfiguration } from "../configuration/AuthlyConfiguration"
import type { IAuthlyClientOptions } from "../../models/globals/clients/interfaces/IAuthlyClientOptions"
import type { IAuthorizeUrlOptions } from "../../models/globals/clients/interfaces/IAuthorizeUrlOptions"
import type { IDecodedTokenClaim } from "../../models/globals/clients/interfaces/IDecodedTokenClaim"
import type { ITokenResponse } from "../../models/globals/clients/interfaces/ITokenResponse"
import type { IAuthlyStorage } from "../../models/globals/clients/interfaces/IAuthlyStorage"
import type { IUserProfile } from "../../models/globals/clients/interfaces/IUserProfile"

/**
 * @summary A client for interacting with Authly.
 * @description This client handles the validation of tokens against a specific issuer and audience,
 * fetching the public keys (JWKS) automatically, and provides utilities for
 * starting the OAuth2 flow.
 */
class AuthlyClient {
    private static readonly ACCESS_TOKEN_KEY = "authly_access_token"
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
     * @summary The user info path of the client.
     */
    private readonly userInfoPath: string
    /**
     * @summary The redirect URI for the client.
     */
    private readonly redirectUri?: string
    /**
     * @summary The storage implementation.
     */
    private readonly storage?: IAuthlyStorage
    /**
     * @summary Memory cache for the access token.
     */
    private accessToken: string | null = null

    /**
     * @summary Constructs a new AuthlyClient.
     * @param options - The options for the client.
     */
    public constructor(options: IAuthlyClientOptions) {
        this.issuer = options.issuer.replace(/\/$/, "")
        this.serviceId = options.serviceId
        this.authorizePath = options.authorizePath || AuthlyConfiguration.DEFAULT_AUTHORIZE_PATH
        this.tokenPath = options.tokenPath || AuthlyConfiguration.DEFAULT_TOKEN_PATH
        this.userInfoPath = options.userInfoPath || AuthlyConfiguration.DEFAULT_USER_INFO_PATH
        this.redirectUri = options.redirectUri
        this.storage = options.storage

        if (!this.storage && typeof window !== "undefined" && window.sessionStorage) {
            this.storage = window.sessionStorage as unknown as IAuthlyStorage
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
            redirectUri: (options?.redirectUri || this.redirectUri)!,
            ...options,
            state,
            codeChallenge,
            codeChallengeMethod: "s256",
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
     * @param urlParams - The URLSearchParams containing 'code' and 'state'.
     * @returns A promise that resolves to the token response.
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

        await this.setSession(tokenResponse)

        // Clear temporary storage
        await this.storage.removeItem("pkce_state")
        await this.storage.removeItem("pkce_verifier")

        return tokenResponse
    }

    /**
     * @summary Set the current session.
     * @param response - The token response from Authly.
     */
    public async setSession(response: ITokenResponse): Promise<void> {
        this.accessToken = response.access_token
        if (this.storage) {
            await this.storage.setItem(AuthlyClient.ACCESS_TOKEN_KEY, response.access_token)
        }
    }

    /**
     * @summary Get the current access token.
     * @returns The access token or null if not found.
     */
    public async getAccessToken(): Promise<string | null> {
        if (this.accessToken) return this.accessToken

        if (this.storage) {
            this.accessToken = await this.storage.getItem(AuthlyClient.ACCESS_TOKEN_KEY)
        }

        return this.accessToken
    }

    /**
     * @summary Refreshes the access token using the refresh_token grant.
     * @description In the browser, this relies on the 'session' cookie if no explicit refresh token is provided.
     * @param refreshToken - Optional explicit refresh token.
     * @returns A promise that resolves to the new access token.
     */
    public async refreshToken(refreshToken?: string): Promise<string | null> {
        const url = `${this.issuer}${this.tokenPath}`
        const body: Record<string, string> = {
            grant_type: "refresh_token",
            client_id: this.serviceId,
        }

        if (refreshToken) {
            body.refresh_token = refreshToken
        }

        const response = await HttpClient.post<ITokenResponse>(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(body).toString(),
        })

        if (!response.success) {
            return null
        }

        await this.setSession(response.data!)
        return response.data!.access_token
    }

    /**
     * @summary Fetches the user profile from the userinfo endpoint.
     * @description Automatically handles token expiration by attempting to refresh the token once.
     * @returns A promise that resolves to the user profile or null if not authenticated.
     */
    public async getUser(): Promise<IUserProfile | null> {
        let token = await this.getAccessToken()
        if (!token) return null

        const fetchInfo = async (currentBuffer: string) => {
            return HttpClient.get<IUserProfile>(`${this.issuer}${this.userInfoPath}`, {
                headers: {
                    Authorization: `Bearer ${currentBuffer}`,
                },
            })
        }

        let response = await fetchInfo(token)

        // If unauthorized (401), try to refresh token once
        if (!response.success && response.error?.code === "UNAUTHORIZED") {
            token = await this.refreshToken()
            if (token) {
                response = await fetchInfo(token)
            }
        }

        if (!response.success) {
            if (response.error?.code === "UNAUTHORIZED") {
                await this.logout()
            }
            return null
        }

        return response.data!
    }

    /**
     * @summary Synchronously check if the user is authenticated based on token presence and expiration.
     * @description This only checks the token locally and does not perform a network request.
     * @returns True if a valid token exists and is not expired.
     */
    public async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken()
        if (!token) return false

        try {
            const decoded = decodeJwt(token)
            if (!decoded.exp) return true

            const now = Math.floor(Date.now() / 1000)
            return decoded.exp > now + 10
        } catch {
            return false
        }
    }

    /**
     * @summary Logs out the user by clearing the session from storage and memory.
     */
    public async logout(): Promise<void> {
        this.accessToken = null
        if (this.storage) {
            await this.storage.removeItem(AuthlyClient.ACCESS_TOKEN_KEY)
        }
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
