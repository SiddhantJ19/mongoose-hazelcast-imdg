class VariableAdapter {
    constructor(){
        this.store = {}
    }

    put(key, value){
        this.store[key] = value
        return Promise.resolve()
    }

    get(key){
        const data = this.store[key]
        return Promise.resolve(data)
    }

    del(key){
        delete this.store[key]
        return Promise.resolve()
    }
}

module.exports = VariableAdapter