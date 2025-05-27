"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "@/components/cards/CourseCard";
import SkeletonCourseCard from "@/components/skeletons/SkeletonCourseCard";
import api from "@/utils/axiosInstance";
import {
  addToast,
  Input,
  Select,
  SelectItem,
  Button,
  Pagination,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { courseCategories } from "@/constants/courseCategories";
import { useRouter } from "next/router";

const sortOptions = [
  { key: "createdAt", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "title", label: "Title (A-Z)" },
  { key: "popularity", label: "Most Popular" },
  { key: "rating", label: "Top Rated" },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourses();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
    fetchCourses();
  }, [sortBy, category]);

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  const fetchCourses = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const res = await api.get("/courses", {
        params: {
          search,
          sortBy,
          category,
          page: pageToFetch,
        },
      });
      if (res.data.success) {
        setCourses(res.data.courses);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch courses",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] w-full lg:max-w-[80%] mx-auto bg-background text-text p-4">
      {/* Filters + Search */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-center mb-6">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
          className="w-full md:max-w-md"
          classNames={{
            input: "h-full py-2 px-4",
            startContent: "text-default-400",
            mainWrapper: "h-[48px]",
            inputWrapper: "h-full",
          }}
        />

        {/* 🔍 Filters Section */}
        <div className="w-full sm:w-auto flex items-center flex-wrap md:flex-nowrap gap-3">
          <Select
            selectedKeys={[category]}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
            size="sm"
            className="w-[100px] sm:w-[150px] max-w-xs truncate"
          >
            {courseCategories.map((cat) => (
              <SelectItem key={cat}>{cat}</SelectItem>
            ))}
          </Select>

          <Select
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
            size="sm"
            className="w-[100px] sm:w-[150px] max-w-xs"
          >
            {sortOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          {(search || sortBy !== "createdAt" || category) && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                setSortBy("createdAt");
                setSearch("");
                setCategory("");
              }}
              className="h-[48px]"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCourseCard key={i} />
            ))
          : courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}

        {!loading && courses.length === 0 && (
          <div className="col-span-full text-center text-default-500">
            No courses found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {courses.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            isCompact
            showControls
            total={totalPages}
            initialPage={1}
            page={page}
            onChange={setPage}
            isDisabled={loading || totalPages <= 1}
          />
        </div>
      )}
    </main>
  );
}
