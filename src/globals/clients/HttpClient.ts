import type { IRequestResponseClient } from "../../models/globals/clients/interfaces/IRequestResponseClient"

class HttpClient {
    private constructor() {}

    public static async get<D, E>(
        url: string,
        options: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D, E>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                method: "GET",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (response.ok) {
                return {
                    success: true,
                    data: {
                        status: response.status,
                        data: await response.json(),
                    },
                }
            }

            return {
                success: false,
                error: new Error("Request failed."),
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: error as E,
            }
        }
    }

    public static async post<D, E>(
        url: string,
        options: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D, E>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                method: "POST",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (response.ok) {
                return {
                    success: true,
                    data: {
                        status: response.status,
                        data: await response.json(),
                    },
                }
            }

            return {
                success: false,
                error: new Error("Request failed."),
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: error as E,
            }
        }
    }

    public static async put<D, E>(
        url: string,
        options: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D, E>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                method: "PUT",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (response.ok) {
                return {
                    success: true,
                    data: {
                        status: response.status,
                        data: await response.json(),
                    },
                }
            }

            return {
                success: false,
                error: new Error("Request failed."),
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: error as E,
            }
        }
    }

    public static async patch<D, E>(
        url: string,
        options: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D, E>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                method: "PATCH",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (response.ok) {
                return {
                    success: true,
                    data: {
                        status: response.status,
                        data: await response.json(),
                    },
                }
            }

            return {
                success: false,
                error: new Error("Request failed."),
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: error as E,
            }
        }
    }

    public static async delete<D, E>(
        url: string,
        options: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D, E>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                method: "DELETE",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (response.ok) {
                return {
                    success: true,
                    data: {
                        status: response.status,
                        data: await response.json(),
                    },
                }
            }

            return {
                success: false,
                error: new Error("Request failed."),
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: error as E,
            }
        }
    }
}

export { HttpClient }
