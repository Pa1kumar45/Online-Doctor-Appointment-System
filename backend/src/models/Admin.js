import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const adminSchema= new mongoose.Schema({
name:{
    type: String,
    required: true,
    trim:true,
},
email:{
    type:String,
    required: true,
    unique: true,
    lowercase: true
},
password:{
     type: String,
    required: true,
    minlength: 6,
    select: false
},
role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  Permissions:[{
    type: String,
    enum:['user_management','appoinment_management', 'system_settings', 'reports'],
  }],
  lastlogin:{
    type:Date,
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Admin',
  }, 
},{
    timestamps:true
});

adminSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password= await bcryptjs.hash(this.password,12);
});

adminSchema.methods.comparePassword= async function (candidatepassword){
    return await bcryptjs.compare(candidatepassword,this.password)
};

export default mongoose.model('Admin', adminSchema);