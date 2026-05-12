export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface AudioAssignment {
  id: string;
  file: File;
  studentId: string | null;
  status: 'pending' | 'transcribing' | 'done' | 'error';
  errorMessage?: string;
}

export interface ProcessedReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  transcript: string;
  feedback: string;
  emailSent: boolean;
}

export interface Config {
  geminiKey: string;
  resendKey: string;
  fromEmail: string;
  teacherName: string;
}
