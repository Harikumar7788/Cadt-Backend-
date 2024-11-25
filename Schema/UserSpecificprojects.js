const mongoose = require('mongoose');
const { Schema } = mongoose;

const MainArrayModel = require('./DynamicScene');  

const userSchema = new Schema({
  username: { type: String, required: true },
  userProjects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'MainArray',  
    },
  ],
});

module.exports = mongoose.model('UserModel', userSchema);
