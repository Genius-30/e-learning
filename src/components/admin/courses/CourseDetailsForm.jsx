"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Button,
  addToast,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Switch,
  Spinner,
} from "@heroui/react";
import { CalendarIcon, IndianRupeeIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { courseCategories } from "@/constants/courseCategories";
import ThumbnailUploader from "./ThumbnailUploader";
import { useParams, useRouter } from "next/navigation";

export default function CourseDetailsForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
    durationWeeks: "",
    onlinePrice: "",
    onlineDiscountPercentage: "",
    onlineDiscountValidUntil: "",
    hybridPrice: "",
    hybridDiscountPercentage: "",
    hybridDiscountValidUntil: "",
  });
  const [originalData, setOriginalData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
    durationWeeks: "",
    onlinePrice: "",
    onlineDiscountPercentage: "",
    onlineDiscountValidUntil: "",
    hybridPrice: "",
    hybridDiscountPercentage: "",
    hybridDiscountValidUntil: "",
  });

  const [errors, setErrors] = useState({});
  const [thumbnailError, setThumbnailError] = useState("");
  const [enableOnlineDiscount, setEnableOnlineDiscount] = useState(false);
  const [enableHybridDiscount, setEnableHybridDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const formRef = useRef(null);
  const router = useRouter();
  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(`/admin/courses/${courseId}/details`);

        const {
          title,
          description,
          category,
          durationWeeks,
          onlinePrice,
          onlineDiscountPercentage,
          onlineDiscountValidUntil,
          hybridPrice,
          hybridDiscountPercentage,
          hybridDiscountValidUntil,
          thumbnail,
        } = res.data;

        setFormData({
          title,
          description,
          category,
          thumbnail,
          durationWeeks,
          onlinePrice,
          onlineDiscountPercentage,
          onlineDiscountValidUntil:
            onlineDiscountValidUntil?.split("T")[0] || "",
          hybridPrice,
          hybridDiscountPercentage,
          hybridDiscountValidUntil:
            hybridDiscountValidUntil?.split("T")[0] || "",
        });
        setOriginalData({
          title,
          description,
          category,
          thumbnail,
          durationWeeks,
          onlinePrice,
          onlineDiscountPercentage: onlineDiscountPercentage || "",
          onlineDiscountValidUntil:
            onlineDiscountValidUntil?.split("T")[0] || "",
          hybridPrice,
          hybridDiscountPercentage: hybridDiscountPercentage || "",
          hybridDiscountValidUntil:
            hybridDiscountValidUntil?.split("T")[0] || "",
        });

        if (onlineDiscountPercentage) setEnableOnlineDiscount(true);
        if (hybridDiscountPercentage) setEnableHybridDiscount(true);
      } catch (error) {
        console.error("Failed to fetch course data", error);
        router.push("/admin/courses");
        addToast({
          title: "Fetch Error",
          description: "Couldn't fetch course details.",
          color: "danger",
        });
      } finally {
        setIsFetching(false);
      }
    };

    if (courseId) fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    if (isFetching) return;

    const isDataChanged =
      JSON.stringify(formData) != JSON.stringify(originalData);
    setIsChanged(isDataChanged);
  }, [
    formData,
    enableOnlineDiscount,
    enableHybridDiscount,
    originalData,
    isFetching,
  ]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
    }));
  };

  const handleSelectChange = (key, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: key,
    }));
  };

  const handleOnlineDiscountToggle = (enabled) => {
    setEnableOnlineDiscount(enabled);

    setFormData((prev) => ({
      ...prev,
      onlineDiscountPercentage: enabled ? prev.onlineDiscountPercentage : "",
      onlineDiscountValidUntil: enabled ? prev.onlineDiscountValidUntil : "",
    }));
  };

  const handleHybridDiscountToggle = (enabled) => {
    setEnableHybridDiscount(enabled);

    setFormData((prev) => ({
      ...prev,
      hybridDiscountPercentage: enabled ? prev.hybridDiscountPercentage : "",
      hybridDiscountValidUntil: enabled ? prev.hybridDiscountValidUntil : "",
    }));
  };

  const validateForm = (data, enableOnlineDiscount, enableHybridDiscount) => {
    const newErrors = {};

    // Basic required fields
    if (!data.title) newErrors.title = "Title is required";
    if (!data.description) newErrors.description = "Description is required";
    if (!data.category) newErrors.category = "Category is required";
    if (
      !data.durationWeeks ||
      isNaN(data.durationWeeks) ||
      data.durationWeeks < 1
    ) {
      newErrors.durationWeeks = "Duration must be at least 1 week";
    }

    if (!data.thumbnail && !(data.thumbnail instanceof File)) {
      newErrors.thumbnail = "Thumbnail is required";
      setThumbnailError("Thumbnail is required.");
    }

    // Discount Validation Helper
    const validateDiscountFields = (type, enabled) => {
      const price = parseFloat(data[`${type}Price`]);
      const discount = parseFloat(data[`${type}DiscountPercentage`]);
      const validUntilStr = data[`${type}DiscountValidUntil`];
      const validUntil = new Date(validUntilStr);
      const today = new Date();

      if (enabled) {
        if (isNaN(price)) {
          newErrors[`${type}Price`] = "Price is required";
        } else if (price < 0) {
          newErrors[`${type}Price`] = "Price must be a positive number";
        }

        if (isNaN(discount)) {
          newErrors[`${type}DiscountPercentage`] = "Discount is required";
        } else if (discount < 0 || discount > 100) {
          newErrors[`${type}DiscountPercentage`] =
            "Discount must be between 0 and 100";
        }

        if (!validUntilStr || isNaN(validUntil.getTime())) {
          newErrors[`${type}DiscountValidUntil`] =
            "Discount valid until date is required";
        } else if (validUntil < today) {
          newErrors[`${type}DiscountValidUntil`] =
            "Discount date must be in the future";
        }
      }
    };

    validateDiscountFields("online", enableOnlineDiscount);
    validateDiscountFields("hybrid", enableHybridDiscount);

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateForm(
      formData,
      enableOnlineDiscount,
      enableHybridDiscount
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // ✅ Create a FormData object
    const submissionData = new FormData();

    // Append basic fields
    Object.entries(formData).forEach(([key, value]) => {
      const originalValue = originalData[key];

      // Convert numbers/dates to strings for proper comparison
      const valueStr = value?.toString() ?? "";
      const originalStr = originalValue?.toString() ?? "";

      if (valueStr !== originalStr) {
        submissionData.append(key, value);
      }
    });

    setErrors({});
    setThumbnailError("");

    try {
      const res = await api.patch(
        `/admin/courses/${courseId}/update`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        thumbnail: res.data.thumbnail,
      }));
      setOriginalData({
        ...formData,
      });

      addToast({
        title: "Course Updated",
        description: "Basic details updated successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          "Something went wrong while updating the course.",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      ref={formRef}
      className="w-full max-w-3xl mx-auto space-y-6 sm:px-4 py-4 sm:py-8"
      validationErrors={errors}
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-4">Course Landing Page</h2>
      {isFetching && (
        <div className="h-10 flex justify-center items-center gap-3">
          <Spinner color="var(--color-zinc-900)" size="sm" />
          <span>Fetching old details...</span>
        </div>
      )}

      <Input
        isRequired
        label="Course Title"
        labelPlacement="outside"
        name="title"
        value={formData.title}
        placeholder="e.g. Full Stack Development"
        onChange={handleFormChange}
      />

      <Textarea
        isRequired
        label="Description"
        labelPlacement="outside"
        name="description"
        value={formData.description}
        placeholder="Enter course description"
        onChange={handleFormChange}
      />

      <Select
        isRequired
        selectedKeys={[formData.category]}
        label="Category"
        labelPlacement="outside"
        name="category"
        placeholder="Choose category"
        onSelectionChange={(keys) =>
          handleSelectChange(Array.from(keys)[0], "category")
        }
      >
        {courseCategories.map((cat) => (
          <SelectItem key={cat}>{cat}</SelectItem>
        ))}
      </Select>

      <Input
        isRequired
        type="number"
        name="durationWeeks"
        label="Duration (in weeks)"
        labelPlacement="outside"
        value={formData.durationWeeks}
        placeholder="e.g. 4"
        onChange={handleFormChange}
      />

      <ThumbnailUploader
        thumbnail={formData.thumbnail}
        setThumbnail={handleFileChange}
        thumbnailError={thumbnailError}
      />

      {/* Online Purchase Option */}
      <Card className="w-full py-1">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Online Purchase Option</h3>
          <Switch
            size="sm"
            isSelected={enableOnlineDiscount}
            onValueChange={handleOnlineDiscountToggle}
          >
            Enable Discount
          </Switch>
        </CardHeader>
        <CardBody className="grid gap-4">
          <Input
            type="number"
            name="onlinePrice"
            label="Online Price"
            value={formData.onlinePrice}
            placeholder="e.g. 999"
            startContent={
              <IndianRupeeIcon className="text-default-400 h-4 w-4" />
            }
            onChange={handleFormChange}
          />
          {enableOnlineDiscount && (
            <>
              <Input
                type="number"
                name="onlineDiscountPercentage"
                label="Online Discount (%)"
                value={formData.onlineDiscountPercentage}
                placeholder="e.g. 10"
                endContent={
                  <span className="text-default-400 text-small">%</span>
                }
                onChange={handleFormChange}
              />
              <Input
                type="date"
                name="onlineDiscountValidUntil"
                label="Online Discount Valid Until"
                value={formData.onlineDiscountValidUntil}
                startContent={
                  <CalendarIcon className="text-default-400 h-4 w-4" />
                }
                onChange={handleFormChange}
              />
            </>
          )}
        </CardBody>
      </Card>

      {/* Hybrid Purchase Option */}
      <Card className="w-full py-1">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Hybrid (online + offline) Purchase Option
          </h3>
          <Switch
            size="sm"
            isSelected={enableHybridDiscount}
            onValueChange={handleHybridDiscountToggle}
          >
            Enable Discount
          </Switch>
        </CardHeader>
        <CardBody className="grid gap-4">
          <Input
            type="number"
            name="hybridPrice"
            label="Hybrid Price"
            value={formData.hybridPrice}
            placeholder="e.g. 1299"
            startContent={
              <IndianRupeeIcon className="text-default-400 h-4 w-4" />
            }
            onChange={handleFormChange}
          />
          {enableHybridDiscount && (
            <>
              <Input
                type="number"
                name="hybridDiscountPercentage"
                label="Hybrid Discount (%)"
                value={formData.hybridDiscountPercentage}
                placeholder="e.g. 15"
                endContent={
                  <span className="text-default-400 text-small">%</span>
                }
                onChange={handleFormChange}
              />
              <Input
                type="date"
                name="hybridDiscountValidUntil"
                label="Hybrid Discount Valid Until"
                value={formData.hybridDiscountValidUntil}
                startContent={
                  <CalendarIcon className="text-default-400 h-4 w-4" />
                }
                onChange={handleFormChange}
              />
            </>
          )}
        </CardBody>
      </Card>

      {!isChanged && (
        <p className="text-sm text-muted-foreground">No changes detected!</p>
      )}

      <Button
        type="submit"
        color="primary"
        isLoading={isSubmitting}
        isDisabled={isSubmitting || isFetching || !isChanged}
        className="self-end sm:w-32 max-w-52 mt-2 sm:mt-4"
      >
        Save
      </Button>
    </Form>
  );
}
