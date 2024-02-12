const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Mongo_url = "mongodb://127.0.0.1:27017/wonderlust"
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const { listingSchema } = require('./schema.js')

main().then(() => {
    console.log("connected to data base")
}).catch((err) => {
    console.log(err)
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

//listing route
app.get('/listing', wrapAsync(async (req, res, next) => {
    let allListings = await Listing.find({})
    res.render("./listings/index.ejs", { allListings })
}))

// validation function
const validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError('400', errMsg)
    } else {
        next();
    }
}

// /new
app.get('/listing/new', (req, res) => {
    res.render('./listings/new.ejs')
})

// show route
app.get('/listing/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/show.ejs', { listing })
}))

// create route
app.post("/listing", validatelisting, wrapAsync(async (req, res, next) => {

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listing')

}))

// edit route
app.get('/listing/:id/edit', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/edit', { listing })
}))

// update route
app.put('/listing/:id', validatelisting, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    res.redirect(`/listing/${id}`)
}))

// delete route
app.delete('/listing/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    res.redirect('/listing')
    console.log(deletedListing)
}))

async function main() {
    await mongoose.connect(Mongo_url)
}

// Error handler Middleware
app.all('*', (req, res, next) => {
    next(new ExpressError(404, `<h3 style="color:#fe424d;"> You Entered URL</h3>`))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = `<h3 style="color:#fe424d;"> You Entered Wrong URL</h3>` } = err
    res.status(statusCode).render('error.ejs', { message })
})

app.get('/', (req, res) => {
    res.send("welcome to the server")
})
app.listen(3000, () => {
    console.log("listening at 3000")
})

