import Course from "@/models/course.model";

export const getDiscountedPrice = async function (courseId, type) {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const option = course.purchaseOptions?.[type];
  if (!option) throw new Error(`Invalid purchase type: ${type}`);

  const now = new Date();
  const discount = option.discount;

  const isDiscountValid =
    discount?.percentage &&
    (!discount?.validUntil || discount.validUntil > now);

  // If discount is expired, remove it and save the course
  if (discount && !isDiscountValid) {
    course.purchaseOptions[type].discount = {
      percentage: 0,
      validUntil: undefined,
    };
    await course.save();
    return option.price; // Return original price
  }

  // If valid discount, calculate and return final price
  if (isDiscountValid) {
    const finalPrice =
      option.price - (option.price * discount.percentage) / 100;
    return Math.round(finalPrice);
  }

  return option.price; // No discount, return original price
};
