const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //Default port 8080

app.set('view engine', 'ejs'); //To use EJS templates.

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'http://www.google.com',
    userID: 'aJ48lW',
  },
};

const users = {
  b2xVn2: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  i3BoGr: {
    id: 'i3BoGr',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};


app.use(express.urlencoded({ extended: true })); //Middleware that translates the request body.
app.use(cookieParser()); //Middleware to work with cookies.


app.post('/login', (req, res) => { //Setup a /login route.
  const mightBeUser = getUserByEmail(req.body.email); //Might return null, might return users[user].
  
  if (mightBeUser === null) {
    return res.render('errors/urls_403forbidden', { user: users[req.cookies['user_id']] });
  }
  if (mightBeUser !== null) {
    if (req.body.password !== mightBeUser.password) { //Because if email is found, getUserByEmail will return users[user].
      return res.render('errors/urls_403forbidden', { user: users[req.cookies['user_id']] });
    }

    res.cookie('user_id', mightBeUser.id);
    res.redirect('/urls');
    return;
  }
});


app.get('/login', (req, res) => { //Setup a route to show the login page.
  if (req.cookies['user_id']) { //If logged in, redirect.
    return res.redirect('/urls');
  }
  
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
  return;
});


app.post('/register', (req, res) => { //Setup a POST /register endpoint to handle the Registration page.
  if (req.body.email === '' || req.body.password === '') {
    return res.render('errors/urls_400badRequest', { user: users[req.cookies['user_id']] });
  }
  if (getUserByEmail(req.body.email) !== null) {
    return res.render('errors/urls_400badRequest', { user: users[req.cookies['user_id']] });
  }

  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  console.log('object data', users);
  res.cookie('user_id', randomID);
  res.redirect('/urls');
  return;
});


app.get('/register', (req, res) => { //Setup a route to show the registration page.
  if (req.cookies['user_id']) { //If logged in, redirect.
    return res.redirect('/urls');
  }
  
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
  return;
});


app.post('/logout', (req, res) => { //Setup a /logout route.
  res.clearCookie('user_id'); //Clear cookies when logout.
  res.redirect('/urls');
});


app.post('/urls/:id/edit', (req, res) => { //Setup a route for the Edit button.
  if (!urlDatabase[req.params.id]) { //If id doesn't exist.
    return res.render('errors/urls_404notFound', { user: users[req.cookies.user_id] });
  }

  if (!req.cookies['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.cookies.user_id] });
  }

  const urls = urlsForUser(req.cookies['user_id']); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.cookies.user_id] });
  }
  
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  return res.redirect('/urls'); //Redirection to /urls after submission.
});


app.post('/urls/:id/delete', (req, res) => { //Setup a route for the Delete button.
  if (!urlDatabase[req.params.id]) { //If id doesn't exist.
    return res.render('errors/urls_404notFound', { user: users[req.cookies.user_id] });
  }

  if (!req.cookies['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.cookies.user_id] });
  }

  const urls = urlsForUser(req.cookies['user_id']); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.cookies.user_id] });
  }
  
  delete urlDatabase[req.params.id];
  return res.redirect(`/urls`); //Redirection to /urls after clicking on the Delete button.
});


app.post('/urls', (req, res) => {
  if (!req.cookies['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.cookies.user_id] });
  }

  const id = generateRandomString(); //Save the id-longURL key-value pair to urlDatabase.
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  //console.log('database from /urls', urlDatabase);
  res.redirect(`/urls/${id}`); //Redirection from /urls to /urls/:id
  return;
});


app.get('/urls/new', (req, res) => { //Setup a route to show the Form/ render urls_new.ejs
  if (!req.cookies['user_id']) { //If not logged in, redirect to /login.
    return res.redirect('/login');
  }
  
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
  return;
});


app.get('/urls/:id', (req, res) => { //Ship the object templateVars off to the template urls_show.ejs
  if (!urlDatabase[req.params.id]) {
    return res.render('errors/urls_404notFound', { user: users[req.cookies.user_id] });
  }
  
  if (!req.cookies['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.cookies.user_id] });
  }

  const urls = urlsForUser(req.cookies['user_id']); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.cookies.user_id] });
  }
 
  const templateVars = { user: users[req.cookies['user_id']], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render('urls_show', templateVars);
  return;
});


app.get('/u/:id', (req, res) => { //Handles shortURL (id) requests.
  if (!urlDatabase[req.params.id]) {
    return res.render('errors/urls_404notFound', { user: users[req.cookies.user_id] });
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL); //Redirection from /u/:id to its longURL.
  return;
});


app.get('/urls', (req, res) => { //Link the object templateVars to the template urls_index.ejs
  if (!req.cookies['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.cookies.user_id] });
  }

  const userURLDatabase = urlsForUser(req.cookies['user_id']);
  const templateVars = { user: users[req.cookies['user_id']], urls: userURLDatabase };
  res.render('urls_index', templateVars);
  return;
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});


const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6); //Returns a random string of 6 characters.
};

const getUserByEmail = function(email) { //To check if email exists in users object.
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = function(id) {
  let urls = {};

  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      urls[user] = urlDatabase[user].longURL;
    }
  }
  return urls;
};