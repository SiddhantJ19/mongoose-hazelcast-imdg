const mongoose = require('mongoose')
const mongooseCache = require('../../src/mongoose-IMDG-cache')
const VariableAdapter = require('../../src/variable-adapter')

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany()
  }
}


describe('cache props', () => {
  let connection;
  let client; 
  let cache;
  let models = {}
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/mongo-test-3', { useNewUrlParser: true });
    connection = mongoose.connection;

    // DB
    var kittenSchema = new mongoose.Schema({
      name: String
    })

    var kitten = mongoose.model('Kitten', kittenSchema)
    models.kitten = kitten
    // Cache
    client = new VariableAdapter()
    cache = await mongooseCache(client, '_dummy_', true)
  })
  
  afterAll(async () => {
    await Kitten.deleteMany() // Change it to DROP Collections
    await connection.close()
  });

  it('should be empty on start', () => {
    expect(client.store).toEqual(new Map());
  });

  it('cache should be empty when called save to db', () => {
    const fluffy = new models.kitten({name: 'fluffy'})
    fluffy.save()
    expect(client.store).toEqual(new Map());
  });

  it('any query with cache method should return a Query object', async () => {
    const fluffy = models.kitten.findOne({name: 'fluffy'}).cache('key1')
    expect(fluffy instanceof mongoose.Query ).toBeTruthy()
  });

});

