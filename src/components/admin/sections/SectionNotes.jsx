"use client";
import api from "@/utils/axiosInstance";
import { useRef, useState } from "react";
import { Button, addToast } from "@heroui/react";
import { Upload, Trash2, FileText, Image, File } from "lucide-react";

export default function SectionNotes({ courseId, sectionId, notes = [] }) {
  const [noteList, setNoteList] = useState(notes);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getIconByType = (type) => {
    switch (type) {
      case "pdf":
      case "docx":
        return <FileText size={18} />;

      case "pptx":
        return <FilePowerpoint size={18} />;

      case "image":
        return <Image size={18} />;

      default:
        return <File size={18} />;
    }
  };

  const handleNoteUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("note", file);

    setIsUploading(true);
    try {
      const res = await api.post(
        `/admin/courses/${courseId}/sections/${sectionId}/notes/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setNoteList((prev) => [...prev, res.data.note]);

      addToast({
        title: "Note uploaded successfully",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Upload Failed",
        description: err?.response?.data?.message || "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleNoteDelete = async (noteUrl) => {
    try {
      await api.post(
        `/admin/courses/${courseId}/sections/${sectionId}/notes/delete`,
        {
          url: noteUrl,
        }
      );
      setNoteList((prev) => prev.filter((note) => note.url !== noteUrl));

      addToast({
        title: "Note deleted",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Deletion Failed",
        description: err?.response?.data?.message || "Something went wrong",
        color: "danger",
      });
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Notes</h4>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,image/*"
          className="hidden"
          onChange={handleNoteUpload}
          disabled={isUploading}
        />
        <Button
          size="sm"
          startContent={<Upload size={16} />}
          isLoading={isUploading}
          isDisabled={isUploading}
          onPress={() => fileInputRef.current.click()}
        >
          Upload Note
        </Button>
      </div>

      {noteList.length === 0 ? (
        <p className="text-sm text-gray-500">No notes uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {noteList.map((note) => (
            <li
              key={note.url.split("/").pop()}
              className="flex items-center justify-between border border-card p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {getIconByType(note.fileType)}
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                >
                  {note.title.split(".")[0]}
                </a>
                <span className="text-xs text-gray-500">
                  ({note.fileType.toUpperCase()})
                </span>
              </div>

              <Button
                variant="light"
                size="sm"
                color="danger"
                isIconOnly
                onPress={() => handleNoteDelete(note.url)}
              >
                <Trash2 size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
