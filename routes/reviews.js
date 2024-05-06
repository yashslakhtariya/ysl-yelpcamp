const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

//To create review for the particular campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//To delete particular review for the particular campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;