/**
 * Represents the error structure from the backend.
 */
interface APIError {
    /**
     * The error code.
     */
    readonly code: string
    /**
     * The error message.
     */
    readonly message: string
    /**
     * Optional error details.
     */
    readonly details?: unknown
}

/**
 * Represents the response from a request.
 * @template D - The type of the data returned from the request.
 */
type IRequestResponseClient<D> =
    | {
          /**
           * Whether the request was successful.
           */
          readonly success: true
          /**
           * The data returned from the request.
           */
          readonly data: D
          /**
           * The message returned from the request.
           */
          readonly message: string
      }
    | {
          /**
           * Whether the request was successful.
           */
          readonly success: false
          /**
           * The error returned from the request.
           */
          readonly error: APIError
      }

export type { IRequestResponseClient, APIError }
