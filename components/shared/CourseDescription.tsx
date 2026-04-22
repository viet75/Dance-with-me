"use client";

import { useState } from "react";

export function CourseDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div>
      <p
        className={`text-sm text-gray-600 leading-7 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>

      {text.length > 120 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-purple-600 hover:underline"
        >
          {expanded ? "Mostra meno" : "Mostra di più"}
        </button>
      )}
    </div>
  );
}
