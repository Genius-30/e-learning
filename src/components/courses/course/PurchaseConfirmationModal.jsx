"use client";

import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import api from "@/utils/axiosInstance";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
} from "@heroui/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function PurchaseConfirmationModal({
  isOpen,
  onOpenChange,
  courseData,
  selectedPurchaseType,
  setSelectedPurchaseType,
  isPurchasing,
  setIsPurchasing,
}) {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const { price } = courseData;
  const originalPrice = price[selectedPurchaseType].original;
  const finalPrice = price[selectedPurchaseType].finalPrice;
  const discountPercentage = price[selectedPurchaseType].discountPercentage;
  const discountValidUntil = dayjs(
    price[selectedPurchaseType].validUntil
  ).format("MMMM D, YYYY");

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const res = await api.post(
        "/user/payments/create-order",
        {
          courseId: courseData._id,
          purchaseType: selectedPurchaseType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.status !== 200 || !res.data?.orderId) {
        addToast({
          title: "Error",
          description: "Failed to create payment order",
          color: "danger",
        });
      }

      const { orderId, amount } = res.data;

      // Load Razorpay Script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        return addToast({
          title: "Error",
          description: "Razorpay SDK failed to load",
          color: "danger",
        });
      }

      // Launch Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Genius Learning",
        image: "/logo.jpg",
        description: `Purchase ${selectedPurchaseType} access to ${courseData.title}`,
        order_id: orderId,

        handler: async function (response) {
          addToast({
            title: "Payment Successful",
            description:
              "Your payment was successfully processed. We are now verifying your payment. Please check your email shortly to start your course.",
            color: "success",
            timeout: 10000,
          });

          router.push(`/courses/${courseData._id}`);
        },

        modal: {
          ondismiss: () => {
            addToast({
              title: "Payment Cancelled",
              description: "You cancelled the payment",
              color: "warning",
            });
          },
        },

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        notes: {
          courseId: courseData._id,
          purchaseType: selectedPurchaseType,
        },
        theme: {
          color: "#9f0712",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      addToast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        color: "danger",
      });
    } finally {
      onOpenChange(false);
      setIsPurchasing(false);
      setSelectedPurchaseType(null);
    }
  };

  const handleClose = () => {
    setSelectedPurchaseType(null);
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
      placement="center"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirm Purchase
            </ModalHeader>
            <ModalBody>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Type:</strong> {selectedPurchaseType.capitalize}
                </p>

                <p className="flex items-center gap-2">
                  <strong>Original Price:</strong>
                  <span>₹{originalPrice}</span>
                </p>

                <p className="flex items-center gap-2">
                  <strong>Discount:</strong>
                  <span>{discountPercentage}% Off</span>
                  <span className="text-destructive font-medium">
                    (-₹{Math.round((originalPrice * discountPercentage) / 100)})
                  </span>
                </p>

                <hr className="my-2 border-muted" />

                <p className="text-base">
                  <strong>Final Price:</strong>{" "}
                  <span className="text-lg text-foreground font-semibold">
                    ₹{finalPrice}
                  </span>
                </p>

                <p>
                  <strong>Discount Valid Until:</strong> {discountValidUntil}
                </p>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                isDisabled={isPurchasing}
                onPress={handleClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handlePurchase}
                isDisabled={isPurchasing}
                isLoading={isPurchasing}
              >
                Proceed to Pay
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
