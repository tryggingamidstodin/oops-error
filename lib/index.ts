import { v4 as createId } from 'uuid'
import { stringifyContext } from './util'

export type ErrorCategory = 'OperationalError' | 'ProgrammerError'

interface IOopsConstants {
    OperationalError: ErrorCategory
    ProgrammerError: ErrorCategory
}

const constants: IOopsConstants = {
    OperationalError: 'OperationalError',
    ProgrammerError: 'ProgrammerError',
}

export interface IOopsOptions {
    name?: string
    message: string
    cause?: Error
    category: ErrorCategory
    context?: { [key: string]: any }
}

export class Oops extends Error {
    id: string
    category: string
    context?: { [key: string]: any }
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
    return constants.ProgrammerError
}

export const programmerErrorHandler = (message: string, context?: {}) => {
    return (err) => {
        throw new Oops({
            message,
            category: getErrorCategory(err),
            cause: err,
            context,
        })
    }
}

export const operationalErrorHandler = (message: string, context?: {}) => {
    return (err) => {
        throw new Oops({
            message,
            category: constants.OperationalError,
            cause: err,
            context,
        })
    }
}

export const assert = (value: any, message: string, context?: {}): void => {
    if (!Boolean(value)) {
        throw new Oops({
            message,
            category: constants.OperationalError,
            context,
        })
    }
}

export const newOperationalOops = (
    message: string,
    context?: {},
    cause?: Error
) => {
    return new Oops({
        message,
        category: constants.OperationalError,
        context,
        cause,
    })
}

/**
 * @deprecated use throw newOperationalOops instead.
 */
export const operationalOops = (message: string, context?: {}) => {
    throw newOperationalOops(message, context)
}

export const newProgrammerOops = (
    message: string,
    context?: {},
    cause?: Error
) => {
    return new Oops({
        message,
        category: constants.ProgrammerError,
        context,
        cause,
    })
}

/**
 * @deprecated use throw newProgrammerOops() instead.
 */
export const programmerOops = (message: string, context?: {}) => {
    throw newProgrammerOops(message, context)
}

export type DefensiveGet = <T>(getter: () => T) => T | string

export const defensiveGet: DefensiveGet = <T>(getter: () => T) => {
    try {
        return getter()
    } catch (e) {
        return 'accessing value returned an error: ' + e
    }
}
