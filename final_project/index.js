const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const JWT_SECRET = 'aVeryVerySecretString';
const app = express();

app.use(express.json());

app.post('/signin', (req, res) => {
    const { uname, pwd } = req.body

  if (uname === 'user' && pwd === 'password') {
    return res.json({
      token: jwt.sign({ user: 'user' }, JWT_SECRET)
    });
  }

  return res.status(401).json({ message: 'Invalid username and/or password' });
});

app.use('/customer', session({
  secret: 'fingerprint_customer',
  resave: true,
  saveUninitialized: true
}));

app.use('/customer/auth/*', function auth(req, res, next) {
    // Write the authentication mechanism here
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, 'access', (err, user) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        // Add any additional logic here based on your requirements
        next(); // Call next() to proceed to the next middleware
      });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  });

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log('Server is running'));