"use client";
import { GripVertical, Pencil, Trash } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addToast, Button, Switch } from "@heroui/react";
import api from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function LectureItem({
  lecture,
  index,
  onEdit,
  onDelete,
  onTogglePreview,
}) {
  const [isFreePreview, setIsFreePreview] = useState(lecture.isFreePreview);

  const { courseId } = useParams();
  const { sectionId } = lecture;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lecture._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTogglePreview = async (lectureId) => {
    setIsFreePreview((prev) => !prev);
    try {
      const res = await api.patch(
        `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/toggle-preview`
      );

      onTogglePreview(res.data.lecture);

      addToast({
        color: "success",
        title: "Preview toggled successfully",
        description: `Lecture preview is now ${
          res.data.lecture.isFreePreview ? "enabled" : "disabled"
        }`,
      });
    } catch (err) {
      setIsFreePreview((prev) => !prev); // Revert the state change on error
      console.error(err);
      addToast({
        color: "danger",
        title: "Error toggling preview",
        description: err?.response?.data?.message || "Please try again!",
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 px-3 py-2 bg-background border border-card rounded-md mb-2"
    >
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-black"
        >
          <GripVertical size={18} />
        </span>
        <span className="text-sm font-medium">{`${index + 1}. ${
          lecture.title
        }`}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          size="sm"
          isSelected={isFreePreview}
          color="success"
          onValueChange={() => handleTogglePreview(lecture._id)}
        />
        <Button
          size="sm"
          variant="light"
          className="min-w-[40px] sm:min-w-[50px]"
          onPress={() => onEdit(lecture._id)}
        >
          <Pencil size={16} />
        </Button>
        <Button
          size="sm"
          variant="light"
          color="danger"
          onPress={() => onDelete(lecture._id)}
          className="min-w-[40px] sm:min-w-[50px]"
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  );
}
