import { v2 as cloudinary } from "cloudinary";

// Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Image
export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url; // return only URL (best practice)
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

// Delete Image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error("Image deletion failed: " + error.message);
  }
};

// Get Image URL
export const getImage = (publicId) => {
  return cloudinary.url(publicId);
};

export default cloudinary;