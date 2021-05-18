const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const usersSave = [];

// const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const verify = usersSave.find((index) => index.username === username);

  if(!verify) {
    return response.status(400).json({ error: "Usuário nao encontrado"})
  }

  request.verify = verify;

  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const userAlreadyExists = usersSave.some((index) => index.username === username) 

  if(userAlreadyExists) {
    return response.status(400).json("Users Already Exists")
  }

  usersSave.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  }) 

  return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { verify } = request;

  return response.json(verify.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const {verify} = request;
    

    const createTodo ={
      id: uuidv4(),
      title: title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    }

    verify.todos.push(createTodo)

    return response.status(201).json(createTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { verify } = request;
  const { title, deadline } = request.body;
  const { id } = request.params; //pega da URL

  const todo = verify.todos.find(index => index.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Todo not Found"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);  

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { verify } = request;
  const { id } = request.params; //pega da URL

  const todo = verify.todos.find(index => index.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Todo not Found"})
  }

  todo.done = true;
  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { verify } = request;
  const {id} = request.params;

  const todoIndex = verify.todos.findIndex(index => index.id === id) //FindIndex retorna a posicao no array

  if(todoIndex === -1) {
    return response.status(404).json({ error: "Todo not Found"})
  }

  verify.todos.splice(todoIndex, 1); //posicao todoIndex e so exclui 1 q sera ele

  return response.status(204).json();
});

module.exports = app;