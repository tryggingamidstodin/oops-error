import { v4 as createId } from 'uuid'
import { stringifyContext } from './util'
export type ErrorCategory = 'OperationalError' | 'ProgrammerError'

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
            str = str.replace(
                this.message + '\n',
                this.message + ' ' + stringifyContext(this.context) + '\n'
            )
        }
        if (this.cause) {
            const cause: any = this.cause
            str += '\n' + (cause.fullStack ? cause.fullStack() : cause.stack)
        }
        return str
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

export const operationalErrorHandler = (message: string, context?: {}) => {
    return err => {
        throw new Oops({
            message,
            category: 'OperationalError',
            cause: err,
            context,
        })
    }
}

export const assert = (value: any, message: string): void => {
    if (!Boolean(value)) {
        throw new Oops({
            message,
            category: 'OperationalError',
        })
    }
}
