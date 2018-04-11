import { expect } from 'chai'
import {
    assertUserInput,
    Oops,
    programmerErrorHandler,
    systemErrorHandler,
} from '../lib'

describe('Oops error class', () => {
    const msg = 'Something happened'
    const nativeError = new Error(msg)
    const oops = new Oops({
        message: msg,
        category: 'SystemError',
        cause: nativeError,
    })

    it('should take message from options', () => {
        expect(oops.message).to.equal(msg)
    })

    it('name should default to given category', () => {
        expect(oops.name).to.equal('SystemError')
    })

    it('tostring should concat name and message', () => {
        expect(oops.toString()).to.equal(`SystemError: ${msg}`)
    })

    it('should give error an uuid', () => {
        expect(oops.id.split('-').length).to.equal(5)
    })

    it('should contain message', () => {
        expect(oops.message).to.equal(msg)
    })

    it('should contain test file reference in stack trace', () => {
        expect(oops.stack).to.match(/^SystemError(.|\n|\r)+test\.([jt])s:..:../)
    })

    it('should have name SystemError', () => {
        expect(oops.name).to.equal('SystemError')
    })

    const stackStr = err =>
        err.stack
            .replace(err.name, 'Error')
            .replace(/test.([tj])s:.+:.+/, '')
            .replace(/test.([tj])s:.+:.+/, '')
            .trim()

    it('stack should look the same as for a native Error object', () => {
        expect(stackStr(nativeError)).to.equal(stackStr(oops))
    })

    describe('fullstack', () => {
        let fullStack: string

        before(() => {
            try {
                throw new Error('Lowlevel error')
            } catch (err1) {
                try {
                    throw new Oops({
                        message: 'Midlevel error',
                        category: 'SystemError',
                        cause: err1,
                        context: {
                            foo: 'bar',
                        },
                    })
                } catch (err2) {
                    try {
                        throw new Oops({
                            message: 'Highlevel error',
                            category: 'SystemError',
                            cause: err2,
                            context: {
                                foo: 'bar',
                            },
                        })
                    } catch (err3) {
                        fullStack = err3.fullStack() || ''
                    }
                }
            }
        })

        it('should contain low level error', () => {
            expect(fullStack).to.include('Lowlevel error')
        })

        it('should have mid level error', () => {
            expect(fullStack).to.include('Midlevel error')
        })

        it('should contain high level error', () => {
            expect(fullStack).to.include('Highlevel error')
        })
    })

    describe('fullMessageWithContext', () => {
        it('should just return message if the error has no context and no cause', () => {
            const message = 'test'
            const err = new Oops({ message, category: 'SystemError' })
            expect(err.fullMessageWithContext()).to.equal(message)
        })

        it('should return message with context', () => {
            const message = 'test'
            const err = new Oops({
                message,
                category: 'SystemError',
                context: { id: 123, foo: 'bar' },
            })
            expect(err.fullMessageWithContext()).to.equal(
                'test {"id":123,"foo":"bar"}'
            )
        })

        it('should return message with context and cause', () => {
            const message = 'test'
            const err = new Oops({
                message,
                category: 'SystemError',
                context: { id: 123, foo: 'bar' },
                cause: new Error('lowlevel error'),
            })
            expect(err.fullMessageWithContext().split('\n')).to.deep.equal([
                'test {"id":123,"foo":"bar"}',
                'caused by: lowlevel error',
            ])
        })

        it('should return message with context and cause with context recursively', () => {
            const message = 'test'
            const err = new Oops({
                message,
                category: 'SystemError',
                context: { id: 123, foo: 'bar' },
                cause: new Oops({
                    message: 'mid level error',
                    category: 'SystemError',
                    context: { id: 321 },
                    cause: new Error('lowlevel error'),
                }),
            })
            expect(err.fullMessageWithContext().split('\n')).to.deep.equal([
                'test {"id":123,"foo":"bar"}',
                'caused by: mid level error {"id":321}',
                'caused by: lowlevel error',
            ])
        })
    })
})

describe('assertUserInput', () => {
    describe('falsy values', () => {
        const falsyExamples = [false, '', undefined, null, 0]
        falsyExamples.map(ex => {
            const falsyValue = ex === '' ? '""' : ex
            it(`should throw UserError if input is ${falsyValue}`, () => {
                const message = `value ${falsyValue} is falsy`
                try {
                    assertUserInput(ex, message)
                    throw new Error('should throw UserError')
                } catch (err) {
                    expect(err.message).to.equal(message)
                    expect(err.name).to.equal('UserError')
                }
            })
        })
    })

    describe('truthy values', () => {
        const truthyExamples = [true, 'a', 1, -1, {}]
        truthyExamples.map(ex => {
            it(`should not throw error when input is ${ex}`, () => {
                assertUserInput(ex, `value ${ex} is truthy`)
            })
        })
    })
})

describe('Error handler function test', () => {
    const badFunc = () => Promise.reject(new Error('test error'))
    it('should have programmer error constructor function', () => {
        return badFunc()
            .catch(programmerErrorHandler('test message', { testId: 1234567 }))
            .then(() => {
                throw new Error('error handler should throw error onwards')
            })
            .catch(err => {
                expect(err.context).to.deep.eq({ testId: 1234567 })
                expect(err.message).to.eq('test message')
                expect(err.category).to.eq('ProgrammerError')
            })
    })

    it('should have system error constructor function', () => {
        return badFunc()
            .catch(systemErrorHandler('test message', { testId: 1234567 }))
            .then(() => {
                throw new Error('error handler should throw error onwards')
            })
            .catch(err => {
                expect(err.context).to.deep.eq({ testId: 1234567 })
                expect(err.message).to.eq('test message')
                expect(err.category).to.eq('SystemError')
            })
    })
})
