/**
 * Express.js
 * @source https://www.npmjs.com/package/express
 * @license MIT License
 * @description Minimalist Web Framework
 */
const express = require('express');
/**
 * Body Parser
 * @source https://www.npmjs.com/package/body-parser
 * @license MIT License
 * @description Middleware to read json and urlencoded request bodies
 */
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
/**
 * Cors
 * @source https://www.npmjs.com/package/cors
 * @license MIT License
 * @description Middleware to setup cors logic
 */
const cors = require('cors')
/**
 * Cookie Session
 * @source https://www.npmjs.com/package/cookie-session
 * @license MIT License
 * @description Middleware enabling use of cookie sessions
 */
const session = require('cookie-session');
/**
 * Cookie Parser
 * @source https://www.npmjs.com/package/cookie-parser
 * @license MIT License
 * @description Middleware enabling proper handling of cookies
 */
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('./middleware/authentication/passport');
const checkAuth = require('./middleware/authentication/checkAuth');
const config = require('./config/config')

/** Create Express app **/
const app = express();
const port = config.app.port;

/** Connect to Database **/
mongoose.connect(config.db.connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log(`Database connected successfully`))
    .catch(err => console.log(err));

/** Mongoose Promise deprecated --> override it **/
mongoose.Promise = global.Promise;

/** Cookie Parser Setup for Auth **/
app.use(cookieParser(config.session.cookieKey))

/** Configuring Sessions storage **/
app.use(
    session({
        name: 'omm-session',
        secret: config.session.cookieKey,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
);

/** Setting up Passport Middleware **/
app.use(passport.initialize({}));
app.use(passport.session({}));

/** Set relevant CORS Headers **/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.app.clientURL);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/** Allow all options requests for possible pre-flight requests **/
app.options('*', cors({origin: config.app.clientURL}))

/** Setup body-parser properties **/
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

/** Define static resource loading **/
app.use(express.static(path.join(__dirname, 'public')));

/** Authentication Middleware **/
app.use(checkAuth(config.app.authRoute))

/** Define routers **/
let authenticationRouter = require('./routes/authentication');
let memesRouter = require('./routes/memes');
let usersRouter = require('./routes/users')
let templatesRouter = require('./routes/templates');

/** Setup routers **/
app.use(config.app.authRoute, authenticationRouter);
app.use('/memes', memesRouter);
app.use('/users', usersRouter)
app.use('/templates', templatesRouter);

/** Start Application **/
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});