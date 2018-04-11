import { v4 as createId } from 'uuid'

export type ErrorCategory = 'UserError' | 'SystemError' | 'ProgrammerError'

export interface IOopsOptions {
    name?: string
    message: string
    cause?: Error
    category: ErrorCategory
    context?: {}
}

export class Oops extends Error {
    id: string
    category: string
    context?: {}
    cause?: Error

    constructor(options: IOopsOptions) {
        super(options.message)

        Error.captureStackTrace(this, this.constructor)

        this.name = options.name || options.category
        this.category = options.category
        this.context = options.context
        this.cause = options.cause
        this.id = createId()
    }

    fullStack = () => {
        let str = this.stack || ''
        if (this.context) {
            str = str.replace('\n', ' ' + JSON.stringify(this.context) + '\n')
        }
        if (this.cause) {
            const cause: any = this.cause
            str += '\n' + (cause.fullStack ? cause.fullStack() : cause.stack)
        }
        return str
    }

    fullMessageWithContext = () => {
        let fullMessage = this.message
        if (this.context) {
            fullMessage += ' ' + JSON.stringify(this.context)
        }
        if (this.cause) {
            const cause: any = this.cause
            fullMessage += `\ncaused by: ${
                cause.fullMessageWithContext
                    ? cause.fullMessageWithContext()
                    : cause.message
            }`
        }
        return fullMessage
    }
}

export const getErrorCategory = (err): ErrorCategory => {
    if (err.category) {
        return err.category as ErrorCategory
    }
    return 'ProgrammerError'
}

export const programmerErrorHandler = (message: string, context?: {}) => {
    return err => {
        throw new Oops({
            message,
            category: getErrorCategory(err),
            cause: err,
            context,
        })
    }
}

export const systemErrorHandler = (message: string, context?: {}) => {
    return err => {
        throw new Oops({
            message,
            category: 'SystemError',
            cause: err,
            context,
        })
    }
}

export const assertUserInput = (input: any, message: string): void => {
    if (!Boolean(input)) {
        throw new Oops({
            message,
            category: 'UserError',
        })
    }
}
