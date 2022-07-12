const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const bookSchema = new mongoose.Schema({

    title: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    userId: { type: ObjectId, required: true, refs: 'User' },
    ISBN: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: [String], required: true, trim: true },
    reviews: { type: Number, default: 0, trim: true },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: Date, required: true, },
    
}, { timestamps: true })
module.exports = mongoose.model('Book', bookSchema)