# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

It has a Register feature that allows Users to access and/or modify their shortened URLs whenever they Login.

This project's goals were:
- Learn how to build an HTTP server using Express,
- Learn how to build a Web App with Node,
- Get familiar with EJS templates and HTML.


## Features

- `Register` and `Login` to ensure a unique experience.
- Possibility to `Edit` and `Delete` the User's URLs.
- A glimpse on some Analytics in the `Edit` page:
  - Number of times a User visited the same short URL,
  - Number of visits to the same short URL from different Users,
  - Total visits log with a Date, Time and the User's ID.


## Getting Started

- `git clone` this project.
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Run your tests using `npm test`.
- Visit `http://localhost:8080/` on your browser.


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- methode-override
- chai
- mocha


## Final Product

!["Screenshot of 'Welcome' page"](https://github.com/Purpleknife/tinyapp/blob/master/docs/urls_welcome.png?raw=true)
!["Screenshot description"](https://github.com/Purpleknife/tinyapp/blob/master/docs/urls_myURLs.png?raw=true)
!["Screenshot of 'Create New URL' page"](https://github.com/Purpleknife/tinyapp/blob/master/docs/urls_create.png?raw=true)