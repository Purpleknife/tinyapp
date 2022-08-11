//Helper functions used in express_server.js:

//Returns a random string of 6 characters.
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};


//Checks if email exists in users object.
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
  return null;
};


//Returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id, database) {
  let urls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      urls[shortURL] = database[shortURL].longURL;
    }
  }
  return urls;
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};