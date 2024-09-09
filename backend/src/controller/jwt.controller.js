const path = require('path')
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

// define jwt key
const jwtKey = process.env.JWT_KEY;

// Create JWt
module.exports.createJWT = (id, exp) => jwt.sign({
    id, exp
}, jwtKey)

// Parse JWT
module.exports.parseJWT = token => {
    if (token) {
        return jwt.verify(token, jwtKey, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError')
                    return 'token_expired';
                else
                    return 'parse_error';
            } else
                return decoded;
        });
    } else {
        return 'no token provided';
    }
}