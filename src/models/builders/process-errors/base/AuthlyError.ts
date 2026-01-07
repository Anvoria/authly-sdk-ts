/**
 * @summary Base exception for all Authly errors.
 */
abstract class AuthlyError extends Error {
    /**
     * @summary Constructs a new AuthlyError.
     * @param message - The error message.
     */
    public constructor(message: string) {
        super(message)
        this.name = "AuthlyError"
        Object.setPrototypeOf(this, AuthlyError.prototype)
    }
}

export { AuthlyError }
