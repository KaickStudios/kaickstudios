require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

app.use(express.json());
app.use(express.static('src'));

const users = []; // This should be replaced with a database in a real application

// Authentication routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).send('User registered');
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Protected blog route
app.get('/api/blog', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');
  try {
    const verified = jwt.verify(token, 'secret_key');
    res.json({ message: 'Welcome to the private blog' });
  } catch (err) {
    res.status(400).send('Invalid token');
  }
});

// AI route
app.get('/api/ai', async (req, res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: "Hello, world!",
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Chat functionality
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});