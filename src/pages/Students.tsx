import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Plus, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Students() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [majorFilter, setMajorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("lastName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data, isLoading, refetch } = trpc.student.list.useQuery({
    search: search || undefined,
    major: majorFilter || undefined,
    status: (statusFilter as "active" | "inactive" | "probation") || undefined,
    sortBy: sortBy as "lastName" | "enrollmentYear" | "currentGpa",
    sortOrder,
    page,
    limit: 15,
  });

  const { data: majors } = trpc.student.getDistinctMajors.useQuery();

  const createStudent = trpc.student.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddDialog(false);
    },
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createStudent.mutate({
      studentId: formData.get("studentId") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      major: formData.get("major") as string,
      enrollmentYear: parseInt(formData.get("enrollmentYear") as string),
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold text-white">STUDENT INDEX</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-8">
              <Plus className="w-3 h-3 mr-1" />
              ADD STUDENT
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-none max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-widest">
                Register New Student
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input name="studentId" placeholder="Student ID (e.g., STU-1050)" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
                <Input name="enrollmentYear" type="number" placeholder="Enrollment Year" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input name="firstName" placeholder="First Name" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
                <Input name="lastName" placeholder="Last Name" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              </div>
              <Input name="email" type="email" placeholder="Email Address" required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              <Input name="major" placeholder="Major (e.g., CS, ENG, MAT)" required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              <Button type="submit" disabled={createStudent.isPending}
                className="w-full bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-9">
                {createStudent.isPending ? "REGISTERING..." : "REGISTER STUDENT"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white font-mono text-xs h-8 pl-7 pr-3 w-56 focus:border-[#E5E7EB] focus:outline-none"
          />
        </div>

        <select
          value={majorFilter}
          onChange={(e) => { setMajorFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] font-mono text-xs h-8 px-3 focus:border-[#E5E7EB] focus:outline-none"
        >
          <option value="">ALL MAJORS</option>
          {majors?.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] font-mono text-xs h-8 px-3 focus:border-[#E5E7EB] focus:outline-none"
        >
          <option value="">ALL STATUS</option>
          <option value="active">ACTIVE</option>
          <option value="probation">PROBATION</option>
          <option value="inactive">INACTIVE</option>
        </select>

        <button
          onClick={() => handleSort("currentGpa")}
          className={`flex items-center gap-1 px-3 h-8 font-mono text-xs border transition-colors ${
            sortBy === "currentGpa"
              ? "bg-white text-black border-white"
              : "bg-transparent text-[#9CA3AF] border-[#2A2A2A] hover:border-[#4B5563]"
          }`}
        >
          GPA <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-[#2A2A2A]">
        <div className="grid grid-cols-[120px_140px_140px_100px_80px_80px_90px_60px] bg-[#1A1A1A] px-3 py-2">
          {["STUDENT_ID", "LAST_NAME", "FIRST_NAME", "ENROLLMENT", "MAJOR", "GPA", "STATUS", ""].map(
            (h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563]">
                {h}
              </span>
            )
          )}
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#0D0D0D] animate-pulse" />
            ))
          ) : data?.students.length === 0 ? (
            <div className="text-center py-8 text-[#4B5563] font-mono text-xs">
              NO STUDENTS FOUND
            </div>
          ) : (
            data?.students.map((student, idx) => (
              <Link
                key={student.id}
                to={`/students/${student.id}`}
                className={`data-row grid grid-cols-[120px_140px_140px_100px_80px_80px_90px_60px] px-3 py-2.5 ${
                  idx % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"
                }`}
              >
                <span className="font-mono text-xs text-blue-400">{student.studentId}</span>
                <span className="text-xs text-white">{student.lastName}</span>
                <span className="text-xs text-white">{student.firstName}</span>
                <span className="font-mono text-xs text-[#9CA3AF]">{student.enrollmentYear}</span>
                <span className="font-mono text-xs text-[#9CA3AF]">{student.major}</span>
                <span className={`font-mono text-xs ${
                  parseFloat(student.currentGpa || "0") >= 3.5
                    ? "text-emerald-400"
                    : parseFloat(student.currentGpa || "0") < 2.0
                    ? "text-red-400"
                    : "text-[#9CA3AF]"
                }`}>
                  {student.currentGpa}
                </span>
                <span className="flex items-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono status-${student.status}`}>
                    {student.status}
                  </span>
                </span>
                <span className="text-[#4B5563] text-xs">{"->"}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#4B5563]">
            {data.total} RECORDS | PAGE {page} OF {Math.ceil(data.total / data.limit)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] disabled:opacity-30 hover:border-[#4B5563]"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / data.limit)}
              className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] disabled:opacity-30 hover:border-[#4B5563]"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
