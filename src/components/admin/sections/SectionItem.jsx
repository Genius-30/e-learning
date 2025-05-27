  "use client";
  import api from "@/utils/axiosInstance";
  import { useSortable } from "@dnd-kit/sortable";
  import { CSS } from "@dnd-kit/utilities";
  import { Accordion, AccordionItem, addToast, Button } from "@heroui/react";
  import { GripVertical } from "lucide-react";
  import SectionNotes from "./SectionNotes";
  import LectureList from "../lectures/LectureList";
  import { Separator } from "@/components/ui/separator";

  export default function SectionItem({
    section,
    index,
    courseId,
    onDelete,
    onEdit,
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: section._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleDelete = async () => {
      try {
        await api.patch(
          `/admin/courses/${courseId}/sections/${section._id}/delete`
        );

        addToast({
          color: "success",
          title: "Section Deleted",
          description: "The section was deleted successfully (Soft Delete).",
        });

        if (onDelete) onDelete(section._id);
      } catch (err) {
        console.error("Delete failed:", err);
        addToast({
          color: "danger",
          title: "Deletion Failed",
          description:
            err?.response?.data?.message || "Could not delete the section.",
        });
      }
    };

    return (
      <Accordion
        ref={setNodeRef}
        style={style}
        variant="splitted"
        className="px-0 touch-none"
      >
        <AccordionItem
          key={section._id}
          aria-label={`Section ${index + 1}`}
          title={
            <div className="flex items-center gap-3">
              <span
                {...attributes}
                {...listeners}
                className="cursor-grab text-gray-400 hover:text-black"
              >
                <GripVertical size={18} />
              </span>
              <span className="font-medium">
                {section.title || `Untitled Section ${index + 1}`}
              </span>
            </div>
          }
          startContent={
            <span className="text-sm text-gray-500">{`${index + 1}.`}</span>
          }
          classNames={{
            base: "pr-8",
          }}
        >
          {/* Section Description */}
          {section?.description && (
            <>
              <p>{section.description}</p>

              <Separator className="my-6 sm:my-8" />
            </>
          )}

          {/* Notes list */}
          <SectionNotes
            courseId={courseId}
            sectionId={section._id}
            notes={section.notesUrls || []}
          />

          <Separator className="my-6 sm:my-8" />

          {/* Lectures list */}
          <LectureList
            lectures={section.lectures || []}
            sectionId={section._id}
          />

          <Separator className="my-6 sm:my-8" />

          {/* Sections Actions (Edit/Delete) */}
          <div className="flex justify-end items-center mb-2">
            <Button
              variant="light"
              className="data-[hover=true]:bg-blue/20 text-blue"
              onPress={onEdit}
            >
              Edit
            </Button>
            <Button variant="light" color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </div>
        </AccordionItem>
      </Accordion>
    );
  }
