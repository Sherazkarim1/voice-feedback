import { useState } from 'react';
import { Settings } from 'lucide-react';
import ConfigModal from './components/ConfigModal';
import StudentList from './components/StudentList';
import AudioFiles from './components/AudioFiles';
import RunSection from './components/RunSection';
import ReportsSection from './components/ReportsSection';
import { Student, AudioAssignment, ProcessedReport, Config } from './types';

export default function App() {
  const [config, setConfig] = useState<Config>({
    geminiKey: localStorage.getItem('geminiKey') || '',
    resendKey: localStorage.getItem('resendKey') || '',
    fromEmail: localStorage.getItem('fromEmail') || '',
    teacherName: localStorage.getItem('teacherName') || '',
  });

  const [showConfig, setShowConfig] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [audioAssignments, setAudioAssignments] = useState<AudioAssignment[]>([]);
  const [reports, setReports] = useState<ProcessedReport[]>([]);
  const [logs, setLogs] = useState<{ message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setLogs(prev => [...prev, { message, type }]);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🎙️
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Voice Feedback Studio
              </h1>
              <p className="text-sm text-gray-600">AI-Powered English Assessment</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
          >
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Sections */}
        <StudentList students={students} setStudents={setStudents} />
        <AudioFiles
          students={students}
          audioAssignments={audioAssignments}
          setAudioAssignments={setAudioAssignments}
        />
        <RunSection
          config={config}
          students={students}
          audioAssignments={audioAssignments}
          setAudioAssignments={setAudioAssignments}
          reports={reports}
          setReports={setReports}
          logs={logs}
          addLog={addLog}
          clearLogs={clearLogs}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
        <ReportsSection
          reports={reports}
          config={config}
          addLog={addLog}
        />
      </div>

      {/* Config Modal */}
      <ConfigModal
        config={config}
        setConfig={setConfig}
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
}
