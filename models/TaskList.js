const mongoose = require('mongoose');
const Task = require('./Task');

// Define TaskList Schema
const taskListSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }],
    visible: { type: Boolean }
});

const TaskList = mongoose.model('TaskList', taskListSchema);

module.exports = TaskList;
