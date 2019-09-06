const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const categoryRouter = express.Router();

let schobj = {
  category: String,
  url: String,
  name: String,
  img: String,
  count: Number,
  keyword: [String],
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
          name: news.name,
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

categoryRouter.get('/', async (req, res) => {
  let genre = req.query.name;
  console.log('hihihih');
  genre = genre.toLowerCase();
  let model = 'no pages';
  if (genre === 'sports') {
    model = await Sports.find().sort('date');
  } else if (genre === 'business') {
    model = await Business.find().sort('date');
  } else if (genre === 'entertainment') {
    model = await Entertainment.find().sort('date');
  } else if (genre === 'health') {
    model = await Health.find().sort('date');
  } else if (genre === 'politics') {
    model = await Politics.find().sort('date');
  } else if (genre === 'products') {
    model = await Politics.find().sort('date');
  } else if (genre === 'scienceandtechnology') {
    model = await ScienceAndTechnology.find().sort('date');
  }
  res.send(model);
});

// categoryRouter.get('/:categoryname', async (req, res) => {});

// categoryRouter.get('/sports', async (req, res) => {
//   const sports = await Sports.find().sort('date');
//   res.send(sports);
// });

// categoryRouter.get('/business', async (req, res) => {
//   const business = await Business.find().sort('date');
//   res.send(business);
// });

// categoryRouter.get('/entertainment', async (req, res) => {
//   const entertainment = await Entertainment.find().sort('date');
//   res.send(entertainment);
// });

// categoryRouter.get('/health', async (req, res) => {
//   const health = await Health.find().sort('date');
//   res.send(health);
// });

// categoryRouter.get('/politics', async (req, res) => {
//   const politics = await Politics.find().sort('date');
//   res.send(politics);
// });

// categoryRouter.get('/products', async (req, res) => {
//   const products = await Products.find().sort('date');
//   res.send(products);
// });

// categoryRouter.get('/scienceAndTechnology', async (req, res) => {
//   const scienceAndTechnology = await ScienceAndTechnology.find().sort('date');
//   res.send(scienceAndTechnology);
// });

module.exports = {
  categoryRouter,
  saveAllArticle,
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
};
