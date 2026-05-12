import { Play, Eye, CheckCircle, XCircle, Info } from 'lucide-react';
import { Config, Student, AudioAssignment, ProcessedReport } from '../types';
import { transcribeAudio, generateFeedback, sendFeedbackEmail } from '../utils/api';

interface RunSectionProps {
  config: Config;
  students: Student[];
  audioAssignments: AudioAssignment[];
  setAudioAssignments: (assignments: AudioAssignment[]) => void;
  reports: ProcessedReport[];
  setReports: (reports: ProcessedReport[]) => void;
  logs: { message: string; type: 'success' | 'error' | 'info' }[];
  addLog: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearLogs: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function RunSection({
  config,
  students,
  audioAssignments,
  setAudioAssignments,
  reports,
  setReports,
  logs,
  addLog,
  clearLogs,
  isProcessing,
  setIsProcessing,
}: RunSectionProps) {

  const validateConfig = (sendEmails: boolean): boolean => {
    if (!config.geminiKey) {
      addLog('❌ Gemini API key is required', 'error');
      return false;
    }
    if (sendEmails) {
      if (!config.resendKey) {
        addLog('❌ Resend API key is required for sending emails', 'error');
        return false;
      }
      if (!config.fromEmail) {
        addLog('❌ From email address is required', 'error');
        return false;
      }
      if (!config.teacherName) {
        addLog('❌ Teacher name is required', 'error');
        return false;
      }
    }

    const unassigned = audioAssignments.filter(a => !a.studentId);
    if (unassigned.length > 0) {
      addLog(`⚠️ Warning: ${unassigned.length} audio file(s) have no student assigned`, 'error');
      return false;
    }

    return true;
  };

  const processAll = async (sendEmails: boolean) => {
    clearLogs();

    if (!validateConfig(sendEmails)) {
      return;
    }

    setIsProcessing(true);
    const assignedAudios = audioAssignments.filter(a => a.studentId);
    const newReports: ProcessedReport[] = [];

    for (let i = 0; i < assignedAudios.length; i++) {
      const assignment = assignedAudios[i];
      const student = students.find(s => s.id === assignment.studentId);

      if (!student) continue;

      const num = i + 1;
      const total = assignedAudios.length;

      try {
        // Update status to transcribing
        setAudioAssignments(
          audioAssignments.map(a =>
            a.id === assignment.id ? { ...a, status: 'transcribing' } : a
          )
        );

        // Transcribe
        addLog(`[${num}/${total}] Transcribing ${student.name}...`, 'info');
        const transcript = await transcribeAudio(assignment.file, config.geminiKey);
        addLog(`✓ Transcription complete for ${student.name}`, 'success');

        // Generate feedback
        addLog(`Generating feedback for ${student.name}...`, 'info');
        const feedback = await generateFeedback(student.name, transcript, config.geminiKey);
        addLog(`✓ Feedback ready`, 'success');

        // Send email if requested
        let emailSent = false;
        if (sendEmails) {
          try {
            addLog(`Sending email to ${student.email}...`, 'info');
            await sendFeedbackEmail(
              config.resendKey,
              config.fromEmail,
              config.teacherName,
              student,
              transcript,
              feedback
            );
            addLog(`✓ Email sent!`, 'success');
            emailSent = true;
          } catch (emailError) {
            addLog(`❌ Email failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`, 'error');
          }
        }

        // Update status to done
        setAudioAssignments(
          audioAssignments.map(a =>
            a.id === assignment.id ? { ...a, status: 'done' } : a
          )
        );

        // Add to reports
        newReports.push({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          transcript,
          feedback,
          emailSent,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ Error processing ${student.name}: ${errorMessage}`, 'error');

        setAudioAssignments(
          audioAssignments.map(a =>
            a.id === assignment.id ? { ...a, status: 'error', errorMessage } : a
          )
        );
      }
    }

    setReports([...reports, ...newReports]);
    setIsProcessing(false);
    addLog(`🎉 Processing complete! ${newReports.length} report(s) generated.`, 'success');
  };

  const getLogIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-gray-600" />;
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
          <Play size={20} className="text-white" />
        </div>
        <h2 className="text-2xl">Process & Generate</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => processAll(true)}
            disabled={isProcessing || audioAssignments.length === 0}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none group"
          >
            <Play size={20} className="group-disabled:animate-none" />
            <span className="font-medium">Generate & Send Emails</span>
          </button>

          <button
            onClick={() => processAll(false)}
            disabled={isProcessing || audioAssignments.length === 0}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <Eye size={20} />
            <span className="font-medium">Preview Only</span>
          </button>
        </div>

        {logs.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-gray-100 max-h-96 overflow-y-auto shadow-inner">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Progress Log
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/50">
                  {getLogIcon(log.type)}
                  <span className={
                    log.type === 'success' ? 'text-green-700' :
                    log.type === 'error' ? 'text-red-700' :
                    'text-gray-700'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
