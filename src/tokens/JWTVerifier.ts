import { createRemoteJWKSet, jwtVerify } from "jose"
import type { JWTVerifyGetKey, JWTVerifyOptions } from "jose"
import { DEFAULT_ALGORITHMS } from "../config"
import { TokenExpiredError, TokenInvalidError } from "../exceptions"
import type { Claims } from "../types/Claims"

/**
 * Internal class for verifying JWT tokens using jose.
 */
export class JWTVerifier {
    private readonly issuer: string
    private readonly audience: string
    private readonly algorithms: string[]
    private readonly JWKS: JWTVerifyGetKey

    constructor(params: {
        issuer: string
        audience: string
        jwksUrl: string
        algorithms?: string[]
        jwks?: JWTVerifyGetKey
    }) {
        this.issuer = params.issuer
        this.audience = params.audience
        this.algorithms = params.algorithms || DEFAULT_ALGORITHMS

        this.JWKS = params.jwks || createRemoteJWKSet(new URL(params.jwksUrl))
    }

    /**
     * Verify the JWT token and return its claims.
     * @param token - The encoded JWT token string.
     * @returns The decoded claims from the token.
     * @throws {TokenExpiredError} If the token's exp claim is in the past.
     * @throws {TokenInvalidError} If the token is otherwise invalid.
     */
    public async verify(token: string): Promise<Claims> {
        try {
            const options: JWTVerifyOptions = {
                issuer: this.issuer,
                audience: this.audience,
                algorithms: this.algorithms,
            }

            const { payload } = await jwtVerify(token, this.JWKS, options)

            return payload as unknown as Claims
        } catch (error: unknown) {
            if (error instanceof Error) {
                const code = (error as { code?: string }).code

                if (code === "ERR_JWT_EXPIRED") {
                    throw new TokenExpiredError("Token has expired")
                }

                if (
                    code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
                    code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
                    code === "ERR_JWS_INVALID" ||
                    code === "ERR_JWT_INVALID"
                ) {
                    throw new TokenInvalidError(error.message || "Token validation failed")
                }
            }

            throw new TokenInvalidError("Invalid token")
        }
    }
}
