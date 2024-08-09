const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'jaferc',
  password: '1234',
  port: 5432,
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const client = await pool.connect();

  try {
    const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [firstName, lastName, email, password];

    const result = await client.query(query, values);
    console.log('User added:', result.rows[0]);
    res.status(200).send(`User added: ${JSON.stringify(result.rows[0])}`);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Error adding user');
  } finally {
    client.release();
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const client = await pool.connect();

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(400).send('Email not found');
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(400).send('Incorrect password');
    }

    res.status(200).send('Login successful');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login');
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
