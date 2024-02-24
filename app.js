if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')

const listingRouter = require('./routes/listing.js'); // Renamed
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const Listing = require("./models/listing.js");
// for search route
const { isLoggedIn, isOwner, validateListing } = require('./middleware.js');


const Mongo_url = "mongodb://127.0.0.1:27017/wonderlust";

main().then(() => {
    console.log("connected to database");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo_url);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// express-session
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpsOnly: true
    }
}



// Express sessions and Flash
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Locals that are passed in ejs
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
})


// routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// root route
app.get('/search', async (req, res) => {

    console.log(req.query.inputval)
    let data = await Listing.find({
        "$or": [
            {
                country: { $regex: req.query.inputval },
                // title: { $regex: req.query.inputval },
                // description: { $regex: req.query.inputval }
            }
        ]
    })
    console.log(data)
    res.render('listings/search', { data });
});

// Error handler Middleware
app.all('*', (req, res, next) => {
    next(new ExpressError(404, `You entered the wrong URL`)); // Corrected error message
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = `You entered the wrong URL` } = err;
    res.status(statusCode).render('error.ejs', { message });
});

app.listen(3000, () => {
    console.log("Listening at port 3000");
});