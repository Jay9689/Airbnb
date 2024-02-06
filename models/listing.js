const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },

    image: {
        url: {
            type: String,
            default: "https://unsplash.com/photos/a-person-swimming-over-a-coral-reef-in-the-ocean-tSwRu3Jh0EM",
            set: (v) => v === "" ? "https://unsplash.com/photos/a-person-swimming-over-a-coral-reef-in-the-ocean-tSwRu3Jh0EM" : v,
            required: true,
        },
        filename: {
            type: String,
            required: true,
        }

    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;