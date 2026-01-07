import { argv } from "bun"
import { writeFile } from "fs/promises"
import { readFile } from "fs/promises"
import { join } from "path"

/**
 * @summary This script is used to deploy the package to the NPM registry.
 */
export class DeployScript {
    /**
     * @summary Private constructor to prevent instantiation.
     */
    private constructor() {}

    /**
     * @summary The path to the package.json file.
     */
    private static readonly PACKAGE_PATH: string = join(process.cwd(), "package.json")

    /**
     * @summary Initializes the script.
     */
    static {
        void this.init()
    }

    /**
     * @summary Initializes the script.
     */
    private static async init(): Promise<void> {
        const version: string | undefined = argv[2]

        if (!version) {
            throw new Error("Version argument is required.")
        }

        const fileContent: Record<string, unknown> = JSON.parse(await readFile(this.PACKAGE_PATH, "utf-8"))
        fileContent.version = version.replace(/^v/, "")

        await writeFile(this.PACKAGE_PATH, JSON.stringify(fileContent, null, 4))
    }
}
