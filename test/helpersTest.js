const { assert } = require('chai');
const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expected = 'userRandomID';
    
    assert.equal(user.id, expected);
  });

  it('should return a user object when it\'s provided with an email that exists in the database', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expected = testUsers.userRandomID;
    
    assert.equal(user, expected);
  });

  it('should return undefined when given a non-existent email', function() {
    const user = getUserByEmail('test@test.com', testUsers)
    const expected = undefined;
    
    assert.equal(user, expected);
  });
});


describe('generateRandomString', function() {
  it('should return a string', function() {
    const input = generateRandomString();
    const expected = 'string';
    
    assert.equal(typeof input, expected);
  });

  it('should return a string of 6 characters', function() {
    const input = generateRandomString();
    const expected = 6;
    
    assert.equal(input.length, expected);
  });
});


describe('urlsForUser', function() {
  it('should return an object containing URLs when given a logged-in user id', function() {
    const testDatabase = {
      b2xVn2: {
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'userRandomID',
      },
      i3BoGr: {
        longURL: 'http://www.google.com',
        userID: 'user2RandomID',
      },
      rf78Kr: {
        longURL: 'http://www.example.edu',
        userID: 'userRandomID',
      },
    };    
    
    const userUrls = urlsForUser('userRandomID', testDatabase);
    const expected = {
      b2xVn2: 'http://www.lighthouselabs.ca',
      rf78Kr: 'http://www.example.edu',
    };
    
    assert.deepEqual(userUrls, expected);
  });


  it('should return an empty object when given a non-existent logged-in user id', function() {
    const testDatabase = {
      b2xVn2: {
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'userRandomID',
      },
      i3BoGr: {
        longURL: 'http://www.google.com',
        userID: 'user2RandomID',
      },
      rf78Kr: {
        longURL: 'http://www.example.edu',
        userID: 'userRandomID',
      },
    };    
    
    const userUrls = urlsForUser('test@test.com', testDatabase);
    const expected = {};
    
    assert.deepEqual(userUrls, expected);
  });
});