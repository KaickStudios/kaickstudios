import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

document.getElementById('aiButton').addEventListener('click', async () => {
  const response = await fetch('/api/ai');
  const data = await response.json();
  document.getElementById('aiResponse').innerText = data.choices[0].text;
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    document.getElementById('loginResponse').innerText = 'Login successful';
  } catch (error) {
    document.getElementById('loginResponse').innerText = 'Login failed: ' + error.message;
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, username, password);
    document.getElementById('registerResponse').innerText = 'Registration successful';
  } catch (error) {
    document.getElementById('registerResponse').innerText = 'Registration failed: ' + error.message;
  }
});

const socket = io();
document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.getElementById('message').value;
  socket.emit('chat message', message);
  document.getElementById('message').value = '';
});

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  document.getElementById('messages').appendChild(item);
});

