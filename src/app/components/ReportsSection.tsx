import { useState } from 'react';
import { Copy, Send, Check } from 'lucide-react';
import { ProcessedReport, Config } from '../types';
import { sendFeedbackEmail } from '../utils/api';

interface ReportsSectionProps {
  reports: ProcessedReport[];
  config: Config;
  addLog: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ReportsSection({ reports, config, addLog }: ReportsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const copyReport = async (report: ProcessedReport) => {
    const text = `Student: ${report.studentName}\n\nTranscript:\n"${report.transcript}"\n\nFeedback:\n${report.feedback}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(report.studentId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resendEmail = async (report: ProcessedReport) => {
    if (!config.resendKey || !config.fromEmail || !config.teacherName) {
      addLog('❌ Missing email configuration', 'error');
      return;
    }

    setSendingId(report.studentId);
    try {
      await sendFeedbackEmail(
        config.resendKey,
        config.fromEmail,
        config.teacherName,
        { id: report.studentId, name: report.studentName, email: report.studentEmail },
        report.transcript,
        report.feedback
      );
      addLog(`✓ Email sent to ${report.studentName}`, 'success');
    } catch (error) {
      addLog(`❌ Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSendingId(null);
    }
  };

  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">📄</span>
        </div>
        <h2 className="text-2xl">Generated Reports</h2>
      </div>

      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.studentId} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{report.studentName}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.studentEmail}</p>
                {report.emailSent && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-300">
                    <Check size={14} />
                    Email sent
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyReport(report)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-sm flex items-center gap-2 transition-all hover:shadow-md"
                >
                  {copiedId === report.studentId ? (
                    <>
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={() => resendEmail(report)}
                  disabled={sendingId === report.studentId}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm flex items-center gap-2 transition-all disabled:from-gray-300 disabled:to-gray-400 shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  <Send size={16} />
                  {sendingId === report.studentId ? 'Sending...' : 'Resend'}
                </button>
              </div>
            </div>

            <details className="mb-5 group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors bg-white px-4 py-3 rounded-xl border border-gray-200 group-hover:border-indigo-300">
                📝 View transcript
              </summary>
              <div className="mt-3 text-sm text-gray-700 italic bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                "{report.transcript}"
              </div>
            </details>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-5 rounded-xl whitespace-pre-wrap text-sm leading-relaxed text-gray-800 shadow-inner">
              {report.feedback}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
