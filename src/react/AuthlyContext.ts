"use client"

import { createContext, useContext } from "react"
import type { AuthlyClient } from "../globals/clients/AuthlyClient"
import type { IUserProfile } from "../models/globals/clients/interfaces/IUserProfile"

export interface IAuthlyContext {
    isAuthenticated: boolean
    isLoading: boolean
    user: IUserProfile | null
    /* eslint-disable no-unused-vars */
    login: (options?: Parameters<AuthlyClient["authorize"]>[0]) => Promise<void>
    logout: () => Promise<void>
    /**
     * @summary Manually refresh the session state (e.g. after callback).
     */
    refresh: () => Promise<void>
    client: AuthlyClient
}

export const AuthlyContext = createContext<IAuthlyContext | undefined>(undefined)

export const useAuthly = (): IAuthlyContext => {
    const context = useContext(AuthlyContext)
    if (!context) {
        throw new Error("useAuthly must be used within an AuthlyProvider")
    }
    return context
}
