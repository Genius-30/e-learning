"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/utils/axiosInstance";
import { addToast, Button, Form, Input, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        message: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitted) {
      addToast({
        title: "Error",
        description: "Please wait before submitting again.",
        color: "warning",
      });
      return;
    }

    setLoading(true);
    setIsSubmitted(true);

    try {
      await api.post("/contact", formData);

      addToast({
        title: "Success",
        description: "Your message has been sent successfully.",
        color: "success",
      });

      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        message: "",
      });

      //  Reset cooldown after 5 seconds
      setTimeout(() => setIsSubmitted(false), 15000);
    } catch (err) {
      console.error(err);
      addToast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "There was an error sending your message. Please try again.",
        color: "error",
      });
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-10">
        We'd love to hear from you. Fill out the form and we'll get back to you
        soon.
      </p>

      <Form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          isRequired
          errorMessage="Please enter a valid name"
          label="Name"
          labelPlacement="outside"
          name="name"
          placeholder="Your Name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          isDisabled={loading}
        />

        <Input
          isRequired
          errorMessage="Please enter a valid email"
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="you@example.com"
          type="email"
          value={formData.email}
          onChange={handleChange}
          isDisabled={loading}
        />

        <Textarea
          isRequired
          errorMessage="Please enter a message"
          label="Messsge"
          labelPlacement="outside"
          name="message"
          placeholder="Type your message..."
          value={formData.message}
          onChange={handleChange}
          isDisabled={loading}
        />

        <div className="flex gap-2">
          <Button
            color="primary"
            type="submit"
            isDisabled={loading}
            isLoading={loading}
          >
            Submit
          </Button>
          <Button
            type="reset"
            variant="flat"
            isDisabled={loading}
            onReset={() => setFormData({ name: "", email: "", message: "" })}
          >
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
}
