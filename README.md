# TM Errors

It is recommended in nodejs to divide all error in to two categories: Operational errors and programmer errors
https://www.joyent.com/node-js/production/design/errors

## Programmer errors

Programmer errors are bugs in the program. These are things that can always be avoided by changing the code. They can never be handled properly (since by definition the code in question is broken). Examples:

*   tried to read property of "undefined"
*   called an asynchronous function without a callback
*   passed a "string" where an object was expected
*   passed an object where an IP address string was expected

When a programmer error occurs the error is given an id, it is logged and the error id is delivered to the client. This is because we don't want to expose any information about the system to the client.
The best way to recover from programmer errors is to crash immediately.

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

At TM we divide operational errors into two categories: User errors and System error

### User errors

This is allways invalid user input. In this case we want to tell the user what he did wrong. This is done be throwing an instance of TMUserError with some message. Example:

```javascript
import { TMUserError } from '@tm.is/tm-error'

export const saveEmail = (userid, email) => {
    if(!isValidEmail(email)) {
        throw new TMUserError('Invalid email')
    }
    ...
}
```

### System errors

As with programmer errors we don't want to expose them to the client. Just deliver the error id and log it. This is done be throwing an instance of TMSystemError with some message.

```javascript
import { TMSystemError } from '@tm.is/tm-error'

...
throw new TMSystemError('some message')
...
```
