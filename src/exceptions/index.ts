/**
 * Base exception for all Authly errors.
 */
export class AuthlyError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthlyError"
    }
}

/**
 * Base exception for all token errors.
 */
export class TokenError extends AuthlyError {
    constructor(message: string) {
        super(message)
        this.name = "TokenError"
    }
}

/**
 * Exception raised when a token is invalid:
 * - bad signature
 * - bad format
 * - bad iss / aud
 */
export class TokenInvalidError extends TokenError {
    constructor(message: string) {
        super(message)
        this.name = "TokenInvalidError"
    }
}

/**
 * Exception raised when a token is expired.
 */
export class TokenExpiredError extends TokenError {
    constructor(message: string) {
        super(message)
        this.name = "TokenExpiredError"
    }
}
