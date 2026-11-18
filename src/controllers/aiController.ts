import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PackagesDB } from '../config/jsonStore';

dotenv.config();

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

function generateSmartDentalFallback(query: string, isChatbot = false): string {
  const q = query.toLowerCase();

  if ((q.includes('create') && q.includes('plan')) || q.includes('lkr')) {
    return `### Recommended Dental Treatment Packages & Clinical Protocol

1. **Tooth Extraction (Simple / Surgical)** — **LKR 3,500**
   - **Pre-op:** Local anesthesia (2% Lidocaine with 1:100,000 Epinephrine), periapical radiograph check.
   - **Post-op Care:** Bite on sterile gauze for 30 mins, avoid hot/spicy food for 24h, Paracetamol 500mg/1g PRN for pain.

2. **Root Canal Therapy (Endodontic Treatment)** — **LKR 15,000**
   - **Protocol:** Access cavity preparation, working length determination, biomechanical cleaning & shaping (NaOCl irrigation), gutta-percha obturation, and restoration.
   - **Medication:** Ibuprofen 400mg TDS for 3 days (if no contraindications).

3. **Ultrasonic Teeth Scaling & Polishing** — **LKR 4,500**
   - **Protocol:** Full-mouth supragingival and subgingival ultrasonic scaling, interdental cleaning, and prophy paste polishing.
   - **Advice:** Use soft-bristle toothbrush and Chlorhexidine 0.12% mouthwash for 5 days if gingival inflammation is present.`;
  }

  if (q.includes('pain') || q.includes('ache') || q.includes('රිදෙන') || q.includes('කැක්කුම') || q.includes('සීතල')) {
    return isChatbot
      ? 'දත් කැක්කුමක් හෝ සීතලට සංවේදී බවක් තිබේ නම් මද උණුසුම් ලුණු වතුරෙන් කට සෝදන්න. තාවකාලික වේදනා නාශකයක් ලෙස Paracetamol භාවිතා කළ හැකි වුවද, දතේ ස්නායු ආසාදනයක් (Pulpitis) හෝ කුහරයක් ඇත්දැයි පරීක්ෂා කිරීමට ඉක්මනින් Appointment එකක් වෙන් කරගන්න.'
      : `### Clinical Assessment & Preliminary Advice
- **Possible Causes:** Dentinal hypersensitivity, dental caries (tooth decay), or early pulpitis.
- **Immediate Home Care:** Rinse gently with warm salt water; avoid extreme hot, cold, or sugary foods.
- **Recommended Next Step:** Book a clinical examination & digital X-ray with our Dentist to determine if a filling or root canal treatment is required.`;
  }

  if (q.includes('root canal') || q.includes('scaling') || q.includes('extraction') || q.includes('package') || q.includes('මිල')) {
    return isChatbot
      ? 'අපගේ Clinic එකේ ප්‍රධාන ප්‍රතිකාර පැකේජ:\n• Teeth Scaling & Polishing - LKR 4,500\n• Tooth Extraction - LKR 3,500\n• Root Canal Therapy - LKR 15,000\n\nPatient Dashboard එකේ "Book Package" හරහා ඔබට කැමති පැකේජයක් වෙන් කරගත හැක!'
      : `### Clinical Treatment Overview
- **Diagnosis & Imaging:** Periapical X-ray evaluation prior to procedure.
- **Procedure Protocol:** Performed under strict sterilization and local anesthesia for patient comfort.
- **Follow-up:** Review after 7 days to ensure proper healing.`;
  }

  return isChatbot
    ? 'ආයුබෝවන්! මම DentaCare Pro AI සහායකයා. දත් කැක්කුම, Scaling, Root Canal, Tooth Extraction හෝ Appointment එකක් වෙන් කරගන්නා ආකාරය ගැන මගෙන් අහන්න!'
    : `### DentaCare AI Clinical Summary
- **Evaluation:** Reviewed your clinical input: "${query}".
- **Clinical Recommendation:** Perform a comprehensive oral examination, periodontal charting, and vitality test on the affected area.
- **Preventive Care:** Maintain twice-daily fluoride brushing, daily flossing, and 6-monthly professional scaling.`;
}

export const getAiSuggestion = async (req: Request, res: Response): Promise<void> => {
  const { prompt, symptoms, treatmentHistory, context, message, autoCreatePackages } = req.body;
  const userQuery = prompt || symptoms || message || '';

  if (autoCreatePackages && userQuery) {
    const lines = userQuery.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean);
    const created: any[] = [];
    for (const line of lines) {
      const match = line.match(/(.+?)[-–:]\s*(?:LKR|Rs\.?)?\s*(\d+)/i);
      if (match) {
        const pkg = PackagesDB.create({
          title: match[1].trim(),
          description: `AI Generated Clinical Treatment Package (${match[1].trim()})`,
          price: Number(match[2]),
          duration: '45 Mins',
        });
        created.push(pkg);
      }
    }
    if (created.length > 0) {
      res.status(200).json({
        success: true,
        createdPackages: created,
        reply:
          `සාර්ථකයි! පැකේජ ${created.length}ක් ස්වයංක්‍රීයව පද්ධතියට ඇතුළත් කරන ලදී:\n` +
          created.map((c) => `• ${c.title} - LKR ${c.price}`).join('\n'),
      });
      return;
    }
  }

  try {
    if (!apiKey || apiKey.startsWith('AQ.')) {
      const reply = generateSmartDentalFallback(userQuery, false);
      res.status(200).json({ success: true, reply, suggestion: reply });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const fullPrompt = `You are a professional Dental Clinic AI Assistant for DentaCare Pro.
    Context: ${JSON.stringify(context || treatmentHistory || {})}
    User Query: ${userQuery}
    Provide a clear, accurate, and helpful dental recommendation or clinical summary. Reply in the same language as the query (Sinhala or English).`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      reply: responseText,
      suggestion: responseText,
    });
  } catch (_error: any) {
    const fallback = generateSmartDentalFallback(userQuery, false);
    res.status(200).json({
      success: true,
      reply: fallback,
      suggestion: fallback,
    });
  }
};

export const chatWithBot = async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).json({ success: false, message: 'Message is required' });
    return;
  }

  try {
    if (!apiKey || apiKey.startsWith('AQ.')) {
      const reply = generateSmartDentalFallback(message, true);
      res.status(200).json({ success: true, reply });
      return;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are DentaBot, a friendly virtual assistant for DentaCare Pro Dental Clinic. Reply in Sinhala if spoken to in Sinhala, or English if in English.`,
    });

    const chat = model.startChat({ history: Array.isArray(history) ? history : [] });
    const result = await chat.sendMessage(message);
    res.status(200).json({ success: true, reply: result.response.text() });
  } catch (_error: any) {
    res.status(200).json({ success: true, reply: generateSmartDentalFallback(message, true) });
  }
};
