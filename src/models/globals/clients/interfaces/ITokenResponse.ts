/**
 * @summary Interface for the token response.
 */
export interface ITokenResponse {
    /**
     * @summary The access token.
     */
    access_token: string
    /**
     * @summary The token type.
     */
    token_type: string
    /**
     * @summary The expiration time in seconds.
     */
    expires_in: number
    /**
     * @summary The refresh token.
     */
    refresh_token?: string
    /**
     * @summary The ID token.
     */
    id_token?: string
    /**
     * @summary The scope of the token.
     */
    scope?: string
}
