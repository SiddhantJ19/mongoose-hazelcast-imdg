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
    connection.close() 
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
  });

  it('CREATE: should store data to cache if key is entered for the first time', async () => {
    var fluffy = await models.kitten.findOne({ name: 'fluffy' }).cache('key1')
    const store = client.store
    expect(store).toHaveProperty('_dummy_key1')
  });

  it('READ: if key is present, value should be fetched from the cache and not DB', async () => {
    const jumbo = new models.kitten({name: 'jumbo'})
    await jumbo.save()
    let jumbo_get_1 = await models.kitten.findOne({name: 'jumbo'}).cache('key2')
    await models.kitten.deleteMany({ name: 'jumbo'})
    let jumbo_get_2 = await models.kitten.findOne({name: 'jumbo'}).cache('key2')
    expect(jumbo_get_2._id).toEqual(jumbo_get_1._id)
  });

  

  /**
   * 1. Currently updating value for a key is not supported
   * 2. Even If data does not exist in the db but respective key exists, it will be loaded --> cache invalidation 
   * 3. So it is required to assign a unique key for every unique query
   * 
   * */ 
});

