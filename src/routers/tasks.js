const express = require('express');
const { update } = require('../models/task');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

//POST - save new task
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body, //copies all the properties that in req.body (task description, completed)
        owner: req.user._id
    })

    try  {
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send(e);
    }
    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

//GET - get all task. tasks?completed=true
//Pagination - limit, skip
//GET tasks?limit=10&skip=10 - limit allows us to limit the number of results, skip = iterate over pages
//GET tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req,res) => {

    const match = {};
    const sort = {};
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'; //if completed is true it will return true boolean, else False
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'desc') ? -1 : 1 ;
    }
    try {
        //option 1 - I prefer this one
        // const tasks = await Task.find({owner: req.user._id, completed: match.completed});
        // res.send(tasks);

        //option 2
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort //uses the sort object
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch(e) {
        res.status(500).send();
    }
});

//Get specific task
router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id;

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id})
        if(!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
});

//Patch = Update task
router.patch('/tasks/:id', auth, async (req,res) => {

    const updates = Object.keys(req.body);
    const allowedUpdated = ['completed', 'description'];
    const isValidOperation = updates.every((update) => allowedUpdated.includes(update));

    if(!isValidOperation) {
        return res.status(404).send({error: 'Invalid Updates!'});
    }

    try {
        //const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});
        // const updatedTask = await Task.findById(req.params.id);

        const updatedTask = await Task.findOne({ _id: req.params.id, owner: req.user._id});

        if(!updatedTask) {
            return res.status(404).send();
        }

        updates.forEach((update) => updatedTask[update] = req.body[update]);
        await updatedTask.save();
        res.send(updatedTask);
    } catch(e) {
        res.status(400).send(e);
    }
});

//Delete task
router.delete('/tasks/:id', auth, async (req,res) => {

    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if(!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch(e) {
        res.status(500).send(e);
    }
});

module.exports = router;