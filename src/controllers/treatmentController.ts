import { Request, Response } from 'express';
import { TreatmentsDB } from '../config/jsonStore';

export const getTreatments = (_req: Request, res: Response): void => {
  try {
    res.json(TreatmentsDB.findAll());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTreatment = (req: Request, res: Response): void => {
  try {
    const { patientName, procedure, notes, cost } = req.body;
    const treatment = TreatmentsDB.create({
      patientName,
      procedure,
      notes: notes || '',
      cost: Number(cost) || 0,
      date: new Date().toISOString().split('T')[0],
    });
    res.status(201).json(treatment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
