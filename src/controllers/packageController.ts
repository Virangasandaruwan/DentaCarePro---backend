import { Request, Response } from 'express';
import { PackagesDB } from '../config/jsonStore';

export const getPackages = (_req: Request, res: Response): void => {
  try {
    res.json(PackagesDB.findAll());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPackage = (req: Request, res: Response): void => {
  try {
    const { title, description, price, duration } = req.body;
    if (!title || !price) {
      res.status(400).json({ message: 'Package title and price are required' });
      return;
    }
    const pkg = PackagesDB.create({
      title,
      description: description || 'Professional dental care package',
      price: Number(price),
      duration: duration || '30 Mins',
    });
    res.status(201).json(pkg);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePackage = (req: Request, res: Response): void => {
  try {
    PackagesDB.deleteById(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
