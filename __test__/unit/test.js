const mongoose = require('mongoose')
const generateKey = require('../../src/mongoose-IMDG-cache/generateKey')

describe('unit tests', () => {
    it('generateKey: should return a stringified JSON object', async () => {
        const obj = {
            condition1: 'val1',
            condition2: 'val2',
        }
        const key = generateKey(null, '_namespace_', obj)
        console.log('from unit test', key)
        expect(key).toEqual(JSON.stringify({
            namespace : '_namespace_',
            ...obj
        }));
    });
});