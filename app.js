const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Mongo_url = "mongodb://127.0.0.1:27017/wonderlust";
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');

const listings = require('./routes/listing.js'); // Renamed to listingRoutes for clarity

main().then(() => {
    console.log("connected to database");
}).catch((err) => {
    console.log(err);
});

app.use("/listings", listings); // Changed to "/listings"
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// validate Review function
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Reviews
// Reviews Post route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review); // Fixed variable name typo

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`); // Changed to "/listings"
}));

// Reviews
// Reviews Delete route
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`); // Changed to "/listings"
}));

async function main() {
    await mongoose.connect(Mongo_url);
}

// Error handler Middleware
app.all('*', (req, res, next) => {
    next(new ExpressError(404, `You entered the wrong URL`)); // Corrected error message
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = `You entered the wrong URL` } = err;
    res.status(statusCode).render('error.ejs', { message });
});

app.get('/', (req, res) => {
    res.send("Welcome to the server");
});

app.listen(3000, () => {
    console.log("Listening at port 3000");
});
