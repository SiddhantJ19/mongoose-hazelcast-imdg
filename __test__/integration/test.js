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
    cache = await mongooseCache(client, '_dummy_')
  })
  
  afterAll(async () => {
    await Kitten.deleteMany() // Change it to DROP Collections
    await connection.close() 
  });

  it('should be empty on start', () => {
    expect(client.store).toEqual({});
  });

  it('cache should be empty when called save to db', () => {
    const fluffy = new models.kitten({name: 'fluffy'})
    fluffy.save()
    expect(client.store).toEqual({});
  });

  it('any query with cache method should return a Query object', () => {
    var fluffy = models.kitten.findOne({name: 'fluffy'}).cache('key1')
    expect(fluffy instanceof mongoose.Query ).toBeTruthy()
    const store = client.store
    expect(store).toEqual({}) // data not yet cached
  });

  it('CREATE: should store data to cache if key is entered for the first time', async () => {
    // TODO: should also work with create query
    const kiddo = new models.kitten({name: 'kiddo'})
    await kiddo.save()
    var kiddo1 = await models.kitten.findOne({ name: 'kiddo' }).cache('kiddo')
    const store = client.store
    expect(store).toHaveProperty('_dummy_kiddo')
  });

  it('READ: if key is present, value should be fetched from the cache and not DB', async () => {
    const jumbo = new models.kitten({name: 'jumbo'})
    await jumbo.save()
    let jumbo_get_1 = await models.kitten.findOne({name: 'jumbo'}).cache('key3')
    await models.kitten.deleteMany({ name: 'jumbo'}) // deleting from db
    let jumbo_get_2 = await models.kitten.findOne({name: 'jumbo'}).cache('key3')
    expect(jumbo_get_2._id).toEqual(jumbo_get_1._id)
  });
});

