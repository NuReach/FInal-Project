import { useState } from "react";
import Heading from "./Heading";

type Review = {
  name: string;
  message: string;
  rating: number;
};

const Feedback = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      name: "Oliver Liam",
      message:
        "Incididunt ad officia sit duis fugiat irure culpa ut dolor ea laboris enim tempor officia quis et incididunt sunt consequat veniam aliquip eiusmod adipisicing fugiat",
      rating: 7,
    },
  ]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | "">("");

  const handleSubmit = () => {
    if (message.trim() && rating !== "" && rating >= 0 && rating <= 10) {
      setReviews([
        ...reviews,
        { name: "You", message, rating: Number(rating) },
      ]);
      setMessage("");
      setRating("");
    }
  };

  return (
    <div className="w-full">
      <Heading className="text-[#A8BBA3] uppercase" text="Feedback" />
      <div className="space-y-4 mt-4">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{review.name}</p>
              <p className="text-gray-600 text-sm">{review.message}</p>
            </div>
            <p className="text-gray-400 text-lg">{review.rating}/10</p>
          </div>
        ))}
      </div>
      <div className="border rounded-lg p-4 mt-4">
        <textarea
          className="w-full border p-2 rounded-md"
          placeholder="Write your review..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="number"
          min="0"
          max="10"
          className="w-full mt-2 border p-2 rounded-md"
          placeholder="Rating (0-10)"
          value={rating}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 10) {
              setRating(value);
            }
          }}
        />
        <button
          className="mt-2 bg-pink-400 text-white py-2 px-4 rounded-lg w-full"
          onClick={handleSubmit}
        >
          POST REVIEW
        </button>
      </div>
    </div>
  );
};

export default Feedback;
