import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsersDB } from '../config/jsonStore';

const generateToken = (id: string, role: string, name: string) => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET || 'dentacare_super_secret_key_2026', {
    expiresIn: '7d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please fill all required fields' });
      return;
    }
    const userExists = UsersDB.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      res.status(400).json({ message: 'මෙම Email ලිපිනයෙන් දැනටමත් Account එකක් ඇත!' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = UsersDB.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient',
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(String(user._id), user.role, user.name),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = UsersDB.findOne((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(String(user._id), user.role, user.name),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};
