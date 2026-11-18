import { Request, Response } from 'express';
import { AppointmentsDB } from '../config/jsonStore';

export const getAppointments = (_req: Request, res: Response): void => {
  try {
    res.json(AppointmentsDB.findAll());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = (req: Request, res: Response): void => {
  try {
    const { patientName, packageTitle, date, time, reason, status } = req.body;
    const appointment = AppointmentsDB.create({
      patientName: patientName || 'Registered Patient',
      packageTitle: packageTitle || '',
      date,
      time,
      reason: reason || packageTitle || 'General Checkup',
      status: status || 'Pending',
    });
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = (req: Request, res: Response): void => {
  try {
    const updated = AppointmentsDB.updateById(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
