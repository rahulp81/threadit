import { formatDistanceToNow } from 'date-fns';

// Function to format the repost time
const formatRepostedTime = (repostedAt) => {
  if (!repostedAt) return 'Unknown time'; // Handle null or undefined repostedAt

  const formattedTime = formatDistanceToNow(new Date(repostedAt), { addSuffix: true });
  return formattedTime;
};

export default formatRepostedTime