import { createRemoteJWKSet, jwtVerify } from "jose"
import type { JWTVerifyGetKey } from "jose"
import type { IDecodedTokenClaim } from "../../../models/globals/clients/interfaces/IDecodedTokenClaim"
import { AuthlyTokenExpiredError } from "../../../models/builders/process-errors/tokens/AuthlyTokenExpiredError"
import { AuthlyTokenInvalidError } from "../../../models/builders/process-errors/tokens/AuthlyTokenInvalidError"
import { AuthlyConfiguration } from "../../../AuthlyConfiguration"
import type { IJWTVerifierOptions } from "../../../models/globals/clients/internal/interfaces/IJWTVerifierOptions"

/**
 * @summary Internal class for verifying JWT tokens using jose.
 */
class JWTVerifier {
    /**
     * @summary The issuer of the token.
     */
    private readonly issuer: string
    /**
     * @summary The audience of the token.
     */
    private readonly audience: string
    /**
     * @summary The algorithms to use for the token.
     */
    private readonly algorithms: string[]
    /**
     * @summary The JWKS to use for the token.
     */
    private readonly JWKS: JWTVerifyGetKey

    /**
     * @summary Constructs a new JWTVerifier.
     * @param params - The options for the JWTVerifier.
     */
    public constructor(params: IJWTVerifierOptions) {
        this.issuer = params.issuer
        this.audience = params.audience
        this.algorithms = params.algorithms || (AuthlyConfiguration.DEFAULT_ALGORITHMS as string[])
        this.JWKS = params.jwks || createRemoteJWKSet(new URL(params.jwksUrl))
    }

    /**
     * @summary Verify the JWT token and return its claims.
     * @param token - The encoded JWT token string.
     * @returns The decoded claims from the token.
     * @throws {AuthlyTokenExpiredError} If the token's exp claim is in the past.
     * @throws {AuthlyTokenInvalidError} If the token is otherwise invalid.
     */
    public async verify(token: string): Promise<IDecodedTokenClaim> {
        try {
            const { payload }: Readonly<{ payload: IDecodedTokenClaim }> = await jwtVerify(token, this.JWKS, {
                issuer: this.issuer,
                audience: this.audience,
                algorithms: this.algorithms,
            })

            return payload
        } catch (error: unknown) {
            if (error instanceof Error) {
                const code: string | undefined = (error as { code?: string }).code

                if (code === "ERR_JWT_EXPIRED") {
                    throw new AuthlyTokenExpiredError("Token has expired")
                }

                if (
                    code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
                    code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
                    code === "ERR_JWS_INVALID" ||
                    code === "ERR_JWT_INVALID"
                ) {
                    throw new AuthlyTokenInvalidError(error.message ?? "Token validation failed")
                }
            }

            throw new AuthlyTokenInvalidError("Invalid token")
        }
    }
}

export { JWTVerifier }
