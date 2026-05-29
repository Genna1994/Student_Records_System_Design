import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Plus, ChevronLeft, ChevronRight, Users, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Courses() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data, isLoading, refetch } = trpc.course.list.useQuery({
    search: search || undefined,
    department: deptFilter || undefined,
    page,
    limit: 12,
  });

  const { data: departments } = trpc.course.getDistinctDepartments.useQuery();

  const createCourse = trpc.course.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddDialog(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createCourse.mutate({
      courseCode: formData.get("courseCode") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      credits: parseInt(formData.get("credits") as string) || 3,
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || 30,
      department: formData.get("department") as string,
      semester: formData.get("semester") as string,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold text-white">COURSE MANAGEMENT</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-8">
              <Plus className="w-3 h-3 mr-1" />
              ADD COURSE
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-none max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-widest">
                Create New Course
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input name="courseCode" placeholder="Code (e.g., CS-101)" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
                <Input name="semester" placeholder="Semester (e.g., Fall 2025)" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              </div>
              <Input name="title" placeholder="Course Title" required
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              <Input name="description" placeholder="Description (optional)"
                className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              <div className="grid grid-cols-3 gap-3">
                <Input name="department" placeholder="Dept" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
                <Input name="credits" type="number" placeholder="Credits" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
                <Input name="maxCapacity" type="number" placeholder="Capacity" required
                  className="bg-[#0D0D0D] border-[#2A2A2A] text-white font-mono text-xs h-9 rounded-none" />
              </div>
              <Button type="submit" disabled={createCourse.isPending}
                className="w-full bg-white text-black hover:bg-[#E5E7EB] rounded-none font-mono text-xs h-9">
                {createCourse.isPending ? "CREATING..." : "CREATE COURSE"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white font-mono text-xs h-8 pl-7 pr-3 w-56 focus:border-[#E5E7EB] focus:outline-none"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] font-mono text-xs h-8 px-3 focus:border-[#E5E7EB] focus:outline-none"
        >
          <option value="">ALL DEPARTMENTS</option>
          {departments?.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#0D0D0D] animate-pulse" />
          ))
        ) : data?.courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#4B5563] font-mono text-xs bg-[#0D0D0D]">
            NO COURSES FOUND
          </div>
        ) : (
          data?.courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-[#0D0D0D] p-4 hover:bg-[#111111] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-sm text-blue-400">{course.courseCode}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-mono bg-[#1A1A1A] text-[#9CA3AF] border border-[#2A2A2A]">
                  {course.department}
                </span>
              </div>
              <h3 className="text-sm text-white mb-2 line-clamp-1">{course.title}</h3>
              {course.description && (
                <p className="text-[11px] text-[#4B5563] mb-3 line-clamp-2">{course.description}</p>
              )}
              <div className="flex items-center gap-4 text-[10px] text-[#4B5563]">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {course.credits} CR
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {course.currentEnrollment}/{course.maxCapacity}
                </span>
              </div>
              <div className="mt-2 w-full h-1 bg-[#1A1A1A]">
                <div
                  className="h-full bg-emerald-500/50"
                  style={{
                    width: `${Math.min(100, (course.currentEnrollment / course.maxCapacity) * 100)}%`,
                  }}
                />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#4B5563]">
            {data.total} COURSES | PAGE {page} OF {Math.ceil(data.total / data.limit)}
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
