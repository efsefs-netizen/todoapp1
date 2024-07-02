const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
const dbpath = path.join(__dirname, 'todoApplication.db')

app.use(express.json())

let db = null
let initializeDBAndServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => console.log('The Server is running'))
}

initializeDBAndServer()

const hasPriorityAndStatusProperties = requstQuery => {
  return requstQuery.priority !== undefined && requstQuery.status !== undefined
}

const hasPriorityProperty = requstQuery => {
  return requstQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//api1
let getTodosQuery = ''
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            SELECT * FROM todo WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}'
            `
      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT * FROM todo WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            `
      break

    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT * FROM todo WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            `
      break

    default:
      getTodosQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
      `
  }
  const requstQuery = await db.all(getTodosQuery)
  response.send(requstQuery)
})

//api2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  getTodosQuery = `
  SELECT * FROM todo WHERE
  id = ${todoId}
  `
  const getTodo = await db.get(getTodosQuery)
  response.send(getTodo)
})

//api3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  getTodosQuery = `
  INSERT INTO todo(id,todo,priority,status)
  values(${id},'${todo}','${priority}','${status}')
  `
  await db.run(getTodosQuery)
  response.send('Todo Successfully Added')
})

let msg = ''
//api4
app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
  switch (true) {
    case status !== undefined:
      getTodosQuery = `
      UPDATE todo SET
      status = '${status}'
      WHERE id = ${todoId}`
      msg = 'Status Updated'
      break
    case priority !== undefined:
      getTodosQuery = `
      UPDATE todo SET
      priority = '${priority}'
      WHERE id = ${todoId}`
      msg = 'Priority Updated'
      break
    case todo !== undefined:
      getTodosQuery = `
      UPDATE todo SET
      todo = '${todo}'
      WHERE id = ${todoId}`
      msg = 'Todo Updated'
      break
  }
  await db.run(getTodosQuery)
  response.send(msg)
})

//api5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  getTodosQuery = `
  DELETE FROM todo WHERE
  id = ${todoId}
  `
  await db.run(getTodosQuery)
  response.send('Todo Deleted')
})

module.exports = app
