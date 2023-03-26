/**
 * BCrypt
 * @source https://www.npmjs.com/package/bcryptjs
 * @license MIT License
 * @description Cryptography library used for salting & hashing
 */
const bcrypt = require('bcryptjs');
/**
 * Passport.js
 * @source https://www.npmjs.com/package/passport
 * @license MIT License
 * @description Authentication Library for registering and logging in users
 */
const passport = require('passport');
/**
 * Stack-Trace
 * @source https://www.npmjs.com/package/stack-trace
 * @license MIT License
 * @description Error Logging Package for better stack trace information
 */
const stackTrace = require('stack-trace');

const User = require('../models/user');

class AuthenticationController {

    /**
     * Returns the status depending if the user is logged in or not
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request indicating the status of the user
     */
    static getStatus = (req, res) => {
        if (req.user) {
            return res.status(200).json({
                authorized: true,
                userId: req.user._doc._id
            });
        } else {
            return res.status(200).json({authorized: false})
        }
    }

    /**
     * Registers a new user with a given username and password
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request with the new userId and a success message
     */
    static registerUser = async (req, res) => {
        let user = new User({
            name: req.body.name,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Error generating Salt:' + err);
            } else {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        console.error('Error hashing password: ' + err);
                    } else {
                        user.password = hash;
                        user.save((err, user) => {
                            if (err) {
                                return res.status(500).json({
                                    errors: {
                                        message: err.message,
                                        location: stackTrace.parse(err)[0]
                                    }
                                });
                            } else {
                                return res.status(200).json({
                                    userId: user._id,
                                    success: 'user registered'
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Logs in a registered user with a username and password.
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @params next - function to pass request to next middleware
     * @returns {*} - an HTTP request with the userId and a success message
     */
    static loginUser = (req, res, next) => {
        passport.authenticate('local', (err, user) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        message: err.message,
                        location: stackTrace.parse(err)[0]
                    }
                });
            }
            if (!user) {
                let err = new Error('This combination of username and password could not be found in our system.');
                return res.status(401).json({
                    errors: {
                        message: err.message,
                        location: stackTrace.parse(err)[0],
                        authorized: false
                    }
                });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            message: err.message,
                            location: stackTrace.parse(err)[0]
                        }
                    });
                }
                return res.status(200).json({
                    userId: user._id,
                    success: 'user logged in'
                });
            });
        })(req, res, next);
    };

    /**
     * Logs out a user if one is logged in
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request indicating the logout status of the user
     */
    static logoutUser = (req, res) => {
        try {
            req.logOut()
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
        return res.status(200).json({loggedOut: true});
    };
}

module.exports.AuthenticationController = AuthenticationController;