const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const contentRoutes = require('./routes/contentRoutes.js')
connectDB();
const path = require('path');

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.ADMIN_KEY,
    resave: false,
    saveUninitialized: true,
}));


app.use("/admin",adminRoutes);
app.use("/",contentRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

     