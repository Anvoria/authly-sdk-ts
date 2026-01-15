"use client"

import React, { useEffect, useRef } from "react"
import { useAuthly } from "./AuthlyContext"

interface AuthlyCallbackProps {
    /**
     * @summary The URL to redirect to after successful login.
     * @default "/"
     */
    onSuccess?: string
    /**
     * @summary The URL to redirect to after failed login.
     * @default "/login"
     */
    onFailure?: string
    /**
     * @summary Optional custom navigation function (e.g. router.push from Next.js or navigate from React Router).
     * @description If not provided, window.location.href will be used.
     */
    navigate?: (path: string) => void
}

export const AuthlyCallback: React.FC<AuthlyCallbackProps> = ({ onSuccess = "/", onFailure = "/login", navigate }) => {
    const { client, refresh } = useAuthly()
    const processedRef = useRef(false)

    useEffect(() => {
        const handleCallback = async () => {
            if (processedRef.current) return
            processedRef.current = true

            const params = new URLSearchParams(window.location.search)
            const code = params.get("code")
            const state = params.get("state")

            console.log("[AuthlyCallback] Processing callback...", { code: !!code, state: !!state })

            if (!code || !state) {
                console.warn("[AuthlyCallback] Missing code or state parameters.")
                return
            }

            try {
                console.log("[AuthlyCallback] Exchanging token...")
                await client.exchangeToken(params)
                console.log("[AuthlyCallback] Token exchanged successfully.")

                await refresh()

                if (navigate) {
                    navigate(onSuccess)
                } else {
                    window.location.href = onSuccess
                }
            } catch (error) {
                console.error("Authly callback failed:", error)
                if (navigate) {
                    navigate(onFailure)
                } else {
                    window.location.href = onFailure
                }
            }
        }

        handleCallback()
    }, [client, onSuccess, onFailure, navigate, refresh])

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>Authenticating...</p>
        </div>
    )
}
