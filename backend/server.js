const express = require('express');
const cors = require('cors');
const db = require('./db');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log('server on port', PORT);
});
