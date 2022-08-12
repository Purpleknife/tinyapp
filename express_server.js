const express = require('express');
const app = express();
const PORT = 8080; //Default port 8080

const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

app.set('view engine', 'ejs'); //To use EJS templates.

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW',
    uniqueVisitorID: [],
    visitTimestamp: []
  },
  i3BoGr: {
    longURL: 'http://www.google.com',
    userID: 'aJ48lW',
    uniqueVisitorID: [],
    visitTimestamp: []
  },
};

const users = {
  b2xVn2: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  i3BoGr: {
    id: 'i3BoGr',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};

app.use('/images', express.static('images')); //Middleware for the favicon.
app.use(express.urlencoded({ extended: true })); //Middleware that translates the request body.
app.use(cookieSession({ //Middleware to work with encrypted cookies.
  name: 'session',
  keys: ['superDuperSecretKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));



app.post('/login', (req, res) => { //Setup a /login route.
  const mightBeUser = getUserByEmail(req.body.email, users); //Might return null, might return users[user].
  
  if (mightBeUser === null) {
    return res.render('errors/urls_403forbidden', { user: users[req.session['user_id']] });
  }
  if (mightBeUser !== null) {
    if (!bcrypt.compareSync(req.body.password, mightBeUser.password)) { //Because if email is found, getUserByEmail will return users[user].
      return res.render('errors/urls_403forbidden', { user: users[req.session['user_id']] });
    }
    
    req.session['user_id'] = mightBeUser.id;
    // if (!cookieList.includes(req.session['user_id'])) {
    //   cookieList.push(req.session['user_id']);
    // }
    res.redirect('/urls');
    return;
  }
});


app.get('/login', (req, res) => { //Setup a route to show the login page.
  if (req.session['user_id']) { //If logged in, redirect.
    return res.redirect('/urls');
  }
  
  const templateVars = { user: users[req.session['user_id']] };
  res.render('urls_login', templateVars);
  return;
});


app.post('/register', (req, res) => { //Setup a POST /register endpoint to handle the Registration page.
  if (req.body.email === '' || req.body.password === '') {
    return res.render('errors/urls_400badRequest', { user: users[req.session['user_id']] });
  }
  if (getUserByEmail(req.body.email, users) !== null) {
    return res.render('errors/urls_400badRequest', { user: users[req.session['user_id']] });
  }

  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  
  console.log('object data', users);
  req.session['user_id'] = randomID;
  res.redirect('/urls');
  return;
});


app.get('/register', (req, res) => { //Setup a route to show the registration page.
  if (req.session['user_id']) { //If logged in, redirect.
    return res.redirect('/urls');
  }
  
  const templateVars = { user: users[req.session['user_id']] };
  res.render('urls_register', templateVars);
  return;
});


app.post('/logout', (req, res) => { //Setup a /logout route.
  req.session = null; //Clear session cookies when logout.
  res.redirect('/urls');
});


app.put('/urls/:id/', (req, res) => { //Setup a route for the Edit button.
  if (!urlDatabase[req.params.id]) { //If id doesn't exist.
    return res.render('errors/urls_404notFound', { user: users[req.session.user_id] });
  }

  if (!req.session['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.session.user_id] });
  }

  const urls = urlsForUser(req.session['user_id'], urlDatabase); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.session.user_id] });
  }
  
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session['user_id'],
    uniqueVisitorID: [],
    visitTimestamp: []
  };
  return res.redirect('/urls'); //Redirection to /urls after submission.
});


app.delete('/urls/:id/', (req, res) => { //Setup a route for the Delete button.
  if (!urlDatabase[req.params.id]) { //If id doesn't exist.
    return res.render('errors/urls_404notFound', { user: users[req.session.user_id] });
  }

  if (!req.session['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.session.user_id] });
  }

  const urls = urlsForUser(req.session['user_id'], urlDatabase); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.session.user_id] });
  }
  
  delete urlDatabase[req.params.id];
  return res.redirect(`/urls`); //Redirection to /urls after clicking on the Delete button.
});


app.post('/urls', (req, res) => {
  if (!req.session['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.session.user_id] });
  }

  const id = generateRandomString(); //Save the id-longURL key-value pair to urlDatabase.
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session['user_id'],
    uniqueVisitorID: [],
    visitTimestamp: []
  };

  res.redirect(`/urls/${id}`); //Redirection from /urls to /urls/:id
  return;
});


app.get('/urls/new', (req, res) => { //Setup a route to show the Form/ render urls_new.ejs
  if (!req.session['user_id']) { //If not logged in, redirect to /login.
    return res.redirect('/login');
  }
  
  const templateVars = { user: users[req.session['user_id']] };
  res.render('urls_new', templateVars);
  return;
});


app.get('/urls/:id', (req, res) => { //Ship the object templateVars off to the template urls_show.ejs
  if (!urlDatabase[req.params.id]) {
    return res.render('errors/urls_404notFound', { user: users[req.session.user_id] });
  }
  
  if (!req.session['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.session.user_id] });
  }

  if (!req.session.visits) { //To check number of visits of Short URL ID.
    req.session.visits = 0;
  }

  const urls = urlsForUser(req.session['user_id'], urlDatabase); //Check if URL belongs to user.
  if (!Object.keys(urls).includes(req.params.id)) {
    return res.render('errors/urls_wrongUser', { user: users[req.session.user_id] });
  }
 
  const templateVars = {
    user: users[req.session['user_id']],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    visits: req.session.visits,
    uniqueVisits: urlDatabase[req.params.id]['uniqueVisitorID'].length,
    timestamp: urlDatabase[req.params.id]['visitTimestamp']
  };
  res.render('urls_show', templateVars);
  return;
});


app.get('/u/:id', (req, res) => { //Handles shortURL (id) requests.
  if (!urlDatabase[req.params.id]) {
    return res.render('errors/urls_404notFound', { user: users[req.session.user_id] });
  }
  req.session.visits++; //Increments everytime a Short URL ID is visited.


  const loggedInUser = req.session['user_id'];
  if (!urlDatabase[req.params.id]['uniqueVisitorID'].includes(loggedInUser)) {
    urlDatabase[req.params.id]['uniqueVisitorID'].push(loggedInUser);
  }
  console.log('urlDatabase', urlDatabase);


  const date = new Date();
  const cookieList = urlDatabase[req.params.id]['uniqueVisitorID'];
  for (let uniqueVisitor of cookieList) {
    if (uniqueVisitor === req.session['user_id']) {
      urlDatabase[req.params.id]['visitTimestamp'].push([date.toUTCString(), uniqueVisitor]);
    }
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL); //Redirection from /u/:id to its longURL.
  return;
});


app.get('/urls', (req, res) => { //Link the object templateVars to the template urls_index.ejs
  if (!req.session['user_id']) { //If not logged in, send error.
    return res.render('errors/urls_accessError', { user: users[req.session.user_id] });
  }

  const userURLDatabase = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = { user: users[req.session['user_id']], urls: userURLDatabase };
  res.render('urls_index', templateVars);
  return;
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});