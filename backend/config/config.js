/** Load config from .env file **/
require('dotenv').config();

/**
 * Object that loads config values from .env file to be used throughout the application
 */
const config = {
    app: {
        port: parseInt(process.env.PORT),
        authRoute: process.env.AUTH_ROUTE,
        clientURL: process.env.CLIENT_URL
    },
    db: {
        name: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        get connectionString() {
            return `mongodb+srv://${this.username}:${this.password}@ws2020-omm.8oueo.mongodb.net/${this.name}?retryWrites=true&w=majority`
        }
    },
    session: {
        cookieKey: process.env.COOKIE_KEY
    }
}
Object.freeze(config);

module.exports = config;