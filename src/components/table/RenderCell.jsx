import {
  User,
  Chip,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  addToast,
} from "@heroui/react";
import { VerticalDotsIcon } from "../icons/icons";
import { statusColorMap } from "@/constants/users";
import api from "@/utils/axiosInstance";
import { useState } from "react";

export default function RenderCell({ user, columnKey, setUsers }) {
  const cellValue = user[columnKey];
  const [isLoading, setIsLoading] = useState(false);

  // Handle the action of activating or deactivating the user
  const handleStatusChange = async (userId) => {
    try {
      setIsLoading(true);

      // Send request to the backend API to update the user's status
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);

      if (res.status === 200) {
        addToast({
          title: "Success",
          description: res?.data?.message || "User status updated successfully",
          color: "success",
        });

        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isActive: !u.isActive } : u
          )
        );
      }
    } catch (error) {
      console.error("Error changing status:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  switch (columnKey) {
    case "id":
      return (
        <div className="flex items-start gap-2">
          <span className="text-default-500">{user._id}</span>
        </div>
      );

    case "name":
      return (
        <User
          avatarProps={{ radius: "lg", src: user.avatar }}
          description={user.email}
          name={cellValue}
        >
          {user.email}
        </User>
      );

    case "enrollments":
      return (
        <div className="flex flex-wrap items-center gap-2">
          {user.enrolledCourses?.map((title, index) => (
            <span
              key={title}
              className="max-w-[120px] md:max-w-[240px] truncate px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-sm text-text"
            >
              {title}
            </span>
          ))}
        </div>
      );

    case "status":
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[user.isActive ? "active" : "inactive"]}
          size="sm"
          variant="flat"
        >
          {user.isActive ? "Active" : "Inactive"}
        </Chip>
      );

    case "actions":
      return (
        <div className="relative flex justify-center items-center gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                isLoading={isLoading}
              >
                <VerticalDotsIcon className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key={user.isActive ? "deactivate" : "activate"}
                className={
                  user.isActive
                    ? "bg-danger text-white data-[hover=true]:text-white data-[hover=true]:bg-danger-300"
                    : "bg-success text-white data-[hover=true]:text-white data-[hover=true]:bg-success-300"
                }
                onPress={() => handleStatusChange(user._id)}
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );

    default:
      return cellValue;
  }
}
