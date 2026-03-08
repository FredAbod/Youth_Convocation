import mongoose from "mongoose";

export interface IRegistration extends mongoose.Document {
  name: string;
  gender: string;
  area: string;
  phone: string;
  email: string;
  paymentName: string;
  paymentBank: string;
  paymentProofUrl: string;
  registrationCode: string;
  createdAt: Date;
}

const RegistrationSchema = new mongoose.Schema<IRegistration>({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  area: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  paymentName: { type: String, required: true },
  paymentBank: { type: String, required: true },
  paymentProofUrl: { type: String, required: true },
  registrationCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
