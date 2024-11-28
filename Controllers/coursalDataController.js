const Coursal = require("../Schema/CoursalData");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");


const postCoursalData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const uploadFromBuffer = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });

    const imageUrl = await uploadFromBuffer(req.file.buffer);

    const { heading, description, button } = req.body;

    const coursalData = new Coursal({
      heading,
      description,
      button,
      imageUrl,
    });

    await coursalData.save();

    res.status(201).json({
      message: "Data Saved Successfully",
      data: coursalData,
    });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Failed to Upload Data" });
  }
};


const getCoursalData = async (req, res) => {
  try {
    const coursalData = await Coursal.find();
    if (coursalData && coursalData.length > 0) {
      res.status(200).json({ coursalData });
    } else {
      res.status(404).json({ message: "No Data Available" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Failed to Get the Data" });
  }
};

module.exports = {
  postCoursalData,
  getCoursalData,
};
