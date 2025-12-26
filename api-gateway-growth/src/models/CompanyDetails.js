const mongoose = require('mongoose');

const CompanyDetailsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    sectorOfActivity: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        required: true
    },
    yearsOfActivity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CompanyDetails', CompanyDetailsSchema);