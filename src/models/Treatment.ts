import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  patientName: string;
  procedure: string;
  notes: string;
  cost: number;
  date: string;
}

const TreatmentSchema: Schema = new Schema(
  {
    patientName: { type: String, required: true },
    procedure: { type: String, required: true },
    notes: { type: String, default: '' },
    cost: { type: Number, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema);
