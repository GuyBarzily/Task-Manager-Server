const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    priority: String!
    deadline: String
    description: String
    completed: Boolean!
  }

  type TaskList {
    id: ID!
    title: String!
    tasks: [Task!]!
    visible: Boolean!
  }

  type Query {
    tasks: [Task!]
    taskLists: [TaskList!]
  }

  type Mutation {
    createTask(
      title: String!
      priority: String!
      deadline: String
      description: String
      completed: Boolean
      listId: ID!
    ): Task
    updateTask(id: ID!, completed: Boolean!): Task
    deleteTask(id: ID!): Task
    createTaskList(title: String!, taskIds: [ID!], visible: Boolean!): TaskList
  }

  type Subscription {
    taskListUpdated: TaskList
  }
`;


module.exports = typeDefs;
