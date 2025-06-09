import express from 'express';
import mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import cors from 'cors';
import type { Request, Response } from 'express'; 
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'one_project',
});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (err: any) {
    console.error('Database connection error:', err.message);
  }
}
testConnection();

// CREATE USER
app.post('/users', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
console.log('username, email, password')
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({
      success: true,
      message: 'User created',
      insertId: (result as ResultSetHeader).insertId,
    });
  } catch (err: any) {
    console.error('Error in /users:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to create user' });
  }
});

// LOGIN
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('Query result:', rows);

    const user = rows[0];
    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    console.log('Password correct?', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET not set in .env, using fallback');
    }
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
    console.log('Token created:', token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error('Error in /login route:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// READ USERS
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email FROM users');
    res.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Error in /users GET:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch users' });
  }
});

// UPDATE USER
app.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    let query = 'UPDATE users SET username = ?, email = ?';
    const values: any[] = [username, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      values.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    values.push(id);

    const [result] = await pool.query(query, values);
console.log(result, query)
    if ((result as ResultSetHeader).affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated' });
  } catch (err: any) {
    console.error('Error in /users/:id PUT:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to update user' });
  }
});

// DELETE USER
app.delete('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if ((result as ResultSetHeader).affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    console.error('Error in /users/:id DELETE:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete user' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on(' error', (err) => {
  console.error('Server error:', err);
});