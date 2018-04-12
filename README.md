# Errors

It is recommended in nodejs to divide all error in to two categories: Operational errors and programmer errors
https://www.joyent.com/node-js/production/design/errors

## Programmer errors

Programmer errors are bugs in the program. These are things that can always be avoided by changing the code. They can never be handled properly (since by definition the code in question is broken). Examples:

*   tried to read property of "undefined"
*   called an asynchronous function without a callback
*   passed a "string" where an object was expected
*   passed an object where an IP address string was expected

## Operational errors

Operational errors represent run-time problems experienced by correctly-written programs. These are not bugs in the program. In fact, these are usually problems with the system itself. Examples include:

*   failed to connect to server
*   failed to resolve hostname
*   invalid user input
*   request timeout
*   server returned a 500 response
*   socket hang-up
*   system is out of memory
*   data from some datasource is missing or not as expected

## Examples

### Oops

```javascript
import { Oops } from 'oops-error'

export const sendEmail = (email) => {
    if(!isValidEmail(email)) {
        throw new Oops({
            message: 'invalid email',
            category: 'OperationalError',
            context: {
                email,
            },
        })
    }
    ...
}
```

### programmerErrorHandler

For promise chains we use handling functions in our catch clauses. Example:

```javascript
import { programmerErrorHandler } from 'oops-error'

...
export const doSomething = (params) => {
    somePromiseFunction().catch(programmerErrorHandler('failed to do something', {params}))
}
...
```
