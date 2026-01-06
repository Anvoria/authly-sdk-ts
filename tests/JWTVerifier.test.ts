import { describe, it, before } from "node:test"
import assert from "node:assert"
import { generateKeyPair, SignJWT } from "jose"
import { JWTVerifier } from "../src/globals/clients/internal/JWTVerifier"
import { TokenExpiredError, TokenInvalidError } from "../src/exceptions"

describe("JWTVerifier", () => {
    type Key = Awaited<ReturnType<typeof generateKeyPair>>["publicKey"]
    let privateKey: Key
    let publicKey: Key
    let verifier: JWTVerifier
    const issuer = "https://auth.example.com"
    const audience = "test-audience"

    before(async () => {
        const keys = await generateKeyPair("RS256")
        privateKey = keys.privateKey
        publicKey = keys.publicKey

        verifier = new JWTVerifier({
            issuer,
            audience,
            jwksUrl: "https://auth.example.com/.well-known/jwks.json",
            jwks: async () => publicKey,
        })
    })

    it("should successfully verify a valid token", async () => {
        const token = await new SignJWT({
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

        const claims = await verifier.verify(token)

        assert.strictEqual(claims.sub, "user123")
        assert.strictEqual(claims.sid, "session123")
        assert.strictEqual(claims.iss, issuer)
        assert.deepStrictEqual(claims.aud, audience)
    })

    it("should throw TokenExpiredError for expired token", async () => {
        const token = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime("-1s")
            .sign(privateKey)

        await assert.rejects(
            async () => await verifier.verify(token),
            (err) => err instanceof TokenExpiredError && err.message === "Token has expired",
        )
    })

    it("should throw TokenInvalidError for invalid audience", async () => {
        const token = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience("wrong-audience")
            .setExpirationTime("1h")
            .sign(privateKey)

        await assert.rejects(
            async () => await verifier.verify(token),
            (err) => err instanceof TokenInvalidError && err.message.includes("aud"),
        )
    })

    it("should throw TokenInvalidError for invalid issuer", async () => {
        const token = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer("https://wrong.com")
            .setAudience(audience)
            .setExpirationTime("1h")
            .sign(privateKey)

        await assert.rejects(
            async () => await verifier.verify(token),
            (err) => err instanceof TokenInvalidError && err.message.includes("iss"),
        )
    })

    it("should throw TokenInvalidError for wrong signature", async () => {
        const otherKeys = await generateKeyPair("RS256")

        const token = await new SignJWT({ sub: "user123" })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime("1h")
            .sign(otherKeys.privateKey)

        await assert.rejects(
            async () => await verifier.verify(token),
            (err) => err instanceof TokenInvalidError && err.message.includes("signature"),
        )
    })
})
