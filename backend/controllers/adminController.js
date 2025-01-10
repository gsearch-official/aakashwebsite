const express = require('express');
const Blog = require('../models/blog');
const Leader = require('../models/leader');
const News = require('../models/news');
const Press = require('../models/press');
const Solution = require('../models/solution');
const Magazine = require('../models/magazine');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

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

const generateFolderPath = (type) => {
    let folderPath = path.join(__dirname, '..', 'public', process.env.IMAGE_LOCATION, type);
    
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    
    return folderPath;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folderPath;
        if (req.params.type) {
            folderPath = generateFolderPath(req.params.type);
        } else {
            folderPath = generateFolderPath(req.body.type);
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const datetime = new Date().toISOString().replace(/:/g, '-');
        const filename = `${datetime}_${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

const getAdminPage = async (req, res) => {
    try {
        const { searchTitle, filterType = 'Blog' , filterFeatured, filterTags, page = 1 } = req.query;
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

        const totalPages = Math.ceil(totalItems / limit);

        res.render('admin/index', {
            content,
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

const getCreatePage = (req, res) => {
    res.render('admin/create');
};

const createContent = async (req, res) => {
    const { title, tags, type, content, featured } = req.body;

    const datetime = new Date().toISOString().replace(/:/g, '-');
    const image = `/${process.env.IMAGE_LOCATION}/${type}/${req.file.filename}`;

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const model = getModelForType(type);

    try {
        const newContent = new model({
            title, type, tags: tagsArray, content, image, featured: featured ? true : false
        });
        await newContent.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Error creating content:', err);
        res.status(500).send('Error creating content');
    }
};

const getEditPage = async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);
    try {
        const content = await model.findById(id);
        res.render('admin/edit', { content });
    } catch (err) {
        console.error('Error fetching content to edit:', err);
        res.status(500).send('Error fetching content');
    }
};

const editContent = async (req, res) => {
    const { id, type} = req.params;
    
    const { title, tags, content, featured } = req.body;
    let image;
    if (req.file) {
        image = `/${process.env.IMAGE_LOCATION}/${type}/${req.file.filename}`;
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const model = getModelForType(type);

    try {
        const updatedContent = await model.findByIdAndUpdate(id, {
            title,
            tags: tagsArray,
            content,
            image: image,
            featured: featured ? true : false
        }, { new: true });

        const featuredValue = featured ? 'on' : 'off';
        res.redirect(`/admin?filterType=${type}&filterFeatured=${featuredValue}`);
    } catch (err) {
        console.error('Error updating content:', err);
        res.status(500).send('Error updating content');
    }
};

const getShowPage = async (req, res) => {
    const { type, id } = req.params;
    const model = getModelForType(type);

    try {
        const content = await model.findById(id);
        console.log(content);
        res.render('admin/show', { content , type });
    } catch (err) {
        console.error('Error fetching content to show:', err);
        res.status(500).send('Error fetching content');
    }
};

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
