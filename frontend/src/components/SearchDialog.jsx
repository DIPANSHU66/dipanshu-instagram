import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Loader2, Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchDialog = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/search?query=${query}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setResults(res.data.users);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    }, 350); // 350ms debounce window

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset query on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleUserClick = (userId) => {
    setOpen(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            Search Profiles
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by username or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 py-5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
            {loading && (
              <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-indigo-500" />
            )}
          </div>

          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
            {results.length > 0 ? (
              results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-zinc-100 dark:border-zinc-800">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="font-bold text-zinc-600 dark:text-zinc-300">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user.username}
                      </span>
                      <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                        {user.bio || "No bio description"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              ))
            ) : query.trim() && !loading ? (
              <div className="text-center py-8 text-sm text-zinc-400">
                No profiles match "{query}"
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-400 italic">
                Type above to discover new profiles...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
