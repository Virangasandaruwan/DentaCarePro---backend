import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  dentistName?: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String, default: 'Patient' },
    dentistName: { type: String, default: 'Dr. Perera' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
