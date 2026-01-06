import type { IRequestResponseClient } from "../../models/globals/clients/interfaces/IRequestResponseClient"

/**
 * A class that provides a static method for making HTTP requests.
 */
class HttpClient {
    private constructor() {}

    /**
     * Makes an HTTP request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    private static async request<D>(url: string, options: RequestInit): Promise<IRequestResponseClient<D>> {
        try {
            const response: Response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...options.headers,
                },
            })

            return (await response.json()) as IRequestResponseClient<D>
        } catch (error: unknown) {
            return {
                success: false,
                error: {
                    code: "UNKNOWN_ERROR",
                    message: error instanceof Error ? error.message : "An unknown error occurred.",
                },
            }
        }
    }

    /**
     * Makes a GET request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    public static async get<D>(url: string, options?: Omit<RequestInit, "method">): Promise<IRequestResponseClient<D>> {
        return this.request<D>(url, {
            ...options,
            method: "GET",
        })
    }

    /**
     * Makes a POST request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    public static async post<D>(
        url: string,
        options?: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D>> {
        return this.request<D>(url, {
            ...options,
            method: "POST",
        })
    }

    /**
     * Makes a PUT request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    public static async put<D>(url: string, options?: Omit<RequestInit, "method">): Promise<IRequestResponseClient<D>> {
        return this.request<D>(url, {
            ...options,
            method: "PUT",
        })
    }

    /**
     * Makes a PATCH request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    public static async patch<D>(
        url: string,
        options?: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D>> {
        return this.request<D>(url, {
            ...options,
            method: "PATCH",
        })
    }

    /**
     * Makes a DELETE request to the specified URL.
     * @param url - The URL to make the request to.
     * @param options - The options for the request.
     * @returns A promise that resolves to the response data.
     */
    public static async delete<D>(
        url: string,
        options?: Omit<RequestInit, "method">,
    ): Promise<IRequestResponseClient<D>> {
        return this.request<D>(url, {
            ...options,
            method: "DELETE",
        })
    }
}

export { HttpClient }
