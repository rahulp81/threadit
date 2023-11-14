import { formatDistanceToNow } from "date-fns";
// Function to format the repost time
const formatRepostedTime = (repostedAt) => {
  if (!repostedAt) return "Unknown time"; // Handle null or undefined repostedAt

  const now = new Date();
  const repostedTime = new Date(repostedAt);
  const timeDifference = (now - repostedTime) / 1000; // Get the time difference in seconds

  if (timeDifference < 60) {
    return `${Math.floor(timeDifference)}s`; // Seconds
  } else if (timeDifference < 3600) {
    return `${Math.floor(timeDifference / 60)}m`; // Minutes
  } else if (timeDifference < 86400) {
    return `${Math.floor(timeDifference / 3600)}h`; // Hours
  } else {
    return `${Math.floor(timeDifference / 86400)}d`; // Days
  }
};

// Function to format the repost time
export const formatTimeAgo = (repostedAt) => {
  const formattedTime = formatDistanceToNow(new Date(repostedAt), {
    addSuffix: true,
  });
  return formattedTime;
};

export default formatRepostedTime;
