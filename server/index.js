const express = require('express');
const cors = require('cors'); // Allow front end to request from backend port

const app = express();

// Hardcode port for now, can make environment variable later if needed
// (will probably do so when adding database connection)
const PORT = 5000; 

app.use(cors());
app.use(express.json());

// Confirm root works
app.get('/', (req, res) => {
  res.json({ message: 'Entered server root' });
});

// Check server status
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running! Yay!' });
});

// Add endpoints for route files here
app.use('/products', require('./routes/products'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
