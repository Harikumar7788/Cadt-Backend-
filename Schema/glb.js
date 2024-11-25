const mongoose = require('mongoose');

const GLBModelSchema = new mongoose.Schema(
  {
    modelType: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,    
    },
    glbUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^(https?:\/\/).+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
  },
  { timestamps: true }
);

const GLBModel = mongoose.model('GLBModel', GLBModelSchema);
module.exports = GLBModel;
