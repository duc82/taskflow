export const formatDateTime = (time: Date | string): string => {
  const now = new Date();
  const date = new Date(time);

  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "mới đây";
  }

  if (minutes < 60) {
    return `${minutes} phút trước`;
  }

  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  if (days < 7) {
    return `${days} ngày trước`;
  }

  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
