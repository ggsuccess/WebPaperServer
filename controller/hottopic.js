const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const hottopicRouter = express.Router();
const BING_ENDPOINT = 'https://api.cognitive.microsoft.com/bing/v7.0/news';
const {
  getCategory,
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
    articleList: Array,
    count: Number,
    topic: String,
    url: String,
    text: String,
    del: String,
    img: String,
    category: String
  })
);

const LinkedNews = mongoose.model(
  'linkednews',
  new mongoose.Schema({
    category: String,
    url: String,
    name: String,
    img: String,
    count: 0,
    provider: String,
    date: String,
    description: String,
    keyword: String
  })
);

function getKeyword(query) {
  let count = 0;
  for (let i = 0; i < query.length; i++) {
    if (query[i] === ' ') count++;
    if (count === 4) {
      return query.slice(0, i);
    }
  }
}

function saveLinkedArticle(query, key, lang, category, count) {
  let topic = query;
  query = getKeyword(query);
  // console.log('검색어', query);

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

  request.get(option, async (err, res, body) => {
    console.log(body);
    if (!err && res.statusCode == 200) {
      let info = JSON.parse(body); //query로 검색한 기사객체 배열
      let news = info.value.filter(
        x => x.hasOwnProperty('url') & x.hasOwnProperty('name')
      );
      let hot = await HotTopic.find({ topic: topic });
      hot[0].articleList = news;
      await hot[0].save();
    }
  });
}

async function getHotTopic() {
  let model;
  let result = [];
  try {
    for (let i = 0; i < categoryArr.length; i++) {
      // console.log(categoryArr[i]);
      model = await categoryArr[i].find().sort('-count');

      await result.push(model[0]);
    }
  } catch (err) {
    console.log(err);
  }
  // console.log('===================', result);

  HotTopic.deleteMany({ del: 'del' }, async (err, data) => {
    if (err) {
      console.log('에러', err);
    } else {
      console.log('결과', data);
    }
  });

  for (let i = 0; i < result.length; i++) {
    //result  각 카테고리별 최대 조회수 기사 배열

    if (result[i]) {
      let hottopic = new HotTopic({
        articleList: [],
        count: result[i].count,
        img: result[i].img,
        topic: result[i].name,
        url: result[i].url,
        text: result[i].description,
        del: 'del',
        category: result[i].category
      });
      await hottopic.save();

      saveLinkedArticle(
        //각 기사제목 앞 세단어 검색
        result[i].name,
        process.env.API_KEY_COOKIE,
        'en-us',
        result[i].category,
        10
      );
    }
  }
}

hottopicRouter.get('/get', (req, res) => {
  getHotTopic();
  res.send('ok');
});

hottopicRouter.get('/', async (req, res) => {
  try {
    let hottopic = await HotTopic.find().sort('-count');
    res.send(hottopic);
  } catch (err) {
    console.log(err);
  }
});

module.exports = { getHotTopic, hottopicRouter };
