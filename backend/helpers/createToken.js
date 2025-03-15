//const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const maxAge = 3 *24 * 60 *60
//module.exports = function createToken(_id){
//return jwt.sign({_id}),'mysecret',{expireIn : maxAge}
//}



const createToken = (_id) => {
    return jwt.sign({ id: _id }, process.env.JWT_TOKEN, { expiresIn: maxAge });
};

module.exports = createToken;
