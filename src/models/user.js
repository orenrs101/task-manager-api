const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be positibe number');
            }
        }    
    },
    email: {
        type: String,
        unique: true, //making sure Email is unique, cannot register with existed email
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            // if(value.length <= 6) {
            //     throw new Error('Password too short!');
            // }
            if(value.toLowerCase().includes("password")) {
                throw new Error('Password cannot contain the Password word!');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer //file
    }
 }, {
     timestamps: true
 });

 userSchema.virtual('tasks', {
     ref: 'Task',
     localField: '_id', //the local attribute, meanning in the User
     foreignField: 'owner' //the related field in the other Model (task)
 })

 //toJSON is being called when calling user.send(), so we manipulate toJSON
 userSchema.methods.toJSON = function () {
     const user = this;
     const userObject = user.toObject();

     delete userObject.password;
     delete userObject.tokens;
     delete userObject.avatar;

     return userObject;
 }

 userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);//returns a token

    user.tokens = user.tokens.concat({ token} );

    await user.save(); //to save the token to the db
    return token;
 }

 //statics - static methods, on the Model, can be invoked by the model unlike Methods which are invoked by a model Instance
 userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) {
        throw new Error('Unable to login, no user found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login, incorrect password');
    }

    return user;
 }
//Hash the plain text password before saving
 userSchema.pre('save', async function (next) {
     const user = this; //this will give us access to the current User that's being saved
     console.log('just before saving');

     if(user.isModified('password')) { //hash the password only if it was modified
        user.password = await bcrypt.hash(user.password, 8);
     }
     
     next();
 })

 //Delete tasks when deleting a user
 userSchema.pre('remove', async function(next) {
     const user = this;
     await Task.deleteMany({ owner: user._id});
     next();
 })

//User Model - Will save to "users" collection
const User = mongoose.model('User', userSchema);
 
 module.exports = User;







//Examples how to use User model and save it

 //  const me = new User({
//      name: '  Aviya     ',
//      email: 'Orens@waves.com',
//      password: "12345667"
// });

//  me.save().then(() => {
//      console.log(me);
//  }).catch((error) => {
//      console.log(error);
//  })

