const jwt = require('jsonwebtoken');
const User = require('../models/User');

const AuthMiddleware = (req, res, next) => {
    let token = req.cookies?.jwt; // Use optional chaining to avoid crashing if cookies are undefined
    
    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, (err, decodedValue) => {
            if (err) {
                return res.status(401).json({ message: 'User is not logged in!' });
            } else {
                User.findById(decodedValue.id).then(user => {
                    if (!user) {
                        return res.status(401).json({ message: 'User not found!' });
                    }
                    req.user = user;
                    next();
                }).catch(err => {
                    return res.status(500).json({ message: 'Internal server error' });
                });
            }
        });
    } else {
        return res.status(400).json({ message: 'Token is required' });
    }
};

module.exports = AuthMiddleware;
