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
  // Get content listing (with pagination and filtering)
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

      // Process articles and shorten content preview
      articles.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 75) + "...";

        // If image exists, convert it to base64 for front-end rendering
        if (article.image && article.image.data) {
          article.imageBase64 = article.image.data.toString('base64');
          article.imageMimeType = article.image.contentType;
        }
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

  // Get detailed content page
  getContentDetailPage: async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);

    try {
      const content = await model.findById(id);

      // If image exists, convert it to base64 for front-end rendering
      if (content.image && content.image.data) {
        content.imageBase64 = content.image.data.toString('base64');
        content.imageMimeType = content.image.contentType;
      }

      res.render('content', { content, type });
    } catch (err) {
      console.error('Error fetching content to show:', err);
      res.status(500).send('Error fetching content');
    }
  },
};

module.exports = contentController;
