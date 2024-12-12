const { PubSub } = require('graphql-subscriptions');
const Task = require('../models/Task');
const TaskList = require('../models/TaskList');

// Create a PubSub instance
const pubsub = new PubSub();
const TASK_LIST_UPDATED = 'TASK_LIST_UPDATED';

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

            // Publish the updated task list to subscribers
            const updatedTaskList = await TaskList.findById(listId).populate('tasks');
            pubsub.publish(TASK_LIST_UPDATED, { taskListUpdated: updatedTaskList });

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

            // Find the associated task list and publish the update
            const taskList = await TaskList.findOne({ tasks: id }).populate('tasks');
            if (taskList) {
                pubsub.publish(TASK_LIST_UPDATED, { taskListUpdated: taskList });
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

                // Publish the updated task list to subscribers
                const updatedTaskList = await TaskList.findById(taskList.id).populate('tasks');
                pubsub.publish(TASK_LIST_UPDATED, { taskListUpdated: updatedTaskList });
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

            // Publish the new task list to subscribers
            pubsub.publish(TASK_LIST_UPDATED, { taskListUpdated: newTaskList });

            return newTaskList;
        },
    },

    Subscription: {
        taskListUpdated: {
            subscribe: () => pubsub.asyncIterator([TASK_LIST_UPDATED]),
        },
    },
};

module.exports = resolvers;
