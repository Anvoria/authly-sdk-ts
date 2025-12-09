type IRequestResponseClient<D, E> =
    | {
          readonly success: true
          readonly data: {
              readonly status: number
              readonly data: D
          }
      }
    | {
          readonly success: false
          readonly error: E | Error
      }

export type { IRequestResponseClient }
