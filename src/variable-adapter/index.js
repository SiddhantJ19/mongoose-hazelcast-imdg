class VariableAdapter {
    constructor(){
        this.store = new Map()
    }

    put(key, value){
        this.store.set(key, value)
        return Promise.resolve()
    }

    get(key){
        const data = this.store.get(key)
        return Promise.resolve(data ? JSON.parse(data) : data)
    }

    del(key){
        delete this.store.delete(key)
        return Promise.resolve()
    }
}

module.exports = VariableAdapter