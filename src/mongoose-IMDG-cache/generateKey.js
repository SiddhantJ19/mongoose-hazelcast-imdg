module.exports = function generateKey(query) {
    if (query._customKey) {
        return query._namespace.toString() + query._customKey;
    }
    return JSON.stringify({
        namespace: query._namespace,
        ...query.getQuery()
    })
}