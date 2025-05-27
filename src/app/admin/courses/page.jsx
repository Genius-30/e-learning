"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Skeleton,
  addToast,
  Select,
  SelectItem,
} from "@heroui/react";
import { PlusIcon, SearchIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusOptions = [
  { key: "", label: "All Statuses" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
];

const sortOptions = [
  { key: "createdAt", label: "Newest" },
  { key: "title", label: "Title (A-Z)" },
  { key: "totalStudents", label: "Most Popular" },
];

const orderOptions = [
  { key: "desc", label: "Descending" },
  { key: "asc", label: "Ascending" },
];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt"); // or "title", etc.
  const [order, setOrder] = useState("desc"); // "asc" or "desc"
  const [status, setStatus] = useState(""); // "" = all, "published", or "unpublished"

  const router = useRouter();

  // Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchCourses();
  }, [sortBy, order, status]);

  // API Fetcher
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/courses", {
        params: {
          search,
          page: 1,
          limit: 10,
          sort: sortBy,
          order,
          status,
        },
      });

      setCourses(res.data?.courses || []);
    } catch (err) {
      console.error("Error fetching courses", err);
      addToast({
        title: "Error fetching courses",
        description: err?.response?.data?.message || "Something went wrong",
        status: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    setIsCreatingCourse(true);
    try {
      const res = await api.post("/admin/courses/create");
      const { courseId } = res.data;

      router.push(`/admin/courses/${courseId}/manage`);

      addToast({
        title: "Course draft created",
        description: "You can now edit your course.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error creating course draft",
        description: error?.response?.data?.message || "Something went wrong.",
        color: "error",
      });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Title + Add Button (Mobile Only) */}
      <div className="flex items-center justify-between sm:hidden mb-4">
        <h1 className="text-lg font-semibold">All Courses</h1>
        <Button
          variant="solid"
          className="bg-primary text-white px-4 py-2 rounded-full"
          onPress={handleCreateCourse}
          isLoading={isCreatingCourse}
          isDisabled={isCreatingCourse}
        >
          {!isCreatingCourse && <PlusIcon className="mr-2 h-4 w-4" />}
          <span>Add</span>
        </Button>
      </div>

      {/* Search, Filters, order, category */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="h-[48px] flex-1">
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
            className="w-full h-full"
            classNames={{
              input: "h-full border-none outline-none py-2 px-4",
              startContent: "text-default-400",
              mainWrapper: "h-full",
              inputWrapper: "h-full",
            }}
          />
        </div>

        {/* 🔍 Filters Section */}
        <div className="w-full sm:w-auto flex items-center flex-wrap md:flex-nowrap gap-3">
          <Select
            selectedKeys={[status]}
            className="w-[120px] sm:w-[160px] max-w-xs"
            label="Status"
            size="sm"
            onChange={(e) => setStatus(e.target.value)}
            classNames={{
              label: "mb-3",
            }}
          >
            {statusOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          <Select
            selectedKeys={[sortBy]}
            className="w-[100px] sm:w-[150px] max-w-xs"
            label="Sort By"
            size="sm"
            onChange={(e) => setSortBy(e.target.value)}
            classNames={{
              label: "mb-3",
            }}
          >
            {sortOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          <Select
            selectedKeys={[order]}
            className="w-[100px] sm:w-[150px] max-w-xs"
            label="Order"
            size="sm"
            onChange={(e) => setOrder(e.target.value)}
            classNames={{
              label: "mb-3",
            }}
          >
            {orderOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          {(status || sortBy !== "createdAt" || order !== "desc" || search) && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                setSortBy("createdAt");
                setOrder("desc");
                setStatus("");
                setSearch("");
              }}
              className="h-[48px]"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="mt-6">
        {/* ⏳ Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="border border-card rounded-xl p-4 shadow-sm space-y-3"
              >
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* 📭 Empty State */}
        {!loading && courses.length === 0 && (
          <div className="border border-dashed p-4 rounded-lg text-center text-default-500">
            No courses found.
          </div>
        )}

        {/* ✅ Course Cards */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/admin/courses/${course._id}/manage/details`}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
                <p className="text-sm text-default-500 mb-1">
                  {course.totalLectures} lectures • {course.totalSections}{" "}
                  sections
                </p>
                <p className="text-sm text-default-400">
                  Enrolled: {course.totalStudents}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
