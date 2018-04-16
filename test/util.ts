import { expect } from 'chai'
import { defensiveGet, stringifyContext } from '../lib/util'

describe('util', () => {
    describe('stringify context', () => {
        it('should stringify context', () => {
            const context = { foo: 'a', bar: 1 }
            expect(stringifyContext(context)).to.equal('{"foo":"a","bar":1}')
        })
        it('should stringify context with circular reference', () => {
            const a: any = {}
            const b: any = {}
            a.b = b
            b.a = a
            expect(stringifyContext(a)).to.equal(
                'Invalid context: "Converting circular structure to JSON"'
            )
        })
    })

    describe('defensive get', () => {
        describe('faulty getter', () => {
            const obj: any = undefined
            const barValue = defensiveGet(() => {
                obj.bar()
            })

            it('should return error string from exception thrown by calling getter', () => {
                expect(barValue).to.equal(
                    "accessing value returned an error: TypeError: Cannot read property 'bar' of undefined"
                )
            })
        })

        describe('working getter', () => {
            const obj = {
                bar: () => {
                    return 'foo'
                },
            }
            const barValue = defensiveGet(() => obj.bar())

            it('should return value from getter', () => {
                expect(barValue).to.equal('foo')
            })
        })
    })
})
