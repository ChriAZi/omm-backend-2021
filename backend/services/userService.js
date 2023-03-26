const User = require('../models/user')

class UserService {

    /**
     * Fetches a user from the database
     * @param id - the user Id
     * @returns {Promise<User>} - a User Document
     */
    static getUser = async (id) => {
        try {
            let user = await User.findOne({_id: id});
            return user.name
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports.UserService = UserService;