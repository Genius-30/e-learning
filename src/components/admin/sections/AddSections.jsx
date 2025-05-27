"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SectionItem from "./SectionItem";
import AddEditSectionModal from "./AddEditSectionModal";
import { addToast, Button, Skeleton, useDisclosure } from "@heroui/react";
import api from "@/utils/axiosInstance";
import { Plus } from "lucide-react";

export default function AddSections() {
  const { courseId } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpenChange } = useDisclosure();
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get(`/admin/courses/${courseId}/sections`);
        setSections(res.data.sections);
      } catch (err) {
        console.error("Fetch sections error:", err);
        addToast({
          color: "danger",
          title: "Failed to fetch sections",
          description: err?.response?.data?.message || "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [courseId]);

  const handleSectionAdded = (newSection) => {
    setSections((prev) => [...prev, newSection]);
  };

  const handleUpdate = (updatedSection) => {
    setSections((prev) =>
      prev.map((section) =>
        section._id === updatedSection._id ? updatedSection : section
      )
    );
    setSelectedSection(null);
  };

  const handleDeleteSection = (deletedId) => {
    setSections((prev) => prev.filter((sec) => sec._id !== deletedId));
  };

  const handleEditClick = (section) => {
    setSelectedSection(section);
    onOpenChange(true);
  };

  const getSectionPos = (id) =>
    sections.findIndex((section) => section._id === id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = getSectionPos(active.id);
    const newIndex = getSectionPos(over.id);

    const newSections = arrayMove(sections, oldIndex, newIndex);
    setSections(newSections); // Optimistic update

    try {
      const orderedSectionIds = newSections.map((section) => section._id);

      await api.patch(`/admin/courses/${courseId}/sections/reorder`, {
        orderedSectionIds,
      });

      // Uncomment this if you want to show a success toast after reordering
      // addToast({
      //   color: "success",
      //   title: "Sections Reordered",
      //   description: "The new order has been saved.",
      // });
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
    <div className="w-full max-w-3xl mx-auto sm:px-4 py-4 sm:py-8 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Sections & Lectures</h2>

      {loading && (
        <div className="flex flex-col gap-4 mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {!loading && sections.length === 0 ? (
        <div className="w-full text-center text-gray-500 py-8 border rounded-xl">
          <p className="text-lg font-medium">No sections yet 😶</p>
          <p className="text-sm mt-1">
            Click the button below to add your first section!
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            <SortableContext
              items={sections.map((section) => section._id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <SectionItem
                  key={section._id}
                  section={section}
                  index={index}
                  courseId={courseId}
                  onDelete={handleDeleteSection}
                  onEdit={() => handleEditClick(section)}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {!loading && (
        <Button
          startContent={<Plus size={16} />}
          variant="light"
          onPress={() => {
            setSelectedSection(null);
            onOpenChange(true);
          }}
        >
          Add Section
        </Button>
      )}

      <AddEditSectionModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSectionAdded={handleSectionAdded}
        editSection={selectedSection}
        onSectionUpdated={handleUpdate}
      />
    </div>
  );
}
