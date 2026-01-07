import { describe, it, before } from "node:test"
import assert from "node:assert"
import { generateKeyPair, type GenerateKeyPairResult, SignJWT } from "jose"
import { JWTVerifier } from "../src/globals/internal/JWTVerifier"
import { AuthlyTokenExpiredError } from "../src/models/builders/process-errors/tokens/AuthlyTokenExpiredError"
import { AuthlyTokenInvalidError } from "../src/models/builders/process-errors/tokens/AuthlyTokenInvalidError"
import type { KeyType } from "./models/types/KeyType"
import type { IDecodedTokenClaim } from "../src/models/globals/clients/interfaces/IDecodedTokenClaim"

describe("JWTVerifier", () => {
    let privateKey: KeyType, publicKey: KeyType, verifier: JWTVerifier
    const issuer: string = "https://auth.example.com"
    const audience: string = "test-audience"

    before(async (): Promise<void> => {
        const keys: GenerateKeyPairResult = await generateKeyPair("RS256")
        privateKey = keys.privateKey
        publicKey = keys.publicKey
        verifier = new JWTVerifier({
            issuer,
            audience,
            jwksUrl: "https://auth.example.com/.well-known/jwks.json",
            jwks: async () => publicKey,
        })
    })

    it("Should successfully verify a valid token", async (): Promise<void> => {
        const token: string = await new SignJWT({
            sub: "user123",
            sid: "session123",
            permissions: { read: 1 },
        })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime("1h")
            .sign(privateKey)

        const claims: IDecodedTokenClaim = await verifier.verify(token)
        assert.strictEqual(claims.sub, "user123")
        assert.strictEqual(claims.sid, "session123")
        assert.strictEqual(claims.iss, issuer)
        assert.deepStrictEqual(claims.aud, audience)
    })

    it("Should throw AuthlyTokenExpiredError for expired token", async (): Promise<void> => {
        const token: string = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime("-1s")
            .sign(privateKey)

        await assert.rejects(
            async (): Promise<IDecodedTokenClaim> => await verifier.verify(token),
            (err: unknown): err is AuthlyTokenExpiredError =>
                err instanceof AuthlyTokenExpiredError && err.message === "Token has expired",
        )
    })

    it("Should throw AuthlyTokenInvalidError for invalid audience", async (): Promise<void> => {
        const token: string = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience("wrong-audience")
            .setExpirationTime("1h")
            .sign(privateKey)

        await assert.rejects(
            async (): Promise<IDecodedTokenClaim> => await verifier.verify(token),
            (err: unknown): err is AuthlyTokenInvalidError =>
                err instanceof AuthlyTokenInvalidError && err.message.includes("aud"),
        )
    })

    it("Should throw AuthlyTokenInvalidError for invalid issuer", async (): Promise<void> => {
        const token: string = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer("https://wrong.com")
            .setAudience(audience)
            .setExpirationTime("1h")
            .sign(privateKey)

        await assert.rejects(
            async (): Promise<IDecodedTokenClaim> => await verifier.verify(token),
            (err: unknown): err is AuthlyTokenInvalidError =>
                err instanceof AuthlyTokenInvalidError && err.message.includes("iss"),
        )
    })

    it("Should throw AuthlyTokenInvalidError for wrong signature", async (): Promise<void> => {
        const otherKeys: GenerateKeyPairResult = await generateKeyPair("RS256")
        const token: string = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime("1h")
            .sign(otherKeys.privateKey)

        await assert.rejects(
            async (): Promise<IDecodedTokenClaim> => await verifier.verify(token),
            (err: unknown): err is AuthlyTokenInvalidError =>
                err instanceof AuthlyTokenInvalidError && err.message.includes("signature"),
        )
    })
})
