const mongoose = require('mongoose')
const VariableStore = require('../variable-adapter')
const generateKey = require('./generateKey')

function _isHazelcast(client) {
    if (client['listenerService']){
        return true;
    }
    return false;
}

function newVariableStore(client) {
    if (client instanceof VariableStore){
        return client
    }
    return new VariableStore()
}

module.exports = async function (client, namespace) {
    let exec = mongoose.Query.prototype.exec
    
    mongoose.Query.prototype.cache = function (custom_key){
        this._customKey = custom_key ? custom_key.toString() : null
        this._cache = true
        this.IMap = _isHazelcast(client) === false ? newVariableStore(client) : client.getMap(namespace).then(mp => mp)
        return this
    }

    mongoose.Query.prototype.exec = async function () {
        if(!this._cache){
            return exec.apply(this, arguments)
        }else{
            this.IMap = await this.IMap
            
            this._key = generateKey(this._customKey, namespace, await this.getQuery());
            const value = await this.IMap.get(this._key)
            
            if(value){ // cache hit
                console.log('cache-hit')
                const doc = JSON.parse(value)
                return new this.model((doc))
            }else{
                console.log("cache-miss")
                const result = await exec.apply(this, arguments)
                if (result){
                    await this.IMap.put(this._key, JSON.stringify(result))
                }
                return result
            }
        }
    }
}

/**
 * TODO
 * 1. line 25 --> check if data is array
 * 2. Key construction using query properties
 */
