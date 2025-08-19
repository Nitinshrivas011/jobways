const mongoose = require('mongoose')
const validator = require('validator')

const DocumentSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    category: { type: String, required: true },  // 'resume', 'contract', 'offer', etc.
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    uploadedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({


    name: {
        type: String,
        required: [true, "Please enter your name"]
    },

    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Please Enter valid email address"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "Please enter a password"]
    },

    avatar: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
    },

    role: {
        type: String,
        enum: ["candidate", "employee", "admin", "hr"],
        default: "candidate"
    },

    skills: [
        {
            type: String
        }
    ],

    resume: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },

    },

    documents: [DocumentSchema],

    savedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }
    ],

    appliedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        }
    ],


    createdAt: {
        type: Date,
        default: Date.now
    },

    emailVerified: {
        type: Boolean,
        default: false,
    },
    
    verificationToken: String,
    verificationTokenExpires: Date,

})

const User = mongoose.model('User', UserSchema)
module.exports = User