const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapToken});
const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');

//To get the campgrounds home page
module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}

//To get the form page for adding new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

//To post the data from the new campground form page 
module.exports.createCampground = async(req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user.id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//To get the particular id page of campground
module.exports.showCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate: {path: 'author'}
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannnot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}

//To get the form page for editing existing campground
module.exports.renderEditForm = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannnot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}

//To put the data from the edit campground form page 
module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, {runValidators: true});
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...images);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground.id}`);
}

//To delete the particular campground from the database
module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground!');
    res.redirect('/campgrounds');
}