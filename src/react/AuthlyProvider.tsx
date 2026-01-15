"use client"

import React, { useEffect, useState, useCallback, ReactNode } from "react"
import { AuthlyContext } from "./AuthlyContext"
import type { AuthlyClient } from "../globals/clients/AuthlyClient"
import type { IUserProfile } from "../models/globals/clients/interfaces/IUserProfile"

interface AuthlyProviderProps {
    client: AuthlyClient
    children: ReactNode
}

export const AuthlyProvider: React.FC<AuthlyProviderProps> = ({ client, children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<IUserProfile | null>(null)

    const checkSession = useCallback(async () => {
        try {
            const authenticated = await client.isAuthenticated()
            setIsAuthenticated(authenticated)

            if (authenticated) {
                const profile = await client.getUser()
                setUser(profile)
                if (!profile) {
                    setIsAuthenticated(false)
                }
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error("Authly session check failed:", error)
            setIsAuthenticated(false)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [client])

    useEffect(() => {
        checkSession()
    }, [checkSession])

    const login = useCallback(
        async (options?: Parameters<AuthlyClient["authorize"]>[0]) => {
            const url = await client.authorize(options)
            if (typeof window !== "undefined") {
                window.location.href = url
            }
        },
        [client],
    )

    const logout = useCallback(async () => {
        await client.logout()
        setIsAuthenticated(false)
        setUser(null)
        if (typeof window !== "undefined") {
        }
    }, [client])

    return (
        <AuthlyContext.Provider
            value={{ isAuthenticated, isLoading, user, login, logout, refresh: checkSession, client }}
        >
            {children}
        </AuthlyContext.Provider>
    )
}
