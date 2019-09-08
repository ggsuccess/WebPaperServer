const config = require('config');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');
const Joi = require('@hapi/joi');
const authRouter = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('./user');

authRouter.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or pw');

  const validPw = await bcrypt.compare(req.body.pw, user.pw);
  if (!validPw) return res.status(400).send('Invalid email or pw');

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(user) {
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

module.exports = { authRouter };
