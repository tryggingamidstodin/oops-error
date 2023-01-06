import { expect } from 'chai'
import { stringifyContext } from '../lib/util'

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
            expect(stringifyContext(a)).to
                .equal(`Invalid context: "Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'b' -> object with constructor 'Object'
    --- property 'a' closes the circle"`)
        })
    })
})
