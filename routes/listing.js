const express = require('express');
const app = express();
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');


router.use(express.urlencoded({ extended: true }))

// Validation listing function
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Listing route
router.get('/', wrapAsync(async (req, res, next) => {
    let allListings = await Listing.find({});
    res.render("listings/index", { allListings }); // Corrected path
}));

// /new
router.get('/new', (req, res) => {
    res.render('listings/new');
});

// Show route
router.get('/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    console.log(req.params.id)
    let listing = await Listing.findById(id).populate('reviews');
    res.render('listings/show', { listing }); // Corrected path
}));

// Create route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    console.log(req.body)
    const newListing = new Listing(req.body.listings)
    await newListing.save();
    res.redirect('/listings'); // Corrected path
}));

// Edit route
router.get('/:id/edit', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('listings/edit', { listing }); // Corrected path
}));

// Update route
router.put('/:id', validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    console.log(req.params.id)
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`); // Corrected path
}));

// Delete route
router.delete('/:id', wrapAsync(async (req, res, next) => {
    console.log(req.params.id)
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect('/listings'); // Corrected path
    console.log(deletedListing);
}));

module.exports = router;
