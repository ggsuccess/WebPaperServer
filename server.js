const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose
  .connect('mongodb://localhost/webpaperdb')
  .then(() => console.log('Connected mongoDB'))
  .catch(err => console.error('not connected mongoDB', err));

app.get('/', (req, res) => {
  res.send('hi');
});

app.get('/api/getId', (req, res) => {
  res.send('this id');
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server on port ${port}...`));
