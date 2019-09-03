const mongoose = require('mongoose');
const express = require('express');

const userSchema = new mongoose.Schema({
  name: String,
  name: String,
  pw: String,
  category: String,
  follow: String,
  bookmark: String,
  comment: [String]
});
const User = mongoose.model('userlist', userSchema);

// async function createUser() {
//     const user = new User({
//       name: '영훈'
//     });

//     const result = await user.save();
//     console.log(result);
//   }

// createUser();
