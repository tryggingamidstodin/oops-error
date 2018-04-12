import { expect } from 'chai'
import { Oops, operationalErrorHandler, programmerErrorHandler } from '../lib'

describe('Oops error class', () => {
    const msg = 'Something happened'
    const nativeError = new Error(msg)
    const oops = new Oops({
        message: msg,
        category: 'OperationalError',
        cause: nativeError,
    })

    it('should take message from options', () => {
        expect(oops.message).to.equal(msg)
    })

    it('name should default to given category', () => {
        expect(oops.name).to.equal('OperationalError')
    })

    it('tostring should concat name and message', () => {
        expect(oops.toString()).to.equal(`OperationalError: ${msg}`)
    })

    it('should give error an uuid', () => {
        expect(oops.id.split('-').length).to.equal(5)
    })

    it('should contain message', () => {
        expect(oops.message).to.equal(msg)
    })

    it('should contain test file reference in stack trace', () => {
        expect(oops.stack).to.match(
            /^OperationalError(.|\n|\r)+test\.([jt])s:.:../
        )
    })

    it('should have name OperationalError', () => {
        expect(oops.name).to.equal('OperationalError')
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
                        category: 'OperationalError',
                        cause: err1,
                        context: {
                            foo: 'bar',
                        },
                    })
                } catch (err2) {
                    try {
                        throw new Oops({
                            message: 'Highlevel error',
                            category: 'OperationalError',
                            cause: err2,
                            context: {
                                foo: 'baz',
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

        it('should include err1 context', () => {
            expect(fullStack).to.include('{"foo":"bar"}')
        })

        it('should include err2 context', () => {
            expect(fullStack).to.include('{"foo":"baz"}')
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

    it('should have operational error constructor function', () => {
        return badFunc()
            .catch(operationalErrorHandler('test message', { testId: 1234567 }))
            .then(() => {
                throw new Error('error handler should throw error onwards')
            })
            .catch(err => {
                expect(err.context).to.deep.eq({ testId: 1234567 })
                expect(err.message).to.eq('test message')
                expect(err.category).to.eq('OperationalError')
            })
    })
})
