import type { IAuthlyStorage } from "./IAuthlyStorage"

/**
 * @summary Options for initializing the AuthlyClient.
 */
interface IAuthlyClientOptions {
    /**
     * @summary The base URL of the identity provider.
     * @description Used for token validation (iss claim). If paths are relative, they are appended to this URL (or baseUrl if provided).
     * @example "https://auth.example.com"
     */
    readonly issuer: string
    /**
     * @summary The base URL for API requests (optional).
     * @description Use this if your API is hosted on a different URL than the issuer.
     * @example "http://localhost:8000"
     */
    readonly baseUrl?: string
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
     * @summary The redirect URI to use for the authorization flow.
     * @example "https://app.example.com/api/auth/callback"
     */
    readonly redirectUri?: string
    /**
     * @summary The storage implementation to use for PKCE state and verifier.
     * @default localStorage (in browser)
     */
    readonly storage?: IAuthlyStorage
    /**
     * @summary The path or full URL to the JWKS endpoint.
     * @example "/.well-known/jwks.json" or "http://localhost:8000/.well-known/jwks.json"
     * @default "/.well-known/jwks.json"
     */
    readonly jwksPath?: string
    /**
     * @summary The path or full URL to the authorize endpoint.
     * @example "/authorize" or "http://localhost:3000/login"
     * @default "/authorize"
     */
    readonly authorizePath?: string
    /**
     * @summary The path or full URL to the token endpoint.
     * @example "/oauth/token" or "http://localhost:8000/oauth/token"
     * @default "/oauth2/token"
     */
    readonly tokenPath?: string
    /**
     * @summary The path or full URL to the user info endpoint.
     * @example "/v1/oauth/userinfo" or "http://localhost:8000/v1/oauth/userinfo"
     * @default "/v1/oauth/userinfo"
     */
    readonly userInfoPath?: string
    /**
     * @summary A list of allowed signing algorithms.
     * @example ["RS256"]
     * @default ["RS256"]
     */
    readonly algorithms?: string[]
}

export type { IAuthlyClientOptions }
