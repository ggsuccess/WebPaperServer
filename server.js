const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');

const API_KEY_COOKIE = '623991a42f5749198cf6e80737cbb84a';

const {
  categoryRouter,
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
}, 10 * min);
app.use(cors());
app.use(express.json());
app.use('/api/category', categoryRouter);
app.use('/api/count', categoryRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server on port ${port}...`));
