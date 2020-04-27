class VariableAdapter {
    constructor(){
        this.store = {}
    }

    async put(key, value){
        this.store[key] = value
        return Promise.resolve()
    }

    async get(key){
        const data = this.store[key]
        return Promise.resolve(data)
    }

    async del(key){
        delete this.store[key]
        return Promise.resolve()
    }
}

module.exports = VariableAdapter