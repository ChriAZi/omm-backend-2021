const stackTrace = require('stack-trace');

/**
 * Middleware checking if a request is made by an authorized user. Rejects the request if not, passes it on to the next middleware if so.
 * @param authRoute - the route path to be ignored in checks (login/register)
 * @returns Express Middleware
 */
module.exports = (authRoute) => {
    return (req, res, next) => {
        if (req.user || req.method === 'OPTIONS' || req.path.includes(authRoute)) {
            next();
        } else {
            let err = new Error('Session timed out or not authenticated.');
            return res.status(401).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }
}