// 📚 Libraries
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 8080;

app.use(express.json()); // Body parser for POST requests

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}...`);
});
