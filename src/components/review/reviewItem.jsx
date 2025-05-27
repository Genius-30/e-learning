import { FaStar, FaRegStar } from "react-icons/fa";

export default function ReviewItem({ review, currentUserId }) {
  const isOwnReview = review.userId?._id === currentUserId;

  const getStarIcons = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500" />
        )
      );
    }
    return stars;
  };

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff&size=200`;
  };

  return (
    <div className="p-4 border border-card rounded-xl bg-muted/30 flex flex-col gap-2 relative">
      {isOwnReview && (
        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-primary text-white rounded-full">
          Your Review
        </span>
      )}

      <div className="flex items-center gap-3">
        <img
          src={getAvatarUrl(review.userId?.name)}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col gap-[2px]">
          <p className="font-semibold">{review.userId?.name}</p>
          <div className="flex">{getStarIcons(review.rating)}</div>
        </div>
      </div>

      <p className="text-sm italic">{review.comment}</p>
    </div>
  );
}
