import { AuthlyError } from "./AuthlyError"

/**
 * @summary Base exception for all Authly token errors.
 */
abstract class AuthlyTokenError extends AuthlyError {
    /**
     * @summary Constructs a new AuthlyTokenError.
     * @param message - The error message.
     */
    public constructor(message: string) {
        super(message)
        this.name = "AuthlyTokenError"
        Object.setPrototypeOf(this, AuthlyTokenError.prototype)
    }
}

export { AuthlyTokenError }
