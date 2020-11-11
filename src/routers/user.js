const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { update } = require('../models/user');
const User = require('../models/user');
const router = new express.Router();;
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

// POST - save new user - sign up
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });

    } catch(e) {
        res.status(400).send(e);
    }
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

//Login
router.post('/users/login', async (req, res) => {
    try {0
        const user = await User.findByCredentials(req.body.email, req.body.password); 
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch(e) {
        res.status(400).send();
    }
});

//logout
router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((toeknObj) => {
            return toeknObj.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

//logout All
router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send()

    } catch(e) {
        res.status(500).send();
    }
});

//GET - get all users
router.get('/users/me', auth, async (req, res) => { //auth is the middleware
    res.send(req.user);
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch(e)  {
    //     res.status(500).send();
    // }
});

//Patch - UPDATE a user
router.patch('/users/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body); //current updates user passed in request
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        // { new: true, runValidators: true} => new means return the new updated user with the updated data, 
        //runValidators means run validators on the new data
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});

        //const user = await User.findById(req.params.id);
        updates.forEach((update) => req.user[update] = req.body[update]);

        await req.user.save();
        res.send(req.user);

    } catch(e) {
        res.status(400).send(e);
    }
});

//Delete a user
router.delete('/users/me', auth, async (req,res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);

        // if(!user) {
        //     return res.status(404).send();
        // }

        //use remove method on mongoose document
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);

    } catch(e) {
        res.status(500).send(e);
    }
});

//Upload User Profile image
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a jpg, jpeg or png file!'));
        }
        cb(undefined,true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar') , async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer(); 
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error,req,res,next) => {
    res.status(400).send({error: error.message});
});

//delete profile picture for user
router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

//Serve Up File (avatar img)
router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);

    } catch {
        res.status(404).send();
    }
})

//Get specific user
// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id;

//     try {
//         const user = await User.findById(_id);
//         if(!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch(e) {
//         res.status(500).send();
//     }
// });



module.exports = router;