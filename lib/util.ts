export const stringifyContext = (context: {}): string => {
    try {
        return JSON.stringify(context)
    } catch (err) {
        return `Invalid context: "${err.message}"`
    }
}

export const defensiveGet = getter => {
    try {
        return getter()
    } catch (e) {
        return 'accessing value returned an error: ' + e
    }
}
