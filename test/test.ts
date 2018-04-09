import { expect } from 'chai'
import { assertUserInput, TMSystemError, TMUserError } from '../lib/index'

describe('TMSystemError error', () => {
    const msg = 'Something happened'

    it('should give correct info', () => {
        const nativeError = new Error(msg)
        const recoverableError = new TMSystemError(msg)

        expect(recoverableError.message).to.equal(nativeError.message)
        expect(recoverableError.name).to.equal('TMSystemError')
        expect(recoverableError.toString()).to.equal(`TMSystemError: ${msg}`)
        expect(typeof recoverableError.id).to.equal('string')

        // Check that the stack contains a reference to the current file.
        expect(recoverableError.stack).to.match(
            /^TMSystemError(.|\n|\r)+test\.js:.:../
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
        const userError = new TMUserError(msg)

        expect(userError.stack).to.match(/^TMUserError(.|\n|\r)+test\.js:..:../)
        expect(userError.message).to.equal(msg)
        expect(userError.name).to.equal('TMUserError')
        expect(userError.toString()).to.equal(`TMUserError: ${msg}`)
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
                    throw new Error('should throw TMUserError')
                } catch (err) {
                    expect(err.message).to.equal(message)
                    expect(err.name).to.equal('TMUserError')
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
