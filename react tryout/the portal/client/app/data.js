import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/**
 * Fetch all locations where image is not null, limited to 6 results.
 * @returns {Promise<Array>} Array of location objects
 */
export async function getLocations() {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .not("image", "is", null)
      .limit(6)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

/**
 * Fetch a single location by its id.
 * @param {string|number} id - The location ID
 * @returns {Promise<Object|null>} The location object or null
 */
export async function getLocation(id) {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching location:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw error;
  }
}

/**
 * Calculate distance between two points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display.
 * @param {number} distanceKm - Distance in km
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
