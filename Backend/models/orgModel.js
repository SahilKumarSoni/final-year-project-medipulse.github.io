import mongoose from 'mongoose';

const orgSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        unique: true, 
        required: true 
    },
    password: { type: String, required: true },
    accessCode:{
        type: String, required: true,
    },
    phone: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String 

    },
    uniqueId: { 
        type: String, 
        required: true ,
        unique: true,
    },
    type: { 
        type: String, 
        required: true },
    beds: { 
        type: Number, 
        required: true },
    departments: [{ type: String }],
    pharmacy: { 
        type: Boolean, 
        required: true },
    visitingHours: { 
        type: String,
         required: true },
    helpline: { 
        type: String,
         required: true },
         role: { 
            type: String, 
            default: 'org' 
        },
         createdAt: { type: Date, default: Date.now },
});



export const Organization = mongoose.model('Organization', orgSchema);
