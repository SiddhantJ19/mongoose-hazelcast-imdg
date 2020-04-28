const hazelcast = require('hazelcast-client')
const config = new hazelcast.Config.ClientConfig()
// MongooseCache
const mongooseCache = require('../src/mongoose-IMDG-cache')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/mongo-test2', { useNewUrlParser: true });


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    // we're connected!
    // required
    const client = await hazelcast.Client.newHazelcastClient(config)
    const cache = await mongooseCache(client, 'namespace')
    var kittySchema = new mongoose.Schema({
        name: String
    });

    var Kitten = mongoose.model('Kitten', kittySchema);
    var fluffy = await new Kitten({ name: 'fluffy02' }); 
    await fluffy.save()

    Kitten.findOne({name: 'fluffy02'}).cache("EK").then(res => console.log('res', res))
});