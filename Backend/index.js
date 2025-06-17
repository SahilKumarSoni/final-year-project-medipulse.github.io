import express from 'express';
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import doctorRoutes from './routes/doctorRoutes.js';
import orgRoutes from './routes/orgRoutes.js'
import commonRoutes from './routes/commonRoute.js'
import patientRoutes from './routes/patientRoute.js'
import paymentRoutes from './routes/paymentRoute.js';
import  './utils/slotScheduler.js'




import cors from 'cors'
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cloudinary from 'cloudinary'




dotenv.config();


const app = express();
connectDB();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload({
    useTempFiles: true, // Store files temporarily
    tempFileDir: '/tmp/', // Temporary directory
  }));

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true,
}))

app.use('/api/doctors', doctorRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/patient', patientRoutes);

//For Payment Route
app.use('/api/payment', paymentRoutes);







app.get("/",(req,res)=>{
    res.send("medipulse ++")
})



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
