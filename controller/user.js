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
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
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
  let user = await User.findById(req.user._id).select('-pw');
  res.send(user);
});

usersRouter.post('/signup', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('email is duplicated');

  user = new User(_.pick(req.body, ['email', 'pw']));
  const salt = await bcrypt.genSalt(10);
  user.pw = await bcrypt.hash(user.pw, salt);

  await user.save();

  res.send(_.pick(user, ['_id', 'email']));
});

usersRouter.post('/bookmark', auth, async (req, res) => {
  const { url, category } = req.body;
  let Model = getCategory(category);
  let news = await Model.find({ url: url });
  let user = await User.findById(req.user._id);
  user.bookmark.push(news[0]);
  await user.save();
  res.send('ok');
  // res.send(user.bookmark);
});

module.exports = { usersRouter, User };
