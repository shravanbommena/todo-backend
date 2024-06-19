const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      driver: sqlite3.Database,
      filename: dbPath,
    });
    app.listen(5000, () => {
      console.log("Server started at http://localhost:5000");
    });
  } catch (e) {
    console.log(`error Message: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/", async (request, response) => {
  const getAllTodosQuery = `SELECT * FROM todo;`;
  const allTodos = await db.all(getAllTodosQuery);
  response.send(allTodos);
});

app.post("/todos", async (request, response) => {
  const { todo } = request.body;
  const addTodoQuery = `INSERT INTO todo (todo, completed) VALUES ('${todo}', 0);`;
  const dbResponse = await db.run(addTodoQuery);
  const todoId = dbResponse.lastID;
  response.send({ todoId });
});

app.put("/todos/:id", async (request, response) => {
  const { id } = request.params;
  const { completed } = request.body;
  const updateTodoQuery = `UPDATE todo SET completed=${completed} WHERE id=${id};`;
  await db.run(updateTodoQuery);
  response.send("updated todo successfully");
});

app.delete("/todos/:id", async (request, response) => {
  const { id } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${id}`;
  await db.run(deleteTodoQuery);
  response.send("deleted todo successfully");
});
