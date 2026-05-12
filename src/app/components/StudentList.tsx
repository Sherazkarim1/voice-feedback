import { useState } from 'react';
import { Users } from 'lucide-react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

export default function StudentList({ students, setStudents }: StudentListProps) {
  const [inputText, setInputText] = useState('');

  const parseStudents = () => {
    const lines = inputText.trim().split('\n').filter(line => line.trim());
    const parsed: Student[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        parsed.push({
          id: `student-${Date.now()}-${index}`,
          name: parts[0],
          email: parts[1],
        });
      }
    });

    setStudents(parsed);
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <h2 className="text-2xl">Student List</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Paste student data (one per line: Name, email@address.com)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Alice Chen, alice@gmail.com&#10;Bob Tan, bob@example.com&#10;Charlie Wu, charlie@outlook.com"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm bg-gray-50 transition-all"
          />
        </div>

        <button
          onClick={parseStudents}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          Parse Students
        </button>

        {students.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                {students.length} students loaded
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {students.map((student, index) => (
                    <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
