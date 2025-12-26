const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignementsSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        description: { type: String, required: true },
        answer: { type: String },
        urlresources: [{ type: String }],
        fileresources: [{ type: String }]
      }
    ],
    status: { type: String, enum: ['in progress', 'finished'], default: 'in progress' },
    deadline: { type: Date },
    type: { type: String, enum: ['assignement', 'template'], default: 'assignement' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' , required: false },
  }, {
    timestamps: true
});

module.exports = mongoose.model('Assignements', AssignementsSchema);