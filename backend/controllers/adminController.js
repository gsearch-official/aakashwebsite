const express = require('express');
const Blog = require('../models/blog');
const Leader = require('../models/leader');
const News = require('../models/news');
const Press = require('../models/press');
const Solution = require('../models/solution');
const Magazine = require('../models/magazine');
const multer = require('multer');
const path = require('path');
const { log } = require('console');

// Memory storage for Multer (to store images as buffers)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    }
    res.redirect('/admin/login');
};

const getModelForType = (type) => {
    switch (type) {
        case 'Blog': return Blog;
        case 'Solution': return Solution;
        case 'News': return News;
        case 'Press': return Press;
        case 'Leader': return Leader;
        case 'Magazine': return Magazine;
        default: return Blog;
    }
};


// Create Content
const createContent = async (req, res) => {
    const { title, tags, type, content, featured } = req.body;

    const imageBuffer = req.file.buffer;  // Access the image buffer
    const contentType = req.file.mimetype;  // Get MIME type (e.g., image/jpeg)

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const model = getModelForType(type);

    try {
        const newContent = new model({
            title, 
            type, 
            tags: tagsArray, 
            content, 
            image: { data: imageBuffer, contentType: contentType },  // Store image buffer
            featured: featured ? true : false
        });
        await newContent.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Error creating content:', err);
        res.status(500).send('Error creating content');
    }
};

// Edit Content
const editContent = async (req, res) => {
    const { id, type } = req.params;
    const { title, tags, content, featured } = req.body;

    let image;
    if (req.file) {
        image = { data: req.file.buffer, contentType: req.file.mimetype };  // Store image buffer
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const model = getModelForType(type);

    try {
        const updatedContent = await model.findByIdAndUpdate(id, {
            title,
            tags: tagsArray,
            content,
            image: image,  // Update the image with the new buffer
            featured: featured ? true : false
        }, { new: true });

        const featuredValue = featured ? 'on' : 'off';
        res.redirect(`/admin?filterType=${type}&filterFeatured=${featuredValue}`);
    } catch (err) {
        console.error('Error updating content:', err);
        res.status(500).send('Error updating content');
    }
};

// Show Content
const getShowPage = async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);
  
    try {
      const content = await model.findById(id);
  
      // If image exists, convert it to base64 for front-end rendering
      if (content.image && content.image.data) {
        content.imageBase64 = content.image.data.toString('base64');
        content.imageMimeType = content.image.contentType;
      }
  
      // Render admin show page with content and base64 image
      res.render('admin/show', { content, imageData: content.imageBase64, type });
    } catch (err) {
      console.error('Error fetching content to show:', err);
      res.status(500).send('Error fetching content');
    }
  };
  


// Get Create Page
const getCreatePage = (req, res) => {
    res.render('admin/create');
};

// Admin Dashboard
const getAdminPage = async (req, res) => {
    try {
        const { searchTitle, filterType = 'Blog', filterFeatured, filterTags, page = 1 } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (searchTitle) {
            query.title = { $regex: searchTitle, $options: 'i' };
        }
        if (filterType) {
            query.type = filterType;
        }

        const filterFeaturedBoolean = (filterFeatured === 'on');
        query.featured = filterFeaturedBoolean;

        if (filterTags) {
            const tagsArray = filterTags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagsArray.map(tag => new RegExp(`^${tag}$`, 'i')) };
        }

        const model = getModelForType(filterType);
        const totalItems = await model.countDocuments(query);
        const content = await model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Convert each image to Base64
        const contentWithImages = content.map(item => {
            let imageBase64 = null;
            let imageMimeType = null;
            if (item.image && item.image.data) {
                imageBase64 = item.image.data.toString('base64');  // Convert image buffer to Base64
                imageMimeType = item.image.contentType || 'image/png'; // Get the MIME type (default to png)
            }
            return {
                ...item.toObject(),
                imageBase64: imageBase64,      // Add Base64 image data
                imageMimeType: imageMimeType   // Add MIME type
            };
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.render('admin/index', {
            content: contentWithImages,
            searchTitle,
            filterType,
            filterFeatured,
            filterTags,
            currentPage: Number(page),
            totalPages,
            limit
        });
    } catch (err) {
        console.error('Error fetching content:', err);
        res.status(500).json({ message: 'Error fetching content' });
    }
};


// Get Edit Page
const getEditPage = async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);  // Get the model based on type
    
    try {
        const content = await model.findById(id);

        // Check if the content has an image and convert it to Base64
        let imageBase64 = null;
        let imageMimeType = null;
        if (content.image && content.image.data) {
            imageBase64 = content.image.data.toString('base64');  // Convert Buffer to Base64 string
            imageMimeType = content.image.contentType || 'image/png'; // Set default MIME type if missing
        }

        // Render the edit page with content and the Base64 image data
        res.render('admin/edit', {
            content: content,
            imageBase64: imageBase64,      // Pass the Base64 image data
            imageMimeType: imageMimeType  // Pass the MIME type
        });

    } catch (err) {
        console.error('Error fetching content to edit:', err);
        res.status(500).send('Error fetching content');
    }
};

// Delete Content
const deleteContent = async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);

    try {
        await model.findByIdAndDelete(id);
        res.redirect(req.get('Referer') || '/admin');
    } catch (err) {
        console.error('Error deleting content:', err);
        res.status(500).send('Error deleting content');
    }
};

// Admin Login
const getLoginPage = (req, res) => {
    res.render('admin/login.ejs');
};

const login = (req, res) => {
    const { adminKey } = req.body;

    if (adminKey === process.env.ADMIN_KEY) {
        req.session.loggedIn = true;
        return res.redirect('/admin');
    }
    res.redirect('/admin/login');
};

// Admin Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error during logout');
        }
        res.redirect('/admin/login');
    });
};

module.exports = {
    upload,
    isLoggedIn,
    getAdminPage,
    getCreatePage,
    createContent,
    getEditPage,
    editContent,
    getShowPage,
    deleteContent,
    getLoginPage,
    login,
    logout,
};
