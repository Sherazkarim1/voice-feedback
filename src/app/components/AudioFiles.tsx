import React from 'react';
import { Upload, FileAudio } from 'lucide-react';
import { Student, AudioAssignment } from '../types';

interface AudioFilesProps {
  students: Student[];
  audioAssignments: AudioAssignment[];
  setAudioAssignments: (assignments: AudioAssignment[]) => void;
}

export default function AudioFiles({ students, audioAssignments, setAudioAssignments }: AudioFilesProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const processFiles = (files: File[]) => {
    const newAssignments: AudioAssignment[] = files.map((file) => {
      // Auto-match logic: check if filename contains student name
      let matchedStudentId: string | null = null;
      const fileNameLower = file.name.toLowerCase();

      for (const student of students) {
        const nameParts = student.name.toLowerCase().split(' ');
        if (nameParts.some(part => fileNameLower.includes(part))) {
          matchedStudentId = student.id;
          break;
        }
      }

      return {
        id: `audio-${Date.now()}-${Math.random()}`,
        file,
        studentId: matchedStudentId,
        status: 'pending',
      };
    });

    setAudioAssignments([...audioAssignments, ...newAssignments]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('audio/')
    );

    if (files.length > 0) {
      processFiles(files);
    }
  };

  const updateAssignment = (id: string, studentId: string) => {
    setAudioAssignments(
      audioAssignments.map(a => a.id === id ? { ...a, studentId } : a)
    );
  };

  const getStatusBadge = (status: AudioAssignment['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 border border-gray-300',
      transcribing: 'bg-blue-100 text-blue-700 border border-blue-300',
      done: 'bg-green-100 text-green-700 border border-green-300',
      error: 'bg-red-100 text-red-700 border border-red-300',
    };

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
          <FileAudio size={20} className="text-white" />
        </div>
        <h2 className="text-2xl">Audio Recordings</h2>
      </div>

      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className={`flex items-center justify-center w-full h-40 px-4 transition-all bg-gradient-to-br ${
            isDragging
              ? 'from-purple-200 to-pink-200 border-purple-600 scale-105'
              : 'from-purple-50 to-pink-50 border-purple-300'
          } border-2 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 focus:outline-none group`}>
            <div className="flex flex-col items-center space-y-3 pointer-events-none">
              <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all ${
                isDragging ? 'scale-110' : ''
              }`}>
                <Upload className={`text-purple-600 transition-transform ${
                  isDragging ? 'scale-125' : ''
                }`} size={28} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop files here!' : 'Drag & drop or click to upload'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supports .opus, .m4a, .mp3, .wav
                </span>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {audioAssignments.length > 0 && (
          <div>
            <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium inline-block mb-4">
              {audioAssignments.length} files uploaded
            </div>

            <div className="space-y-3">
              {audioAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-xl p-5 flex items-start gap-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileAudio className="text-purple-600" size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{assignment.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(assignment.file.size)}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={assignment.studentId || ''}
                        onChange={(e) => updateAssignment(assignment.id, e.target.value)}
                        className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        disabled={students.length === 0}
                      >
                        <option value="">Assign to student...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>

                      {getStatusBadge(assignment.status)}
                    </div>

                    {assignment.errorMessage && (
                      <div className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {assignment.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {students.length === 0 && audioAssignments.length > 0 && (
          <p className="text-sm text-amber-600">⚠️ Please parse students first to assign audio files</p>
        )}
      </div>
    </section>
  );
}
