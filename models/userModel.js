
import mongoose from 'mongoose';

const allowedCommunities = ['Surat', 'Mumbai', 'Vapi', 'Vadodara', 'Ahmedabad', 'Rajkot', 'Amreli', 'Other'];

const userSchema = mongoose.Schema({ 
  givenName: {
    required: true,
    type: String,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    required: true,
    type: String,
    trim: true,
  },
  community: {
    type: String,
 
    trim: true,
    validate: {
      validator: function (value) {
        // Allow either enum values or any non-empty string
        return allowedCommunities.includes(value) || value.trim() !== '';
      },
      message: 'Invalid community value',
    },
  },
  currentcity: {
    type: String,
    trim: true,
  },
  native: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married','Committed', 'Divorced', 'Widowed','Widower'],
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re = /^\d{10}$/; // Assuming a 10-digit phone number format
        return value.match(re);
      },
      message: "Please enter a valid phone number",
    },
  },
  occupation: {
    type: String,
    trim: true,
  },
  password: {
    required: true,
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isPrime: {
    type: Boolean,
    default: false,
  },
  CreatedAt: { type: Date },
    UpdatedAt: { type: Date },
});

const userModel = mongoose.model("User", userSchema);
export default userModel

