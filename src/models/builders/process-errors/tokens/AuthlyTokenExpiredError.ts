import { AuthlyTokenError } from "../base/AuthlyTokenError"

/**
 * @summary Exception raised when a token is expired.
 * @throws This error is thrown when the token's expiration time is in the past.
 */
class AuthlyTokenExpiredError extends AuthlyTokenError {
    /**
     * @summary Constructs a new AuthlyTokenExpiredError.
     * @param message - The error message.
     */
    public constructor(message: string) {
        super(message)
        this.name = "AuthlyTokenExpiredError"
        Object.setPrototypeOf(this, AuthlyTokenExpiredError.prototype)
    }
}

export { AuthlyTokenExpiredError }
