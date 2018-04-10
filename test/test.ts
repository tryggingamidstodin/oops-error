import { expect } from 'chai'
import {
    assertUserInput,
    Oops,
    programmerErrorHandler,
    systemErrorHandler,
} from '../lib/index'

describe('SystemError error', () => {
    const msg = 'Something happened'

    it('should give correct info', () => {
        const nativeError = new Error(msg)
        const recoverableError = new Oops({
            message: msg,
            category: 'SystemError',
        })

        expect(recoverableError.message).to.equal(nativeError.message)
        expect(recoverableError.name).to.equal('SystemError')
        expect(recoverableError.toString()).to.equal(`SystemError: ${msg}`)
        expect(typeof recoverableError.id).to.equal('string')

        // Check that the stack contains a reference to the current file.
        expect(recoverableError.stack).to.match(
            /^SystemError(.|\n|\r)+test\.js:.:../
        )

        const stackStr = err =>
            err.stack
                .replace(err.name, 'Error')
                .replace(/test.js:.:../, '')
                .replace(/test.js:..:../, '')
        expect(stackStr(nativeError)).to.equal(stackStr(recoverableError))
    })
})

describe('user error', () => {
    it('should be recoverable', () => {
        const msg = 'Something happened'
        const userError = new Oops({
            message: msg,
            category: 'UserError',
        })

        expect(userError.stack).to.match(/^UserError(.|\n|\r)+test\.js:..:../)
        expect(userError.message).to.equal(msg)
        expect(userError.name).to.equal('UserError')
        expect(userError.toString()).to.equal(`UserError: ${msg}`)
        expect(typeof userError.id).to.equal('string')
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

describe('fullstack', () => {
    it('should have get full stack', () => {
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
                    const fullStack = err3.fullStack() || ''
                    expect(fullStack).to.include('Lowlevel error')
                    expect(fullStack).to.include('Midlevel error')
                    expect(fullStack).to.include('Highlevel error')
                    console.log(fullStack.split('\n'))
                }
            }
        }
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
