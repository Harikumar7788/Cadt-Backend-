const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

  userProjects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'MainArrayModel', 
    }
  ],
});

module.exports = mongoose.model('UserModel', userSchema);
