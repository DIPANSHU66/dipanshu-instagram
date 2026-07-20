import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Parses a text string and converts:
 * - @username => clickable blue link to /profile search
 * - #hashtag  => styled indigo hashtag badge
 */
const RichText = ({ text }) => {
  const navigate = useNavigate();

  if (!text) return null;

  // Split on @mentions and #hashtags, keeping the delimiters
  const tokens = text.split(/([@#][a-zA-Z0-9_]+)/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("@")) {
          const username = token.slice(1);
          return (
            <span
              key={i}
              onClick={() => navigate(`/explore?mention=${username}`)}
              className="text-blue-500 font-semibold cursor-pointer hover:underline hover:text-blue-600 transition-colors"
            >
              {token}
            </span>
          );
        }
        if (token.startsWith("#")) {
          return (
            <span
              key={i}
              onClick={() => navigate(`/explore?tag=${token.slice(1)}`)}
              className="text-indigo-500 font-semibold cursor-pointer hover:text-indigo-700 transition-colors"
            >
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
};

export default RichText;
