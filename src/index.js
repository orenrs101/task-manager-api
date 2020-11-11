const express = require('express');
require('./db/mongoose'); //this insures that mongoose.js runs (as we run mongoose.connect)
const User = require('./models/user');
const Task = require('./models/task');

const userRouter = require('./routers/user'); 
const taskRouter = require('./routers/tasks');

const app = express();
const port = process.env.PORT

///middleware
// app.use((req,res,next) => {
//     console.log(req.method, req.path);
//     if(req.method === "GET") {
//         res.send('GET Requests are disabled')

//     } else {
//         next()
//     }
// });

// app.use((req,res,next) => {
//         res.status(503).send('Services are down!')
// })


//Multer - File Upload
const multer = require('multer');
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) { //req-the request being made, file- info regarding the file, cb-callback to tel ,ulter when we done 
        if(!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('please upload a word document'));
        }
        cb(undefined, true);
        
        //cb(new Error('File must be a PDF'));
        //cb(undefined, true) //if everything goes well, send undefined as 1st argument, TRUE- accept the upload
    }
});

//the server is configured to accept and save files that are uploaded to it
// app.post('/upload', upload.single('upload'), (req,res) => {
//     res.send();
// }, (error,req,res,next) => {
//     res.status(400).send({error: error.message});
// });

//configure express to automatically parse the incoming JSON for us so we have it accesible as an object (parse JSON to object)
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});


// const main = async () => {
//     // //Find a user by a task
//     // const task = await Task.findById('5f988852288e6589f5b929ce');
//     // await task.populate('owner').execPopulate() //this going to find the owner user associated with the task and now owner will be the entire user
//     // console.log(task.owner);
    
//     //find the tasks of a user
// //     const user = await User.findById('5f9886b5af8fad882c4b73f3');
// //     await user.populate('tasks').execPopulate();
// //     console.log(user.tasks);
// // }

// main()
