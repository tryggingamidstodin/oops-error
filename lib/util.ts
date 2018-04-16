export const stringifyContext = (context: {}): string => {
    try {
        return JSON.stringify(context)
    } catch (err) {
        return `Invalid context: "${err.message}"`
    }
}
