const mongoose = require('mongoose');
const express = require('express');
const Joi = require('@hapi/joi');
const usersRouter = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { getCategory } = require('./category');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  pw: {
    type: String,
    require: true,
    minlength: 5,
    maxlength: 1024,
    unique: true
  },
  category: String,
  follow: String,
  bookmark: Array,
  comment: Array
});
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ email: this.email }, config.get('jwtPrivateKey'));
  return token;
};
const User = mongoose.model('userlist', userSchema);

function validateUser(user) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(50)
      .required(),
    pw: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

usersRouter.get('/me', auth, async (req, res) => {
  try {
    let user = await User.find({ email: req.user.email }).select('-pw');
    res.send(user);
  } catch (err) {
    res.status(500).send('something wrong in profile informaiton');
  }
});

usersRouter.post('/signup', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('email is duplicated');

    user = new User(_.pick(req.body, ['email', 'pw']));
    const salt = await bcrypt.genSalt(10);
    user.pw = await bcrypt.hash(user.pw, salt);
    await user.save();
    const token = user.generateAuthToken();

    res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .send(_.pick(user, ['_id', 'email']));
  } catch (err) {
    res.status(500).send('something wrong in singup');
  }
});

usersRouter.post('/bookmark', auth, async (req, res) => {
  const { url, category } = req.body;

  let Model = getCategory(category);

  let news = await Model.find({ url: url });
  console.log(news);
  let user = await User.find({ email: req.user.email });

  user[0].bookmark.push(news[0]);

  await user[0].save();

  res.send('ok');

  // res.send(user.bookmark);
});

usersRouter.get('/getbookmark', auth, async (req, res) => {
  console.log(req.user);

  try {
    let user = await User.find({ email: req.user.email });
    res.send(user[0].bookmark);
  } catch (err) {
    res.status(500).send('something err');
  }
});

module.exports = { usersRouter, User };
