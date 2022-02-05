const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }
  request.user = user;

  return next();
}

function checksExistsTask(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const tasks = user.todos;

  const task = tasks.find((tasks) => tasks.id === id);

  if (!task) {
    return response.status(404).json({ error: "Task not found" });
  }

  request.task = task;
  request.tasks = tasks;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({ error: "User already exist!" });
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTask,
  (request, response) => {
    const { task } = request;
    const { title, deadline } = request.body;

    task.title = title;
    task.deadline = new Date(deadline);

    return response.status(201).json(task);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTask,
  (request, response) => {
    const { user, task } = request;
    task.done = true;

    return response.status(201).json(task);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTask,
  (request, response) => {
    const { user, task, tasks } = request;
    tasks.splice(task, 1);

    return response.status(204).json(tasks);
  }
);

module.exports = app;
