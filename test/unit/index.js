process.env.NODE_ENV = 'testing';

console.debug = (...args) => {};

const assert = require('assert');
const { 
        parseJsonToObject, 
        safeWrapper,
        hash,
        createRandomString 
      } = require('../../lib/helpers');

unit = {}

unit['super important!'] = (done) => {
  const throwFcn = (data, callback) => {throw new Error()};
  const sut = safeWrapper(throwFcn);
  assert.strictEqual(1,1);
  done();
}

unit['safeWrapper - should not throw even if function throws.'] = (done) => {
  const throwFcn = (data, callback) => {throw new Error()};
  const sut = safeWrapper(throwFcn);
  assert.doesNotThrow(() => sut({},() => done()));
  
}

unit['parseJsonToObject - should return {} if object is empty.'] = (done) => {
  const sut = parseJsonToObject('');
  assert.deepStrictEqual(sut,{});
  done();
}

unit['parseJsonToObject - should return {} if object is invalid string'] = (done) => {
  const sut = parseJsonToObject('{sd~sa213}');
  assert.deepStrictEqual(sut,{});
  done();
}

unit['hash - should return false if there is no string'] = (done) => {
  const sut = hash('');
  assert.strictEqual(sut,false);
  done();
}

unit['createRandomString - should return false if there is no length'] = (done) => {
  const sut = createRandomString(0);
  assert.strictEqual(sut,false);
  done();
}

unit['createRandomString - should return false if invalid length'] = (done) => {
  let sut = createRandomString('');
  assert.strictEqual(sut,false);
  sut = createRandomString('asxas');
  assert.strictEqual(sut,false);
  sut = createRandomString({});
  assert.strictEqual(sut,false);
  sut = createRandomString([]);
  assert.strictEqual(sut,false);
  sut = createRandomString('');
  assert.strictEqual(sut,false);
  done();
}

module.exports = unit;