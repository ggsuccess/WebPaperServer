const mongoose = require('mongoose');
const express = require('express');
const app = express();
const {
  saveAllArticle,
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
} = require('./controller/category');

let categoryArr = [
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
];
let categoryStringArr = [
  'sports',
  'business',
  'entertainment',
  'health',
  'politics',
  'products',
  'scienceAndTechnology'
];

const API_KEY_COOKIE = '623991a42f5749198cf6e80737cbb84a';

mongoose
  .connect('mongodb://localhost/webpaperdb')
  .then(() => console.log('Connected mongoDB'))
  .catch(err => console.error('not connected mongoDB', err));

let min = 1000 * 60;
setInterval(() => {
  for (let i = 0; i < categoryArr.length; i++) {
    saveAllArticle(
      '',
      API_KEY_COOKIE,
      categoryArr[i],
      'en-us',
      categoryStringArr[i],
      20
    );
  }
}, 5 * min);

app.get('/', (req, res) => {
  res.send('hi');
});

app.get('/api/getId', (req, res) => {
  res.send('this id');
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server on port ${port}...`));
