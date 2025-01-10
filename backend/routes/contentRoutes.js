const express = require('express');
const homeController = require('../controllers/homeController');
const contentController = require('../controllers/contentController');
const router = express.Router();


// Description: Handles requests to the home page.

// Possible Queries:
// - No query parameters are expected for this endpoint.

// Fetches the top 4 featured tech-related news articles from the News collection.
// Fetches the top 4 featured health-related news articles from the News collection.
// Fetches the latest 5 non-featured blogs from the Blog collection.
// Fetches the latest 5 non-featured news articles from the News collection.
// Fetches the top 4 featured manufacturing-related news articles from the News collection.
// Fetches the top 4 featured press releases from the Press collection.
// Fetches the top 4 featured blogs from the Blog collection.
// Fetches the top 4 featured solutions from the Solution collection.
// Fetches the top 5 featured leaders (images only) from the Leader collection.
router.get('/', homeController.getHomePage);

// Description: Handles requests to view the content listing page, typically showing multiple content types or categories.

// Possible Queries:
// - `searchTitle` (optional): Search for content by title.
// - `filterType` (optional): Filter content by type (e.g., 'Blog', 'News').
// - `filterFeatured` (optional): Filter featured content (e.g., 'on' for featured content).
// - `filterTags` (optional): Filter by tags, e.g., 'technology, health'.
// - `page` (optional, default: 1): Paginate through content results.

// Example of URL: `/content?searchTitle=tech&filterType=Blog&page=2`
router.get('/content', contentController.getContentPage);

// Description: Handles requests to view the details of a specific content type and content item by its ID.
// Possible Queries:
// - `:type` (required): Content type, e.g., 'blog', 'news', etc.
// - `:id` (required): The unique identifier of the content to view details of (e.g., blog post ID).
// Example of URL: `/content/blog/12345`
router.get('/content/:type/:id', contentController.getContentDetailPage);


module.exports = router;
