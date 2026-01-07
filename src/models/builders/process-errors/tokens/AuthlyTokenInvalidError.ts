import { AuthlyTokenError } from "../base/AuthlyTokenError"

/**
 * @summary Exception raised when a token is invalid.
 * @throws This error is thrown when:
 * - The token has an invalid signature.
 * - The token has an invalid format.
 * - The token has an invalid issuer or audience.
 */
class AuthlyTokenInvalidError extends AuthlyTokenError {
    /**
     * @summary Constructs a new AuthlyTokenInvalidError.
     * @param message - The error message.
     */
    public constructor(message: string) {
        super(message)
        this.name = "AuthlyTokenInvalidError"
        Object.setPrototypeOf(this, AuthlyTokenInvalidError.prototype)
    }
}

export { AuthlyTokenInvalidError }
