import { v4 as createId } from 'uuid'

export class TMUserError extends Error {
    id: string
    constructor(message: string) {
        super(message)
        this.name = 'TMUserError'
        this.id = createId()
    }
}
