import axios from 'axios';

// Fetch medicines from remote API and filter by given IDs
export const getMedicinesByIds = async (ids = []) => {
  try {
    const response = await axios.get('https://medicine-store-backend-three.vercel.app/medicines');
    const allMeds = response.data;

    // Filter by IDs (convert both to strings for safe comparison)
    const filtered = allMeds.filter(med =>
      ids.map(id => id.toString()).includes(med._id.toString())
    );

    return filtered;
  } catch (err) {
    console.error("Error fetching medicines:", err.message);
    throw new Error('Failed to fetch medicines');
  }
};
