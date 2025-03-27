import { useState } from "react";
import Heading from "./Heading";
import useAuth from "../../service/useAuth";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";

const Feedback = () => {
  const { data: auth } = useAuth();
  const user = auth?.user;
  const { acc_id } = useParams();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ["reviews", acc_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select(
          `
          *,
          user_roles(*)
          `
        )
        .eq("acc_id", acc_id)
        .limit(8);
      return data;
    },
  });

  console.log(reviews);

  const { mutateAsync: createFeedbackMutation, isPending } = useMutation({
    mutationFn: async () => {
      if (!message.trim() || rating === "" || rating < 0 || rating > 10) {
        toast.error("Please provide a valid message and rating (0-10).");
        return;
      }

      // Insert review into Supabase
      const { data, error } = await supabase.from("reviews").insert([
        {
          user_id: user?.id,
          acc_id,
          message,
          rating,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      // Clear form after submission
      setMessage("");
      setRating("");

      return data;
    },
    onSuccess: () => {
      toast.success("Create Feedback Successfully");
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteReview = async (reviewId: string) => {
    if (!reviewId) {
      console.error("Review ID is required");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
    } else {
      toast("Review deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    }
  };

  const handleSubmit = async () => {
    await createFeedbackMutation();
  };

  return (
    <div className="w-full">
      <Heading className="text-[#A8BBA3] uppercase" text="Feedback" />
      <div className="space-y-4 mt-4">
        {reviews?.map((review, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{review.user_roles.name}</p>
              <p className="text-gray-600 text-sm">{review.message}</p>
              {review.user_id == user?.id && (
                <Button
                  onClick={() => deleteReview(review.id)}
                  className="text-xs bg-red-600 py-1 mt-3"
                >
                  Delete
                </Button>
              )}
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
          disabled={acc_id == user?.id || isPending}
          onClick={handleSubmit}
        >
          POST REVIEW
        </button>
      </div>
    </div>
  );
};

export default Feedback;
