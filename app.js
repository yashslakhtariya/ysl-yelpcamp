if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const User = require('./models/user');

// process.env.DB_URL
//'mongodb://127.0.0.1:27017/yelp-camp'
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Mongoose Connection Open!!");
}

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  //time period in seconds
    crypto:{
        secret
    }
});

store.on('error', function(e){
    console.log('Session Store Error', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if(!['/login', '/', '/register'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

//Route for campground
app.use('/campgrounds', campgroundRoutes);

//Route for reviews
app.use('/campgrounds/:id/reviews', reviewRoutes);

//Route for users
app.use('/', userRoutes);

//Home Page
app.get('/', (req, res) => {
    res.render('home');
});

//To show error to all other page except above pages
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
});

//Error page for Express
app.use((err, req, res, next) => {
    const{statusCode = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', {err});
});

const port = process.env.PORT || 3000
//To serve localhost 3000 server
app.listen(port, () => {
    console.log('Serving on Port 3000');
});