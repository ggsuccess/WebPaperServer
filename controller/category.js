const mongoose = require('mongoose');
const express = require('express');
var request = require('request');

let schobj = {
  category: String,
  url: String,
  img: String,
  count: Number,
  keword: [String],
  provider: String,
  date: String,
  description: String
};

const Sports = mongoose.model('Sports', new mongoose.Schema(schobj));
const Business = mongoose.model('Business', new mongoose.Schema(schobj));
const Entertainment = mongoose.model(
  'Entertainment',
  new mongoose.Schema(schobj)
);
const Health = mongoose.model('Health', new mongoose.Schema(schobj));
const Politics = mongoose.model('Politics', new mongoose.Schema(schobj));
const Products = mongoose.model('Products', new mongoose.Schema(schobj));
const ScienceAndTechnology = mongoose.model(
  'ScienceAndTechnology',
  new mongoose.Schema(schobj)
);

const BING_ENDPOINT = 'https://api.cognitive.microsoft.com/bing/v7.0/news';
const API_KEY_COOKIE = '623991a42f5749198cf6e80737cbb84a';
// CLIENT_ID_COOKIE = 'bing-search-client-id';

function saveAllArticle(query, key, model, lang, category, count) {
  let options =
    'mkt=' + lang + '&category=' + category + '&count=' + count + '&offset=0';
  console.log(options);
  if (query) {
    var queryurl =
      BING_ENDPOINT +
      '/search' +
      '?q=' +
      encodeURIComponent(query) +
      '&' +
      options;
  } else {
    var queryurl = BING_ENDPOINT + '?' + options;
  }

  var option = {
    url: queryurl,
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      Accept: 'application/json'
    }
  };

  request(option, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      let info = JSON.parse(body);
      // console.log(info);
      for (let i = 0; i < info.value.length; i++) {
        let news = info.value[i];
        console.log('기사:', news);
        let article = new model({
          category: news.category,
          url: news.url,
          img: news.image ? news.image.thumbnail.contentUrl : '',
          count: 0,
          keword: [],
          provider: news.provider[0].name,
          description: news.description,
          date: news.datePublished
        });

        model.find({ url: article.url }, function(err, docs) {
          //중복데이터 아닐때만 저장
          if (!err && docs.length === 0) {
            article.save();
            console.log(article);
          }
        });
      }
    }
  });

  return false;
}
// bingNewsSearch('조국', 'mkt=ko-KR&count=50&offset=0', API_KEY_COOKIE);
module.exports = {
  saveAllArticle,
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
};
