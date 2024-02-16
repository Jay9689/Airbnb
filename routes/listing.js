const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js')


router.use(express.urlencoded({ extended: true }))



// Listing route
router.get('/', wrapAsync(async (req, res, next) => {
    let allListings = await Listing.find({});
    res.render("listings/index", { allListings }); // Corrected path
}));

// /new
router.get('/new', isLoggedIn, (req, res) => {
    res.render('listings/new');
});

// Show route
router.get('/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    // console.log(req.params.id)
    let listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect('/listings')
    }
    res.render('listings/show', { listing }); // Corrected path
}));

// Create route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    // console.log(req.body)
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id
    await newListing.save();
    req.flash("success", "New Listing Created!")
    res.redirect('/listings'); // Corrected path
}));

// Edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect('/listings')
    }
    res.render('listings/edit', { listing }); // Corrected path
}));

// Update route
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`); // Corrected path
}));

// Delete route
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    console.log(req.params.id)
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect('/listings'); // Corrected path
    console.log(deletedListing);
}));

module.exports = router;