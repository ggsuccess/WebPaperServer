const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const hottopicRouter = express.Router();

const API_KEY_COOKIE = '623991a42f5749198cf6e80737cbb84a';
const BING_ENDPOINT = 'https://api.cognitive.microsoft.com/bing/v7.0/news';
const {
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
} = require('./category');

let categoryArr = [
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
];

const HotTopic = mongoose.model(
  'hottopic',
  new mongoose.Schema({
    articleList: [String],
    count: Number,
    topic: String,
    url: String,
    text: String,
    del: String
  })
);

function saveLinkedArticle(query, key, lang, category, count) {
  let result = [];
  let options =
    'mkt=' + lang + '&category=' + category + '&count=' + count + '&offset=0';
  // console.log(options);
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
        let article = {
          category: news.category,
          url: news.url,
          name: news.name,
          img: news.image ? news.image.thumbnail.contentUrl : '',
          count: 0,
          keword: [],
          provider: news.provider[0].name,
          description: news.description,
          date: news.datePublished
        };
        result.push(article);
        // console.log(result);
      }
    }
  });

  return result;
}

async function getHotTopic() {
  let model;
  let result = [];
  for (let i = 0; i < categoryArr.length; i++) {
    // console.log(categoryArr[i]);
    model = await categoryArr[i].find().sort('-count');
    result.push(model[0]);
  }
  // console.log('===================', result);

  HotTopic.deleteMany({ del: 'del' }, function(err, data) {
    if (err) {
      console.log('에러', err);
    } else {
      console.log('결과', data);
    }
  });
  let hottopic;
  for (let i = 0; i < result.length; i++) {
    let linkedNews = await saveLinkedArticle(
      result[i].name,
      API_KEY_COOKIE,
      'en-us',
      result[i].category,
      20
    );

    hottopic = new HotTopic({
      articleList: linkedNews.slice(),
      count: result[i].count,
      topic: result[i].name,
      url: result[i].url,
      text: result[i].description,
      del: 'del'
    });
    hottopic.save();
  }
}

hottopicRouter.get('/', async (req, res) => {
  console.log(req.body);
  let hottopic = await HotTopic.find().sort('-count');
  res.send(hottopic);
});

//최대 다섯개 의 핫토픽
//존재하는 내용 모두 제거
//각 카테고리별 탑 7개 선별 후 배치

module.exports = { getHotTopic, hottopicRouter };
