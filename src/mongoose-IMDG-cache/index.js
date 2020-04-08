const mongoose = require('mongoose')
module.exports = async function (client, namespace, variableStore) {
    let exec = mongoose.Query.prototype.exec
    mongoose.Query.prototype.cache = function (custom_key){
        if(!custom_key){
            return new Error('KEY param required in cache')
        }
        this._key = namespace.toString() + custom_key.toString()
        this._cache = true
        this.IMap = variableStore === true ? client : client.getMap(namespace).then(mp => mp)
        return this
    }

    mongoose.Query.prototype.exec = async function () {
        if(!this._cache){
            return exec.apply(this, arguments)
        }else{
            this.IMap = await this.IMap
            // cache present
            const value = await this.IMap.get(this._key)
            if(value){ // cache hit
                console.log('cache-hit')
                const doc = JSON.parse(value)
                return new this.model((doc))
            }else{
                const result = await exec.apply(this, arguments)
                await this.IMap.put(this._key, JSON.stringify(result))
                return result
            }
        }
    }
}

/**
 * TODO
 * 1. line 25 --> check if data is array
 * 
 */
