"use client";
import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import getCroppedImg from "@/utils/cropImage";
import { Button } from "@heroui/react";
import { Trash2Icon } from "lucide-react";

export default function ThumbnailUploader({
  thumbnail,
  setThumbnail,
  thumbnailError,
}) {
  const [preview, setPreview] = useState(thumbnail);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);

  useEffect(() => {
    if (thumbnail && typeof thumbnail === "string") {
      setPreview(thumbnail);
    }
  }, [thumbnail]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setPreview(null);
      setOriginalFile(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImageBlob = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      16 / 9
    );
    const croppedFile = new File([croppedImageBlob], "thumbnail.jpg", {
      type: "image/jpeg",
    });
    setPreview(URL.createObjectURL(croppedImageBlob));
    setThumbnail(croppedFile);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleRemove = () => {
    setPreview(null);
    setImageSrc(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setThumbnail(null);
  };

  return (
    <div className="space-y-3 mt-2">
      <label className="text-sm font-medium text-foreground mb-2">
        Thumbnail (16:9)
      </label>

      {!imageSrc && !preview && (
        <div
          {...getRootProps()}
          className="border border-dashed border-gray-400 p-6 rounded-lg text-center cursor-pointer hover:bg-muted/30"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop your image here...</p>
          ) : (
            <p>Drag & drop or click to select image</p>
          )}
        </div>
      )}

      {imageSrc && !preview && (
        <div className="relative h-40 sm:h-64 w-full max-w-md aspect-video bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <Button
            type="button"
            onPress={handleCrop}
            className="absolute bottom-2 right-2"
          >
            Crop Image
          </Button>
        </div>
      )}

      {preview && (
        <div className="w-full max-w-md aspect-video overflow-hidden rounded-lg border border-default-200 relative">
          <img
            src={preview}
            alt="Cropped Thumbnail"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            onPress={handleRemove}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-md bg-red-700"
            variant="shadow"
            size="icon"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {thumbnailError && (
        <p className="text-red-500 text-sm">{thumbnailError}</p>
      )}
    </div>
  );
}
