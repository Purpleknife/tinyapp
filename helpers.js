//Helper functions used in express_server.js:

//Returns a random string of 6 characters.
const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6);
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

  for (let user in database) {
    if (database[user].userID === id) {
      urls[user] = database[user].longURL;
    }
  }
  return urls;
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};