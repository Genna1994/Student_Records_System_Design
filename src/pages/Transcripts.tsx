import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { FileText, Search, Printer, Award, BookOpen, GraduationCap } from "lucide-react";
import { RollingDigitRoulette } from "@/components/effects/RollingDigitRoulette";

export default function Transcripts() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { data: transcript, isLoading } = trpc.student.getTranscriptByStudentId.useQuery(
    { studentId: selectedStudentId || "" },
    { enabled: !!selectedStudentId }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (val) setSelectedStudentId(val);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("studentId");
    if (sid) {
      setSelectedStudentId(sid);
      setSearchInput(sid);
    }
  }, []);

  const getLetterGrade = (grade: string | null) => {
    if (!grade) return "N/A";
    const g = parseFloat(grade);
    if (g >= 90) return "A";
    if (g >= 80) return "B";
    if (g >= 70) return "C";
    if (g >= 60) return "D";
    return "F";
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "text-[#4B5563]";
    const g = parseFloat(grade);
    if (g >= 90) return "text-emerald-400";
    if (g >= 80) return "text-blue-400";
    if (g >= 70) return "text-[#9CA3AF]";
    if (g >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold text-white">STUDENT TRANSCRIPTS</h1>
        {transcript && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#2A2A2A] text-[#9CA3AF] hover:border-[#4B5563] hover:text-white transition-colors font-mono text-xs"
          >
            <Printer className="w-3 h-3" />
            PRINT
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Enter Student ID (e.g. 15357)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white font-mono text-xs h-9 pl-7 pr-3 focus:border-[#E5E7EB] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 h-9 bg-white text-black font-mono text-xs hover:bg-[#E5E7EB] transition-colors"
        >
          LOAD TRANSCRIPT
        </button>
      </form>

      {!selectedStudentId ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#4B5563]">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-mono text-xs">ENTER A STUDENT ID TO VIEW TRANSCRIPT</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-[#1A1A1A] animate-pulse" />
          <div className="h-64 bg-[#1A1A1A] animate-pulse" />
        </div>
      ) : !transcript ? (
        <div className="text-center py-12 text-[#4B5563] font-mono text-xs">
          STUDENT NOT FOUND
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div>
                  <span className="font-mono text-[10px] text-[#4B5563] uppercase tracking-widest">
                    Official Academic Transcript
                  </span>
                  <h2 className="text-lg text-white mt-1">
                    {transcript.student.firstName} {transcript.student.lastName}
                  </h2>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="font-mono text-[10px] text-[#4B5563] uppercase">Student ID</span>
                    <div className="font-mono text-sm text-blue-400">{transcript.student.studentId}</div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#4B5563] uppercase">Major</span>
                    <div className="font-mono text-sm text-[#9CA3AF]">{transcript.student.major}</div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#4B5563] uppercase">Enrolled</span>
                    <div className="font-mono text-sm text-[#9CA3AF]">{transcript.student.enrollmentYear}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 inline-block">
                  <div className="font-mono text-[10px] text-[#4B5563] uppercase mb-1">Cumulative GPA</div>
                  <div className={`text-3xl font-mono font-bold ${
                    parseFloat(transcript.summary.gpa || "0") >= 3.5
                      ? "text-emerald-400"
                      : parseFloat(transcript.summary.gpa || "0") < 2.0
                      ? "text-red-400"
                      : "text-[#9CA3AF]"
                  }`}>
                    <RollingDigitRoulette value={transcript.summary.gpa || "0.00"} delay={200} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-mono text-xs text-white">{transcript.summary.coursesAttempted}</div>
                  <div className="font-mono text-[10px] text-[#4B5563]">COURSES ATTEMPTED</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-mono text-xs text-white">{transcript.summary.coursesCompleted}</div>
                  <div className="font-mono text-[10px] text-[#4B5563]">COURSES COMPLETED</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-mono text-xs text-white">{transcript.summary.totalCredits}</div>
                  <div className="font-mono text-[10px] text-[#4B5563]">CREDITS EARNED</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="font-mono text-xs text-white">{transcript.student.status.toUpperCase()}</div>
                  <div className="font-mono text-[10px] text-[#4B5563]">ACADEMIC STANDING</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#2A2A2A]">
            <div className="bg-[#1A1A1A] px-4 py-2 flex items-center gap-2">
              <FileText className="w-3 h-3 text-[#4B5563]" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF]">
                Complete Course History
              </h3>
            </div>
            <div className="grid grid-cols-[100px_1fr_80px_100px_80px_80px_80px] px-4 py-2 bg-[#111111]">
              {["CODE", "TITLE", "CREDITS", "SEMESTER", "STATUS", "GRADE", "LETTER"].map((h) => (
                <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563]">
                  {h}
                </span>
              ))}
            </div>
            {transcript.courses.length === 0 ? (
              <div className="text-center py-8 text-[#4B5563] font-mono text-xs">
                NO COURSES ON RECORD
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2A]">
                {transcript.courses.map((course, idx) => (
                  <div
                    key={course.enrollmentId}
                    className={`grid grid-cols-[100px_1fr_80px_100px_80px_80px_80px] px-4 py-2.5 items-center ${
                      idx % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"
                    }`}
                  >
                    <span className="font-mono text-xs text-blue-400">{course.courseCode}</span>
                    <span className="text-xs text-white truncate">{course.courseTitle}</span>
                    <span className="font-mono text-xs text-[#4B5563]">{course.credits}</span>
                    <span className="font-mono text-xs text-[#9CA3AF]">{course.semester}</span>
                    <span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono status-${course.status}`}>
                        {course.status}
                      </span>
                    </span>
                    <span className={`font-mono text-xs ${getGradeColor(course.finalGrade)}`}>
                      {course.finalGrade || "--"}
                    </span>
                    <span className={`font-mono text-xs ${getGradeColor(course.finalGrade)}`}>
                      {getLetterGrade(course.finalGrade)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center py-4 border-t border-[#2A2A2A]">
            <p className="font-mono text-[10px] text-[#4B5563]">
              NEXUS UNIVERSITY RECORDS SYSTEM | OFFICIAL TRANSCRIPT
            </p>
            <p className="font-mono text-[10px] text-[#4B5563] mt-1">
              Generated on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
