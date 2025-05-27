"use client";
import { Plus } from "lucide-react";
import LectureItem from "./LectureItem";
import { addToast, Button, useDisclosure } from "@heroui/react";
import { useState } from "react";
import AddEditLectureModal from "./AddEditLectureModal";
import api from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function LectureList({ lectures = [], sectionId }) {
  const [lectureList, setLectureList] = useState(lectures);
  const { isOpen, onOpenChange } = useDisclosure();
  const [editLecture, setEditLecture] = useState(null);

  const { courseId } = useParams();

  const handleAddClick = () => {
    setEditLecture(null);
    onOpenChange(true);
  };

  const handleEditClick = (lecture) => {
    setEditLecture(lecture);
    onOpenChange(true);
  };

  const handleLectureAdded = (newLecture) => {
    setLectureList((prev) => [...prev, newLecture]);
  };

  const handleLectureUpdated = (updatedLecture) => {
    setLectureList((prev) =>
      prev.map((lec) => (lec._id === updatedLecture._id ? updatedLecture : lec))
    );
    setEditLecture(null);
  };

  const handleLectureDeleted = async (lectureId) => {
    try {
      await api.delete(
        `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`
      );

      setLectureList((prev) => prev.filter((lec) => lec._id !== lectureId));
    } catch (error) {
      addToast({
        color: "danger",
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to delete lecture. Try again!",
      });
    }
  };

  const handleTogglePreview = (lecture) => {
    setLectureList((prev) =>
      prev.map((lec) => (lec._id === lecture._id ? lecture : lec))
    );
  };

  const getSectionPos = (id) =>
    lectureList.findIndex((section) => section._id === id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = getSectionPos(active.id);
    const newIndex = getSectionPos(over.id);

    const newLectures = arrayMove(lectureList, oldIndex, newIndex);
    setLectureList(newLectures); // Optimistic update

    try {
      const orderedLectureIds = newLectures.map((lecture) => lecture._id);

      await api.patch(
        `/admin/courses/${courseId}/sections/${sectionId}/lectures/reorder`,
        {
          orderedLectureIds,
        }
      );
    } catch (err) {
      addToast({
        color: "danger",
        title: "Failed to reorder",
        description: err?.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">
        Lectures ({lectureList.length})
      </h4>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lectureList.map((lecture) => lecture._id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {lectureList.map((lecture, i) => (
              <LectureItem
                key={lecture._id}
                lecture={lecture}
                index={i}
                onEdit={() => handleEditClick(lecture)}
                onDelete={handleLectureDeleted}
                onTogglePreview={handleTogglePreview}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        className="mt-3"
        startContent={<Plus size={16} />}
        variant="light"
        onPress={handleAddClick}
      >
        Add Lecture
      </Button>

      <AddEditLectureModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        sectionId={sectionId}
        editLecture={editLecture}
        onLectureAdded={handleLectureAdded}
        onLectureUpdated={handleLectureUpdated}
      />
    </div>
  );
}
