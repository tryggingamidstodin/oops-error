import { TMUserError } from './user-error'

export { TMUserError } from './user-error'
export { TMSystemError } from './system-error'

export const assertUserInput = (input: any, message: string): void => {
    if (!Boolean(input)) {
        throw new TMUserError(message)
    }
}
