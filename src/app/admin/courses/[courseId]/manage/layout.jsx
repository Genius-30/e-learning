// ManageCourse.tsx
"use client";

import React from "react";
import { Tabs, Tab } from "@heroui/react";
import { FileTextIcon, ListCollapseIcon, RocketIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

function ManageCourseLayout({ children }) {
  const pathname = usePathname();
  const { courseId } = useParams();

  const tabPaths = {
    details: `/admin/courses/${courseId}/manage/details`,
    sections: `/admin/courses/${courseId}/manage/sections`,
    publish: `/admin/courses/${courseId}/manage/publish`,
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs
        selectedKey={pathname}
        aria-label="Course Tabs"
        color="primary"
        variant="solid"
        classNames={{
          base: "flex justify-center",
        }}
      >
        <Tab
          key={tabPaths.details}
          title={
            <div className="flex items-center space-x-2">
              <FileTextIcon />
              <span>Details</span>
            </div>
          }
          href={tabPaths.details}
        />

        <Tab
          key={tabPaths.sections}
          title={
            <div className="flex items-center space-x-2">
              <ListCollapseIcon />
              <span>Sections</span>
            </div>
          }
          href={tabPaths.sections}
        />

        <Tab
          key={tabPaths.publish}
          title={
            <div className="flex items-center space-x-2">
              <RocketIcon />
              <span>Publish</span>
            </div>
          }
          href={tabPaths.publish}
        />
      </Tabs>

      <div>{children}</div>
    </div>
  );
}

export default ManageCourseLayout;
