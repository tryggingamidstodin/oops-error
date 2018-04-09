import { v4 as createId } from 'uuid'
export class TMSystemError extends Error {
    id: string
    constructor(message: string) {
        super(message)
        this.name = 'TMSystemError'
        this.id = createId()
    }
}
