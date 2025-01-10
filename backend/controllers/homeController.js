const News = require('../models/news');
const Blog = require('../models/blog');
const Press = require('../models/press');
const Solution = require('../models/solution');
const Leader = require('../models/leader');
const Magazine = require('../models/magazine');

const homeController = {
  getHomePage: async (req, res) => {
    try {
      const techNews = await News.find({ tags: /technology/i, featured: true }).limit(4);
      techNews.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200) + "...";
      });

      const healthNews = await News.find({ tags: /health/i, featured: true }).limit(4);
      healthNews.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const latestBlogs = await Blog.find({ featured: false }).limit(5);
      latestBlogs.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const latestNews = await News.find({ featured: false }).limit(5);
      latestNews.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const manufacturingNews = await News.find({ tags: /manufacturing/i, featured: true }).limit(4);
      manufacturingNews.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const featuredPress = await Press.find({ featured: true }).limit(4);
      featuredPress.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const featuredBlogs = await Blog.find({ featured: true }).limit(4);
      featuredBlogs.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const solutions = await Solution.find({ featured: true }).limit(4);
      solutions.forEach(article => {
        article.content = article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";
      });

      const magazines = await Magazine.find({ featured: true }).select('image').limit(5);

      const leaders = await Leader.find({ featured: true }).limit(5);

      const data = {
        techNews, healthNews, latestBlogs, latestNews,
        manufacturingNews, featuredBlogs, solutions,
        magazines, leaders, featuredPress
      };
      res.render('home-page.ejs', { data });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching content');
    }
  }
};

module.exports = homeController;
