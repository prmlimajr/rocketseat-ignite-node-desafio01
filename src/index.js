const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.header;

  const [userExists] = users.filter((user) => user.username !== username);

  if (!userExists) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  request.user = userExists;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const [userAlreadyExists] = users.filter(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "Mensagem do erro",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const userExists = request.user;

  const list = userExists.todos;

  return response.status(201).json(list);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;

  const user = request.user;

  const [todo] = user.todos.filter((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  if (title) {
    todo.title = title;
  }

  if (deadline) {
    todo.deadline = new Date(deadline);
  }

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;

  const user = request.user;

  const [todo] = user.todos.filter((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;

  const user = request.user;

  const todoIndex = user.todos.findIndex((item) => item.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
