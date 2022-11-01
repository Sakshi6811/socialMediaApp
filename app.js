const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars)
//const methodOverride = require('method-override');

//Connect to mongouri exported from external file
const keys = require('./config/keys');
// user collection
const User = require('./models/user');
//const Post = require('./models/post');
// Link passports to the server
require('./passport/google-passport');
// require('./passport/facebook-passport');
// require('./passport/instagram-passport');
//initialize application
const app = express();
// Express config
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
// app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
// set global vars for user
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});
// setup template engine
app.engine('handlebars', exphbs.engine({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');
//setup static file to serve css,js and images
app.use(express.static('public'));
// connect to remote database
mongoose.Promise = global.Promise;
mongoose.connect(keys.MongoURI, {
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to Remote Database....');
}).catch((err) => {
    console.log(err);
});
// set environment variable for port
const port = process.env.PORT || 3000;
// Handle routes
app.get('/', (req, res) => {
    res.render('home'); 
});

app.get('/about', (req, res) => {
    res.render('about');
});
// GOOGLE AUTH ROUTE
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    });
// Handle profile route
// app.get('/profile', ensureAuthentication,(req, res) => {
//     Post.find({user: req.user._id})
//     .populate('user')
//     .sort({date:'desc'})
//     .then((posts) => {
//         res.render('profile', {
//             posts:posts
//         });
//     });
//  });
app.get('/profile', (req, res) => {
    User.findById({_id: req.user._id})
    .then((user) => {
        res.render('profile', {
            user:user
        });
    });
 });
// Handle User logout route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
; 
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});