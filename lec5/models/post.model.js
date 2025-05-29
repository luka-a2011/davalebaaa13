const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    reactions: {
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    }
}, { timestamps: true })

postSchema.add({
    likesCount: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('post', postSchema)
