const Listing = require('../models/listing.js');

// index model
module.exports.index = async (req, res, next) => {
    let allListings = await Listing.find({});
    res.render("listings/index", { allListings })
}

// New
module.exports.renderNewForm = (req, res) => {
    res.render('listings/new');
}

// show Route
module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    // console.log(req.params.id)
    let listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect('/listings')
    }
    res.render('listings/show', { listing }); // Corrected path
}

// Create listings
module.exports.createListing = async (req, res, next) => {
    // console.log(req.body)
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id
    await newListing.save();
    req.flash("success", "New Listing Created!")
    res.redirect('/listings'); // Corrected path
}

// edit route
module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect('/listings')
    }
    res.render('listings/edit', { listing }); // Corrected path
}

// update route
module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`); // Corrected path
}

// Destroy
module.exports.destroyListing = async (req, res, next) => {
    console.log(req.params.id)
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect('/listings'); // Corrected path
    console.log(deletedListing);
}