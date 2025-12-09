import type { IRequestResponseClient } from "../../models/globals/clients/interfaces/IRequestResponseClient"

/**
 * A class that provides a static method for making HTTP requests.
 */
class HttpClient {
    private constructor() {}

    /**
     * Makes a GET request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
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

    /**
     * Makes a POST request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
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

    /**
     * Makes a PUT request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
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

    /**
     * Makes a PATCH request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
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

    /**
     * Makes a DELETE request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
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
