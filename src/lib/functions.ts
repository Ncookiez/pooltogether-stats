
// Imports:
import snapshot from '$lib/data/snapshot.json';

/* ====================================================================================================================================================== */

// Function to get time of last data update:
export const getTimestamp = () => {
  let date = new Date(snapshot[0].timestamp * 1000);
  return date.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
}