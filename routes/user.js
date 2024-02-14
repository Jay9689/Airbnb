const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');


router.get('/signup', (req, res) => {
    res.render('users/signup.ejs')
});


router.post('/signup', wrapAsync(async (req, res) => {
    try {
        let { email, username, password } = req.body;
        let newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to Wonderlust")
        res.redirect('/listings')
    } catch (e) {
        req.flash("error", e.message);
        res.redirect('/signup')
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login.ejs')
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    req.flash('success', "Welcome to wonder lust")
    res.redirect('/listings')
})

module.exports = router;