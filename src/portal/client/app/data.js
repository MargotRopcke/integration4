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

// Antwerp Central Station coordinates (reference point for distance filtering)
const ANTWERP_CENTRAL_LAT = 51.2194;
const ANTWERP_CENTRAL_LNG = 4.4215;

/**
 * Haversine distance helper (internal, used before calculateDistance is defined).
 */
function _haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Map the budget label from the form to a numeric threshold.
 * @param {string} budgetLabel - e.g. "€ (≤30)"
 * @returns {number|null} Max price, or null for no limit
 */
function budgetToMax(budgetLabel) {
  if (budgetLabel.startsWith("€€€")) return null; // no upper limit
  if (budgetLabel.startsWith("€€")) return 60;
  return 30; // "€ (≤30)"
}

/**
 * Map the distance label from the form to a km threshold.
 * @param {string} distanceLabel - e.g. "walking (0-2km)"
 * @returns {number} Max km
 */
function distanceToMax(distanceLabel) {
  if (distanceLabel.startsWith("walking")) return 2;
  if (distanceLabel.startsWith("bike")) return 5;
  return 15; // tram
}

/**
 * Fetch locations filtered by the user's form choices.
 * Filters: primary_category_id, vibes (via location_vibes join), price, distance.
 * @param {Object} filters
 * @param {number} filters.categoryId - primary_category_id to match
 * @param {number[]} filters.vibeIds - array of vibe_category_id values (at least one must match)
 * @param {string} filters.budget - budget label, e.g. "€ (≤30)"
 * @param {string} filters.distance - distance label, e.g. "walking (0-2km)"
 * @returns {Promise<Array>} Filtered location objects
 */
export async function getFilteredLocations({ categoryId, vibeIds, budget, distance }) {
  try {
    let query = supabase
      .from("locations")
      .select("*, location_vibes!inner(vibe_category_id)")
      .eq("primary_category_id", categoryId)
      .not("image", "is", null);

    // Filter by vibes if any are selected
    if (vibeIds && vibeIds.length > 0) {
      query = query.in("location_vibes.vibe_category_id", vibeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching filtered locations:", error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    // Client-side filtering for price and distance
    const maxPrice = budgetToMax(budget);
    const maxDist = distanceToMax(distance);

    const filtered = data.filter((loc) => {
      // Price filter
      if (maxPrice !== null && Number(loc.price) > maxPrice) return false;
      // Distance filter
      const dist = _haversineKm(ANTWERP_CENTRAL_LAT, ANTWERP_CENTRAL_LNG, loc.latitude, loc.longitude);
      if (dist > maxDist) return false;
      return true;
    });

    // Deduplicate (a location may appear multiple times if it matches several vibes)
    const seen = new Set();
    const unique = filtered.filter((loc) => {
      if (seen.has(loc.keyID)) return false;
      seen.add(loc.keyID);
      return true;
    });

    return unique;
  } catch (error) {
    console.error("Error fetching filtered locations:", error);
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

/**
 * Fetch primary categories from Supabase (Style / Flavour)
 * @returns {Promise<Array>}
 */
export async function getPrimaryCategories() {
  try {
    const { data, error } = await supabase
      .from("primary_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching primary categories:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching primary categories:", error);
    throw error;
  }
}

/**
 * Fetch vibe categories from Supabase
 * @returns {Promise<Array>}
 */
export async function getVibeCategories() {
  try {
    const { data, error } = await supabase
      .from("vibe_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching vibe categories:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching vibe categories:", error);
    throw error;
  }
}

/**
 * Fetch traveler types from Supabase
 * @returns {Promise<Array>}
 */
export async function getTravelerTypes() {
  try {
    const { data, error } = await supabase
      .from("traveler_types")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching traveler types:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching traveler types:", error);
    throw error;
  }
}