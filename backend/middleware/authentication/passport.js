const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

/**
 * Saves the user id to be stored in the session
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * Retrieves the user id from the session and fetches the user from the database
 */
passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/**
 * Creates the strategy to be invoked by the passport library upon authentication requests.
 * Checks if the passed in username and password match with database records.
 */
passport.use(new LocalStrategy({
    usernameField: 'name'
}, (username, password, done) => {
    User.findOne({name: username}).then((user, err) => {
        if (err) throw err;
        if (!user) {
            return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }).catch((err) => {
        return done(null, false, {message: err});
    });
}));

module.exports = passport;
