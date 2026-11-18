import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export class JsonCollection<T extends { _id?: string; createdAt?: string }> {
  private filePath: string;

  constructor(name: string, defaultItems: T[] = []) {
    this.filePath = path.join(dataDir, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultItems, null, 2), 'utf-8');
    }
  }

  private readAll(): T[] {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private writeAll(items: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  findAll(): T[] {
    return this.readAll().reverse();
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.readAll().find(predicate);
  }

  create(doc: Omit<T, '_id' | 'createdAt'>): T {
    const items = this.readAll();
    const newItem = {
      ...doc,
      _id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as T;
    items.push(newItem);
    this.writeAll(items);
    return newItem;
  }

  updateById(id: string, updates: Partial<T>): T | null {
    const items = this.readAll();
    const idx = items.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    this.writeAll(items);
    return items[idx];
  }

  deleteById(id: string): boolean {
    const items = this.readAll();
    const filtered = items.filter((i) => i._id !== id);
    if (filtered.length === items.length) return false;
    this.writeAll(filtered);
    return true;
  }
}

export interface UserRecord {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'dentist';
  createdAt?: string;
}

export interface AppointmentRecord {
  _id?: string;
  patientName: string;
  packageTitle?: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt?: string;
}

export interface TreatmentRecord {
  _id?: string;
  patientName: string;
  procedure: string;
  notes: string;
  cost: number;
  date: string;
  createdAt?: string;
}

export interface DentalPackageRecord {
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  createdAt?: string;
}

export const UsersDB = new JsonCollection<UserRecord>('users');
export const AppointmentsDB = new JsonCollection<AppointmentRecord>('appointments');
export const TreatmentsDB = new JsonCollection<TreatmentRecord>('treatments');
export const PackagesDB = new JsonCollection<DentalPackageRecord>('packages', [
  {
    _id: 'pkg-1',
    title: 'Teeth Scaling & Polishing',
    description: 'Complete ultrasonic plaque removal and stain polishing for healthy gums.',
    price: 4500,
    duration: '30 Mins',
  },
  {
    _id: 'pkg-2',
    title: 'Root Canal Therapy',
    description: 'Painless single/multi-visit endodontic root canal treatment with digital X-ray.',
    price: 15000,
    duration: '60 Mins',
  },
]);
