/**
 * Represents the response from a request.
 * @template D - The type of the data returned from the request.
 * @template E - The type of the error returned from the request.
 */
type IRequestResponseClient<D, E> =
    | {
          /**
           * Whether the request was successful.
           */
          readonly success: true
          /**
           * The data returned from the request.
           */
          readonly data: {
              /**
               * The status code of the response.
               */
              readonly status: number
              /**
               * The data returned from the request.
               */
              readonly data: D
          }
      }
    | {
          /**
           * Whether the request was successful.
           */
          readonly success: false
          /**
           * The error returned from the request.
           */
          readonly error: E | Error
      }

export type { IRequestResponseClient }
