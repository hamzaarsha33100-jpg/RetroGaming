import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "admin" | "customer";
  provider?: string;
  phone?: string;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    otp?: string;
    otpExpires?: Date;
    otpVerified?: boolean;
  emailVerified?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAddress {
  _id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  address1: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: "US" },
  phone: String,
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      minlength: 8,
    },
    image: String,
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    provider: {
      type: String,
      default: "credentials",
    },
    phone: String,
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpVerified: { type: Boolean, default: false },
    emailVerified: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
