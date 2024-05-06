const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        throw new ExpressError(error.message, 400);
    } else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(error.message, 400);
    } else{
        next();
    }
};


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;    
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user.id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;    
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user.id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}