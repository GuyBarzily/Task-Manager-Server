const Task = require('../models/Task');
const TaskList = require('../models/TaskList');



const resolvers = {
    Query: {
        tasks: async () => {
            return await Task.find();
        },
        taskLists: async () => {
            return await TaskList.find().populate('tasks');
        },
    },

    Mutation: {
        createTask: async (_, { title, priority, deadline, description, completed = false, listId }) => {
            // Create a new task
            const newTask = new Task({
                title,
                priority,
                deadline,
                description,
                completed,
            });

            await newTask.save();

            // Find the task list to which the task should be added
            const taskList = await TaskList.findById(listId);
            if (!taskList) {
                throw new Error('TaskList not found');
            }

            // Add the task to the task list and save
            taskList.tasks.push(newTask.id);
            await taskList.save();


            return newTask;
        },

        updateTask: async (_, { id, completed }) => {
            // Find and update the task
            const updatedTask = await Task.findByIdAndUpdate(
                id,
                { completed },
                { new: true }
            );
            if (!updatedTask) {
                throw new Error('Task not found');
            }
            return updatedTask;
        },

        deleteTask: async (_, { id }) => {
            // Find and delete the task
            const deletedTask = await Task.findByIdAndDelete(id);
            if (!deletedTask) {
                throw new Error('Task not found');
            }

            // Remove the task from the associated task list and save
            const taskList = await TaskList.findOne({ tasks: id });
            if (taskList) {
                taskList.tasks = taskList.tasks.filter((taskId) => taskId.toString() !== id);
                await taskList.save();
            }

            return deletedTask;
        },

        createTaskList: async (_, { title, taskIds = [], visible }) => {
            // Create a new task list
            const newTaskList = new TaskList({
                title,
                tasks: taskIds,
                visible,
            });

            await newTaskList.save();
            return newTaskList;
        },

        updateTaskListVisibility: async (_, { id, visible }) => {
            // Find the task list by its ID
            const taskList = await TaskList.findById(id);  // Assuming TaskList is your model

            // If no task list is found, throw an error
            if (!taskList) {
                throw new Error('Task List not found');
            }

            // Update the visibility of the task list
            taskList.visible = visible;

            // Save the updated task list
            await taskList.save();

            // Return the updated task list with required fields
            return {
                id: taskList.id,
                title: taskList.title,
                visible: taskList.visible
            };
        },

    },
    Subscription: {
        taskListUpdated: {
            subscribe: () => {
                console.log("Subscription initialized");
                return pubsub.asyncIterator([TASK_LIST_UPDATED]);
            },
        },
    },

};

module.exports = resolvers;
