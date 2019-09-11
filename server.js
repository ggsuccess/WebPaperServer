require('express-async-errors');
const config = require('config');
const error = require('./middleware/error');
const mongoose = require('mongoose');
const express = require('express');
const winston = require('winston');
const app = express();
require('./middleware/protect')(app);
const cors = require('cors');
const { usersRouter } = require('./controller/user');
const { getHotTopic, hottopicRouter } = require('./controller/hottopic');
const { API_KEY_COOKIE } = require('./key');
const { authRouter } = require('./controller/auth');
const { commentRouter, hotcommentRouter } = require('./controller/comment');
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

if (!config.get('jwtPrivateKey')) {
  console.error('Error: jwtPrivateKey is not defined');
  process.exit(1);
}

process.on('uncaughtException', err => {
  console.log('I got a uncaught exception error =>', Error);

  // winston.error(err.message, err);
});
process.on('unhandledRejection', err => {
  console.log('I got a uncaught UNHANDLED REJECTION =>', err);

  // winston.error(err.message, err);
});

mongoose
  .connect(
    // 'mongodb://localhost/webpaperdb'
    'mongodb+srv://admin:Fvifnwp6GQRVlOap@webpaperserver-dpwdk.mongodb.net/test?retryWrites=true&w=majority'
  )
  .then(() => console.log('Connected mongoDB'))
  .catch(err => console.error('not connected mongoDB', err));

app.use(cors());
app.use(express.json());
app.use('/api/category', categoryRouter);
app.use('/api/count', categoryRouter);
app.use('/api/hottopic', hottopicRouter);
app.use('/api/gettopiccomments', hotcommentRouter);
app.use('/api/comment', commentRouter);
app.use('/api/getusercomments', commentRouter);
app.use('/api/user', usersRouter);
app.use('/api/login', authRouter);

app.use(error);

let min = 1000 * 60;
let hour = 60 * min;
setInterval(() => {
  for (let i = 0; i < categoryArr.length; i++) {
    saveAllArticle(
      '',
      API_KEY_COOKIE,
      categoryArr[i],
      'en-us',
      categoryStringArr[i],
      100
    );
  }
}, 3 * hour);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server on port ${port}...`));
