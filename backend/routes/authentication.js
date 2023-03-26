const express = require('express');
const router = express.Router();

const {AuthenticationController} = require('../controllers/authenticationController');

/** GET Route Check Auth Status **/
router.get('/status', AuthenticationController.getStatus);

/** POST Route Register New User **/
router.post('/register', AuthenticationController.registerUser);

// noinspection JSCheckFunctionSignatures
/** POST Route Login User **/
router.post('/login', AuthenticationController.loginUser);

/** GET Route Logout User **/
router.get('/logout', AuthenticationController.logoutUser);

module.exports = router;