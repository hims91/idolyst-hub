import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }
  
  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) {
    return `${weeksAgo} ${weeksAgo === 1 ? 'week' : 'weeks'} ago`;
  }
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
  }
  
  const yearsAgo = Math.floor(daysAgo / 365);
  return `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`;
}
