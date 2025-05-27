import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      match: [
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    otp: {
      type: String,
      select: false,
      default: null,
    },
    otpExpiry: {
      type: Date,
      select: false,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    failedAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null, // Store the last login timestamp
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// **Hash password before saving the user**
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// **Method to compare passwords**
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// **Method to generate Access Token**
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // Short lifespan for security
  );
};

// **Method to generate Refresh Token**
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { userId: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "28d" } // Longer lifespan for persistent login
  );
};

// **Method to update Last Login**
UserSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

// **Method to Hash OTP before storing it**
UserSchema.methods.setOtp = function (enteredOtp) {
  // const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  this.set("otp", enteredOtp);
  this.set("otpExpiry", new Date(Date.now() + 5 * 60 * 1000)); // Set OTP expiry to 5 minutes
};

// **Method to Verify OTP**
UserSchema.methods.verifyOtp = function (enteredOtp) {
  return this.otp === enteredOtp.toString();
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
