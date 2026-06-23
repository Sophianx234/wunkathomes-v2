"use client";

import { useState, useActionState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  StarIcon,
  cancelIcon,
} from "@hugeicons/core-free-icons";
import {
  submitReviewAction,
  ReviewActionState,
} from "@/actions/user/review.action";
import { toast } from "sonner";
import { useParams } from "next/navigation";

// ADD THE hasReviewed PROP TO THE INTERFACE
interface ReviewFormProps {
  listingId: string;
  hasReviewed?: boolean;
}

const initialState: ReviewActionState = { success: false, message: "" };

export default function ReviewForm({ listingId, hasReviewed }: ReviewFormProps) {
  const params = useParams();
  const slug = params.slug as string;

  const [state, formAction, isPending] = useActionState(
    submitReviewAction,
    initialState,
  );

  const [isOpen, setIsOpen] = useState(false);

  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setSelectedRating(0);
      setComment("");
      setIsOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  // IF THE USER HAS ALREADY REVIEWED, HIDE THE BUTTON/FORM ENTIRELY
  if (hasReviewed) {
    return null;
  }

  // If the form is closed, show a clean, standard button that matches the page aesthetic
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-8 px-6 py-3.5 border-2 border-black font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-colors rounded"
      >
        Write a Review
      </button>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">Leave a Review</h3>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setSelectedRating(0);
            setComment("");
          }}
          className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="rating" value={selectedRating || ""} />
        <input type="hidden" name="slug" value={slug || ""} />

        {/* Star Rating Selector */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setSelectedRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <HugeiconsIcon
                icon={StarIcon}
                size={28}
                className={`transition-colors ${
                  star <= (hoveredStar || selectedRating)
                    ? "fill-black text-black"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-sm font-medium text-slate-500">
            {selectedRating > 0
              ? `${selectedRating} out of 5`
              : "Select a rating"}
          </span>
        </div>

        {/* Comment Area */}
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this property (optional)..."
          className="w-full p-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white resize-y min-h-[100px]"
          maxLength={1000}
        />

        {/* Submit Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || selectedRating === 0}
            className="px-6 py-3 flex items-center bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="inline-block animate-spin mr-2"
              />
            )}
            {isPending ? "Submitting..." : "Post Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
