const { assert } = require('chai');

const { getUserByEmail, findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(findUserByEmail(user, expectedOutput));
  });
  it('should return undefined when searching for an email that does not exist in database', function() {
    const user = findUserByEmail("nonexistantemail@test.com", testUsers)
    const expectedOutput = "undefined";
    assert.equal(findUserByEmail(user, expectedOutput));
  })
});