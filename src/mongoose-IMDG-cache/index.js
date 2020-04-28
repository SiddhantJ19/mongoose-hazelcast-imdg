const mongoose = require('mongoose')
const VariableStore = require('../variable-adapter')
const generateKey = require('./generateKey')

function _isHazelcast(client) {
    return client.hasOwnProperty('listenerService')
}

function newVariableStore(client) {
    return client instanceof VariableStore ? client : new VariableStore()
}

module.exports = async function (client, namespace) {
    let exec = mongoose.Query.prototype.exec
    mongoose.Query.prototype.cache = function (custom_key = ''){
        this._cache = true
        this._namespace = namespace
        this._customKey = custom_key
        this.IMap = _isHazelcast(client) === false ? newVariableStore(client) : client.getMap(namespace).then(mp => mp)
        return this
    }

    mongoose.Query.prototype.exec = async function () {
        if(!this._cache){
            return exec.apply(this, arguments)
        }else{
            this.IMap = await this.IMap
            this._key = generateKey(this);
            console.log(this._key)
            const value = await this.IMap.get(this._key)
            
            if(value){ // cache hit
                console.log('cache-hit')
                return Array.isArray(value) ?
                 value.map(new this.model(JSON.parse(doc))) : 
                 new this.model(JSON.parse(value))
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
