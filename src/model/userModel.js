const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        // minLen 8, maxLen 15
    },
    address: {
        street: { type: String },
        city: { type: String },
        pincode: { type: String }
    },
    // createdAt: { timestamp },
    // updatedAt: { timestamp }

}, {timestamp: true})

module.exports = mongoose.model('User', userSchema)