import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export const CreateMyimg = async(req,res)=>{
  try {
        if (!req.files || !req.files.image) {
          return res.status(400).json({ message: 'No image file uploaded' });
        }
    
        // Access the uploaded file
        const image = req.files.image;
    
        // Upload file to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: 'uploaded_images', // Optional: specify folder in Cloudinary
        });
    
        // Return the uploaded image URL
        res.status(200).json({ url: uploadResponse.secure_url });
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
      }
}
