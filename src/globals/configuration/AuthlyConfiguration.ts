/**
 * @summary Configuration for the Authly library.
 */
class AuthlyConfiguration {
    /**
     * @summary Private constructor to prevent instantiation.
     */
    private constructor() {}
    /**
     * @summary The default JWKS path.
     * @readonly This property is readonly and cannot be changed.
     * @default "/.well-known/jwks.json"
     */
    public static readonly DEFAULT_JWKS_PATH: string = "/.well-known/jwks.json"
    /**
     * @summary The default authorize path.
     * @readonly This property is readonly and cannot be changed.
     * @default "/authorize"
     */
    public static readonly DEFAULT_AUTHORIZE_PATH: string = "/authorize"
    /**
     * @summary The default token path.
     * @readonly This property is readonly and cannot be changed.
     * @default "/oauth/token"
     */
    public static readonly DEFAULT_TOKEN_PATH: string = "/oauth/token"
    /**
     * @summary The default algorithms.
     * @readonly This property is readonly and cannot be changed.
     * @default ["RS256"]
     */
    public static readonly DEFAULT_ALGORITHMS: readonly string[] = ["RS256"]
}

export { AuthlyConfiguration }
