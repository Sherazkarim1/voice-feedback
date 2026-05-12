import { Student } from '../types';

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function transcribeAudio(file: File, geminiKey: string): Promise<string> {
  const base64 = await fileToBase64(file);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    opus: 'audio/ogg',
    wav: 'audio/wav',
    webm: 'audio/webm',
    aac: 'audio/aac'
  };
  const mime = mimeMap[ext] || 'audio/mpeg';

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mime,
              data: base64
            }
          },
          {
            text: 'Transcribe this audio recording verbatim. Output only the transcription, no commentary.'
          }
        ]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Transcription failed');
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

export async function generateFeedback(name: string, transcript: string, geminiKey: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: {
          text: 'You are a warm, encouraging English language teacher providing written feedback on a student\'s spoken self-introduction. Be specific, constructive, and supportive. Use plain text only — no markdown symbols like **, ##, or *.'
        }
      },
      contents: [{
        parts: [{
          text: `Student name: ${name}

Their spoken introduction (transcribed):
"${transcript}"

Write a feedback report with these 5 sections. Use plain text only, no bold or markdown:

1. What you did well
List 2-3 specific things the student did well in terms of vocabulary, grammar, fluency, or content.

2. Grammar to review
Identify 2-3 grammar patterns from their speech that need attention. Quote what they said, then show the corrected version. Example format: They said "I am come from..." — this should be "I come from..."

3. Vocabulary suggestions
Suggest 2-3 words or phrases that would sound more natural or advanced. Give context for each.

4. Fluency and delivery tips
Give 1-2 practical tips on how to sound more fluent (e.g. using connectors, pausing, sentence length).

5. Keep it up!
End with 2-3 warm, encouraging sentences personalised to this student.`
        }]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Feedback generation failed');
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

export async function sendFeedbackEmail(
  resendKey: string,
  fromEmail: string,
  teacherName: string,
  student: Student,
  transcript: string,
  feedback: string
): Promise<boolean> {
  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; color: #2c2c2c; line-height: 1.7;">
      <h2 style="border-bottom: 2px solid #ddd; padding-bottom: 10px; font-size: 20px;">
        Feedback on your spoken introduction
      </h2>
      <p>Dear ${student.name},</p>
      <p>Thank you for your introduction recording! Here is your personalised feedback:</p>
      <div style="background: #f8f8f6; border-left: 4px solid #5b8dd9; padding: 18px 22px; margin: 20px 0; white-space: pre-wrap; font-size: 15px;">
${feedback}
      </div>
      <details style="margin-top: 20px;">
        <summary style="font-size: 13px; color: #888; cursor: pointer;">View your transcript</summary>
        <p style="font-size: 13px; color: #777; font-style: italic; margin-top: 8px;">"${transcript}"</p>
      </details>
      <p style="margin-top: 30px; font-size: 14px; color: #aaa; border-top: 1px solid #eee; padding-top: 14px;">
        — ${teacherName}
      </p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from: `${teacherName} <${fromEmail}>`,
      to: [student.email],
      subject: `Your spoken English feedback — ${student.name}`,
      html: htmlBody
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return true;
}
