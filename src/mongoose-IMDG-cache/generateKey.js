module.exports = function generateKey(customKey, namespace, Query) {
    if (customKey) {
        return namespace.toString() + customKey;
    }
    return JSON.stringify({
        namespace: namespace,
        ...Query
    })
}