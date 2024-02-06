const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Mongo_url = "mongodb://127.0.0.1:27017/wonderlust"
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');

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
app.get('/listing', async (req, res) => {
    let allListings = await Listing.find({})
    res.render("./listings/index.ejs", { allListings })
});

// /new
app.get('/listing/new', (req, res) => {
    res.render('./listings/new.ejs')
})

// show route
app.get('/listing/:id', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/show.ejs', { listing })
})

// create route
app.post("/listing", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listing')
})

// edit route
app.get('/listing/:id/edit', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/edit', { listing })
})

// update route
app.put('/listing/:id', async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    res.redirect(`/listing/${id}`)
})

// delete route
app.delete('/listing/:id', async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    res.redirect('/listing')
    console.log(deletedListing)
})

async function main() {
    await mongoose.connect(Mongo_url)
}

app.get('/', (req, res) => {
    res.send("welcome to the server")
})
app.listen(3000, () => {
    console.log("listening at 3000")
})

