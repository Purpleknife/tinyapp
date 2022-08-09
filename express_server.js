const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //Default port 8080

app.set('view engine', 'ejs'); //To use EJS templates.

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(express.urlencoded({ extended: true })); //Middleware that translates the request body.
app.use(cookieParser()); //Middleware to work with cookies.

app.post('/login', (req, res) => { //Setup a /login route.
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => { //Setup a route for the Edit button.
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls'); //Redirection to /urls after submission.
});

app.post('/urls/:id/delete', (req, res) => { //Setup a route for the Delete button.
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); //Redirection to /urls after clicking on the Delete button.
});

app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL; //Save the id-longURL key-value pair to urlDatabase.
  res.redirect(`/urls/${id}`); //Redirection from /urls to /urls/:id
});

app.get('/urls/new', (req, res) => { //Setup a route to show the Form/ render urls_new.ejs
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => { //Ship the object templateVars off to the template urls_show.ejs
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => { //Handles shortURL (id) requests.
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL); //Redirection from /u/:id to its longURL.
});

app.get('/urls', (req, res) => { //Link the object templateVars to the template urls_index.ejs
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6); //Returns a random string of 6 characters.
};