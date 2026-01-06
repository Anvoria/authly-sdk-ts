import { argv } from "bun"
import { writeFile } from "fs/promises"
import { readFile } from "fs/promises"
import { join } from "path"

export class DeployScript {
    private constructor() {}
    private static readonly PACKAGE_PATH: string = join(process.cwd(), "package.json")

    static {
        void this.init()
    }

    private static async init(): Promise<void> {
        const fileContent: Record<string, unknown> = JSON.parse(await readFile(this.PACKAGE_PATH, "utf-8"))
        fileContent.version = argv[1].replace(/^v/, "")

        await writeFile(this.PACKAGE_PATH, JSON.stringify(fileContent, null, 4))
    }
}
