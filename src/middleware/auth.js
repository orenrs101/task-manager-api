const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', ''); //takes the token from the authorization header
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //verify the token with the signature
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }); //find user by id and token
        // console.log(token);

        if(!user) {
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch(e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }

}

module.exports = auth;