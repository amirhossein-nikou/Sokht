import { SetMetadata } from "@nestjs/common"

export const SKIP_AUTH: string = "SKIP_AUTH"
export const SkipAuth = () => SetMetadata(SKIP_AUTH,true)