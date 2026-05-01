"use client";

import { useEffect, useMemo, useState } from "react";

type TeacherAvatarProps = {
  imageUrl?: string | null;
  teacherName?: string | null;
  courseTitle?: string | null;
  className?: string;
  onImageErrorChange?: (hasError: boolean) => void;
};

function getTeacherInitial(teacherName?: string | null): string | null {
  const value = teacherName?.trim();
  if (!value) {
    return null;
  }

  return value.charAt(0).toUpperCase();
}

export function TeacherAvatar({ imageUrl, teacherName, courseTitle, className = "", onImageErrorChange }: TeacherAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const normalizedImageUrl = imageUrl?.trim() || "";
  const initial = useMemo(() => getTeacherInitial(teacherName), [teacherName]);

  useEffect(() => {
    setHasImageError(false);
  }, [normalizedImageUrl]);

  useEffect(() => {
    onImageErrorChange?.(hasImageError);
  }, [hasImageError, onImageErrorChange]);

  const showImage = Boolean(normalizedImageUrl) && !hasImageError;
  const avatarClassName = `h-14 w-14 shrink-0 rounded-full border-2 border-white shadow-[0_8px_24px_rgba(88,28,135,0.14)] sm:h-16 sm:w-16 ${className}`.trim();

  if (showImage) {
    return (
      <img
        src={normalizedImageUrl}
        alt={teacherName ? `Foto di ${teacherName}` : `Foto insegnante ${courseTitle || ""}`.trim()}
        loading="lazy"
        onError={() => setHasImageError(true)}
        className={`${avatarClassName} object-cover`}
      />
    );
  }

  return (
    <div
      aria-label={teacherName ? `Avatar insegnante ${teacherName}` : "Avatar insegnante"}
      className={`${avatarClassName} flex items-center justify-center bg-gradient-to-br from-purple-100 via-fuchsia-50 to-purple-100 text-purple-700`}
    >
      {initial ? (
        <span className="text-base font-semibold sm:text-lg">{initial}</span>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7">
          <path
            fill="currentColor"
            d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Zm0 1.5c-4.14 0-7.5 2.68-7.5 6a.75.75 0 0 0 1.5 0c0-2.32 2.7-4.5 6-4.5s6 2.18 6 4.5a.75.75 0 0 0 1.5 0c0-3.32-3.36-6-7.5-6Z"
          />
        </svg>
      )}
    </div>
  );
}
