import { describe, it } from "node:test"
import assert from "node:assert"
import { AuthlyClient } from "../src/globals/clients/AuthlyClient"

describe("AuthlyClient", () => {
    const options = {
        issuer: "https://auth.example.com",
        audience: "test-audience",
        serviceId: "test-service-id",
    }

    it("should generate a correct authorization URL with default values", () => {
        const client = new AuthlyClient(options)
        const authorizeUrl = client.getAuthorizeUrl({
            redirectUri: "https://app.example.com/callback",
            state: "test-state",
            codeChallenge: "test-challenge",
        })

        const url = new URL(authorizeUrl)
        assert.strictEqual(url.origin, "https://auth.example.com")
        assert.strictEqual(url.pathname, "/authorize")
        assert.strictEqual(url.searchParams.get("client_id"), "test-service-id")
        assert.strictEqual(url.searchParams.get("redirect_uri"), "https://app.example.com/callback")
        assert.strictEqual(url.searchParams.get("response_type"), "code")
        assert.strictEqual(url.searchParams.get("scope"), "openid profile email")
        assert.strictEqual(url.searchParams.get("state"), "test-state")
        assert.strictEqual(url.searchParams.get("code_challenge"), "test-challenge")
        assert.strictEqual(url.searchParams.get("code_challenge_method"), "S256")
    })

    it("should allow overriding default authorize path", () => {
        const client = new AuthlyClient({
            ...options,
            authorizePath: "/custom/authorize",
        })
        const authorizeUrl = client.getAuthorizeUrl({
            redirectUri: "https://app.example.com/callback",
            state: "test-state",
            codeChallenge: "test-challenge",
        })

        const url = new URL(authorizeUrl)
        assert.strictEqual(url.pathname, "/custom/authorize")
    })

    it("should allow overriding default scope and response type", () => {
        const client = new AuthlyClient(options)
        const authorizeUrl = client.getAuthorizeUrl({
            redirectUri: "https://app.example.com/callback",
            state: "test-state",
            codeChallenge: "test-challenge",
            scope: "openid custom",
            responseType: "token",
            codeChallengeMethod: "plain",
        })

        const url = new URL(authorizeUrl)
        assert.strictEqual(url.searchParams.get("scope"), "openid custom")
        assert.strictEqual(url.searchParams.get("response_type"), "token")
        assert.strictEqual(url.searchParams.get("code_challenge_method"), "plain")
    })
})
