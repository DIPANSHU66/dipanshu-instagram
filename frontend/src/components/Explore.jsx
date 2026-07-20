import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Heart, MessageCircle, Compass, Grid, Hash, AtSign, X } from "lucide-react";
import { setselectedPost } from "@/redux/postSlice";
import CommentDialog from "./CommentDialog";
import { useSearchParams, useNavigate } from "react-router-dom";

const Explore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts } = useSelector((store) => store.post);
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const activeTag = searchParams.get("tag");
  const activeMention = searchParams.get("mention");

  // Filter posts by tag or mention if a filter is active
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (activeTag) {
      return posts.filter((p) =>
        p.caption && p.caption.toLowerCase().includes(`#${activeTag.toLowerCase()}`)
      );
    }
    if (activeMention) {
      return posts.filter((p) =>
        p.caption && p.caption.toLowerCase().includes(`@${activeMention.toLowerCase()}`)
      );
    }
    return posts;
  }, [posts, activeTag, activeMention]);

  const handlePostClick = (post) => {
    dispatch(setselectedPost(post));
    setOpen(true);
  };

  const clearFilter = () => navigate("/explore");

  return (
    <div className="max-w-4xl mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-5 mb-6">
        <Compass className="w-7 h-7 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Explore Trending
          </h1>
          <p className="text-sm text-zinc-500">
            Discover popular posts and trending creators across the community
          </p>
        </div>
      </div>

      {/* Active filter badge */}
      {(activeTag || activeMention) && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-zinc-500">Filtering by:</span>
          <span className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
            {activeTag ? (
              <><Hash className="w-3.5 h-3.5" />{activeTag}</>
            ) : (
              <><AtSign className="w-3.5 h-3.5" />{activeMention}</>
            )}
          </span>
          <button
            onClick={clearFilter}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      )}

      {/* Grid Layout */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => handlePostClick(post)}
              className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border border-zinc-150 dark:border-zinc-800 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={post.image}
                alt={post.caption || "Explore post"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-white font-semibold text-sm md:text-base">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white font-semibold text-sm md:text-base">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Grid className="w-10 h-10 text-zinc-300 mb-3" />
          <span className="text-sm font-semibold text-zinc-500">
            {activeTag
              ? `No posts found with #${activeTag}`
              : activeMention
              ? `No posts found mentioning @${activeMention}`
              : "No posts available in the explore feed yet"}
          </span>
        </div>
      )}

      {/* Shared comment dialog */}
      <CommentDialog open={open} setopen={setOpen} />
    </div>
  );
};

export default Explore;

