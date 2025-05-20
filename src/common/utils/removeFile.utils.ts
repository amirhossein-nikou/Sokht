import { existsSync, unlinkSync } from "fs";
import { join } from "path";

export function removeFile(fileAddress) {
    if (Array.isArray(fileAddress)) {
        fileAddress.map(address => {
            const file = join(address)
            if (existsSync(file)) {
                unlinkSync(file)
            }
        })
    } else if (fileAddress) {
        const file = join(fileAddress)
        if (existsSync(file)) {
            console.log("Unlink");
            unlinkSync(file)
        }

    }
}