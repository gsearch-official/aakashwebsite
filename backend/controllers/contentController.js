const News = require('../models/news');
const Blog = require('../models/blog');
const Press = require('../models/press');
const Solution = require('../models/solution');
const Leader = require('../models/leader');

const getModelForType = (type) => {
  switch (type) {
    case 'Blog': return Blog;
    case 'Solution': return Solution;
    case 'News': return News;
    case 'Press': return Press;
    case 'Leader': return Leader;
    default: return Blog;
  }
};

const contentController = {
  getContentPage: async (req, res) => {
    try {
      const { type, tag, page = 1, search } = req.query;
      const pageNumber = parseInt(page);
      const limitNumber = 28;
      const skip = (pageNumber - 1) * limitNumber;

      let query = {};
      if (type) query.type = type;
      if (tag) query.tags = new RegExp(tag, 'i');
      if (search) query.title = new RegExp(search, 'i');

      const model = getModelForType(type);
      const totalItems = await model.countDocuments(query);
      const articles = await model.find(query).skip(skip).limit(limitNumber);

      articles.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 75) + "...";
      });

      const totalPages = Math.ceil(totalItems / limitNumber);

      res.render('content-cards', {
        title: tag || search || type,
        tag, type, search, articles,
        pagination: { currentPage: pageNumber, totalPages, totalItems, limit: limitNumber }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching content');
    }
  },

  getContentDetailPage: async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);

    try {
      const content = await model.findById(id);
      res.render('content', { content, type });
    } catch (err) {
      console.error('Error fetching content to show:', err);
      res.status(500).send('Error fetching content');
    }
  },
};

module.exports = contentController;
