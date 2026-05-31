import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Plus, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Enrollments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading, refetch } = trpc.enrollment.list.useQuery({
    status: (statusFilter as "enrolled" | "completed" | "dropped") || undefined,
    page,
    limit: 15,
  });

  const enrollByCodeMutation = trpc.enrollment.enrollByCode.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(`Successfully enrolled in ${data.courseCode} - ${data.courseTitle}`);
      setShowEnrollDialog(false);
      refetch();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const dropMutation = trpc.enrollment.drop.useMutation({
    onSuccess: () => {
      setSuccessMsg("Course dropped successfully");
      refetch();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const gradeMutation = trpc.enrollment.updateGrade.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(`Grade updated. New GPA: ${data.gpa}`);
      setShowGradeDialog(false);
      refetch();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const handleEnroll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    enrollByCodeMutation.mutate({
      studentIdCode: formData.get("studentIdCode") as string,
      courseCode: formData.get("courseCode") as string,
      semester: formData.get("semester") as string,
    });
  };

  const handleGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    if (selectedEnrollmentId) {
      gradeMutation.mutate({
        id: selectedEnrollmentId,
        finalGrade: parseFloat(fd.get("grade") as string),
      });
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold text-white">ENROLLMENT MANAGEMENT</h1>
        <Dialog
          open={showEnrollDialog}
          onOpenChange={(open) => {
            setShowEnrollDialog(open);
            setErrorMsg("");
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-8">
              <Plus className="w-3 h-3 mr-1" />
              NEW ENROLLMENT
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-none max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-widest">
                Enroll Student
              </DialogTitle>
            </DialogHeader>
            {errorMsg && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                <AlertCircle className="w-3 h-3" />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleEnroll} className="space-y-3 mt-2">
              <Input
                name="studentIdCode"
                type="text"
                placeholder="Student ID (e.g. 15357)"
                required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none"
              />
              <Input
                name="courseCode"
                type="text"
                placeholder="Course Code (e.g. CS-101)"
                required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none"
              />
              <Input
                name="semester"
                placeholder="Semester (e.g. fall 2025)"
                required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none"
              />
              <div className="text-[10px] text-[#4B5563] font-mono">
                Business Rules: Capacity check + Prerequisite validation (transaction-guarded)
              </div>
              <Button
                type="submit"
                disabled={enrollByCodeMutation.isPending}
                className="w-full bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-9"
              >
                {enrollByCodeMutation.isPending ? "PROCESSING..." : "ENROLL"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <CheckCircle className="w-3 h-3" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search enrollments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white font-mono text-xs h-8 pl-7 pr-3 w-56 focus:border-[#E5E7EB] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] font-mono text-xs h-8 px-3 focus:border-[#E5E7EB] focus:outline-none"
        >
          <option value="">ALL STATUS</option>
          <option value="enrolled">ENROLLED</option>
          <option value="completed">COMPLETED</option>
          <option value="dropped">DROPPED</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="border border-[#2A2A2A]">
        <div className="grid grid-cols-[100px_1fr_100px_80px_90px_80px_80px] bg-[#1A1A1A] px-3 py-2">
          {["STUDENT", "COURSE", "SEMESTER", "DATE", "STATUS", "GRADE", "ACTIONS"].map((h) => (
            <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563]">
              {h}
            </span>
          ))}
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#0D0D0D] animate-pulse" />
            ))
          ) : data?.enrollments.length === 0 ? (
            <div className="text-center py-8 text-[#4B5563] font-mono text-xs">
              NO ENROLLMENTS FOUND
            </div>
          ) : (
            data?.enrollments.map((enr, idx) => (
              <div
                key={enr.enrollmentId}
                className={`data-row grid grid-cols-[100px_1fr_100px_80px_90px_80px_80px] px-3 py-2.5 items-center ${
                  idx % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"
                }`}
              >
                <Link
                  to={`/students/${enr.studentId}`}
                  className="font-mono text-xs text-blue-400 hover:underline"
                >
                  {enr.studentName} {enr.studentLastName?.[0]}.
                </Link>
                <Link
                  to={`/courses/${enr.courseId}`}
                  className="text-xs text-white truncate hover:text-blue-400"
                >
                  <span className="font-mono text-blue-400">{enr.courseCode}</span>{" "}
                  <span className="text-[#4B5563]">{enr.courseTitle}</span>
                </Link>
                <span className="font-mono text-xs text-[#9CA3AF]">{enr.semester}</span>
                <span className="font-mono text-[10px] text-[#4B5563]">
                  {enr.enrollmentDate
                    ? new Date(enr.enrollmentDate).toLocaleDateString()
                    : "--"}
                </span>
                <span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono status-${enr.status}`}
                  >
                    {enr.status}
                  </span>
                </span>
                <span
                  className={`font-mono text-xs ${
                    enr.finalGrade
                      ? parseFloat(enr.finalGrade) >= 90
                        ? "text-emerald-400"
                        : parseFloat(enr.finalGrade) >= 70
                        ? "text-[#9CA3AF]"
                        : "text-red-400"
                      : "text-[#4B5563]"
                  }`}
                >
                  {enr.finalGrade || "--"}
                </span>
                <div className="flex items-center gap-1">
                  {enr.status === "enrolled" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedEnrollmentId(enr.enrollmentId);
                          setShowGradeDialog(true);
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors"
                      >
                        GRADE
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Drop this enrollment?")) {
                            dropMutation.mutate({ id: enr.enrollmentId });
                          }
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-mono text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                      >
                        DROP
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination with page numbers */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#4B5563]">
            {data.total} RECORDS | PAGE {page} OF {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] disabled:opacity-30 hover:border-[#4B5563] font-mono text-xs"
            >
              {"<"}
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`e-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-[#4B5563] font-mono text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center border font-mono text-xs transition-colors ${
                    page === p
                      ? "border-white bg-white text-black"
                      : "border-[#2A2A2A] text-[#9CA3AF] hover:border-[#4B5563]"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] disabled:opacity-30 hover:border-[#4B5563] font-mono text-xs"
            >
              {">"}
            </button>
          </div>
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog
        open={showGradeDialog}
        onOpenChange={(open) => {
          setShowGradeDialog(open);
          setErrorMsg("");
        }}
      >
        <DialogContent className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-none max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest">
              Assign Final Grade
            </DialogTitle>
          </DialogHeader>
          {errorMsg && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              <AlertCircle className="w-3 h-3" />
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleGrade} className="space-y-3 mt-2">
            <Input
              name="grade"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Grade (0-100)"
              required
              className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none"
            />
            <div className="text-[10px] text-[#4B5563] font-mono">
              This will mark the enrollment as completed and recalculate the student's GPA.
            </div>
            <Button
              type="submit"
              disabled={gradeMutation.isPending}
              className="w-full bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-9"
            >
              {gradeMutation.isPending ? "UPDATING..." : "ASSIGN GRADE"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
