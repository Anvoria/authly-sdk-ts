/**
 * @summary Represents the user profile information returned by Authly.
 */
export interface IUserProfile {
    /**
     * @summary The unique identifier for the user.
     */
    sub: string
    /**
     * @summary The user's email address.
     */
    email?: string
    /**
     * @summary Whether the user's email address has been verified.
     */
    email_verified?: boolean
    /**
     * @summary The user's full name.
     */
    name?: string
    /**
     * @summary The user's given (first) name.
     */
    given_name?: string
    /**
     * @summary The user's family (last) name.
     */
    family_name?: string
    /**
     * @summary The user's preferred username.
     */
    preferred_username?: string
    /**
     * @summary The user's permissions in Authly.
     * @description A record where keys are resource names and values are bitmask integers.
     */
    permissions?: Record<string, number>
    /**
     * @summary Additional custom claims.
     */
    [key: string]: unknown
}
