const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");
const initser = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("running");
  });
};
initser();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const quer = `
    select * from todo where 
    id=${todoId}
    `;
  const re = await db.get(quer);
  response.send(re);
  console.log(re);
});
app.post("/todos/", async (request, response) => {
  const details = request.body;
  const { id, todo, priority, status } = details;
  const qu = `
    insert into todo (id,todo,priority,status)
    values(${id},"${todo}","${priority}","${status}")
    `;
  const re = await db.run(qu);
  response.send("Todo Successfully Added");
  console.log(re);
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;

  const qu = null;
  if (status !== undefined) {
    const qu = `
        update todo set id=${todoId}
         where id=${todoId}
        `;
    const re = await db.run(qu);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const qu = `
        update todo set priority="${priority}"
        where id=${todoId}
       
        `;
    const re = await db.run(qu);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const qu = `
        update todo set todo="${todo}"
         where id=${todoId}
        `;
    const re = await db.run(qu);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const quu = `
    delete from todo where id=${todoId}
    `;
  await db.run(quu);
  response.send("Todo Deleted");
});
module.exports = app;
