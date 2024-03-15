

const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_flavors_db')
const express = require('express')
const app = express()

// parse the body into JS Objects
app.use(express.json())

// Log the requests as they come in
app.use(require('morgan')('dev'))


// Read Notes - R
app.get('/api/flavors', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from flavors ORDER BY created_at DESC;
      `
      const response = await client.query(SQL)
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
  })
// Create Notes - C
app.post('/api/flavors', async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO flavors(flavor)
      VALUES($1)
      RETURNING *
    `
    const response = await client.query(SQL, [req.body.flavor])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})


// Update Notes - U
app.put('/api/flavors/:id', async (req, res, next) => {
  try {
    const SQL = `
      UPDATE flavor
      SET flavor=$1, ranking=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `
    const response = await client.query(SQL, [req.body.flavors, req.body.ranking, req.params.id])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

// Delete Notes - D
app.delete('/api/flavors/:id', async (req, res, next) => {
  try {
    const SQL = `
      DELETE from flavors
      WHERE id = $1
    `
    const response = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (ex) {
    next(ex)
  }
})

// create and run the express app

const init = async () => {
  await client.connect()
  let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      ranking INTEGER DEFAULT 3 NOT NULL,
      txt VARCHAR(255) NOT NULL
    );
  `
  await client.query(SQL)
  console.log('tables created')
 SQL = `
    INSERT INTO flavors(txt, ranking) VALUES('Vanilla',1);
    INSERT INTO flavors(txt, ranking) VALUES('Chocolate', 2);
    INSERT INTO flavors(txt, ranking) VALUES('Strawberry', 3);
    INSERT INTO flavors(txt, ranking) VALUES('Mixed Berry', 4);
    INSERT INTO flavors(txt, ranking) VALUES('Secret Flavor ', 5);
  `
  await client.query(SQL)
  console.log('data seeded')
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`listening on port ${port}`))
}

init()