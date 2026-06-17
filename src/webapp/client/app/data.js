// app/data.js

import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (shared) ────────────────────────────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// ─── Shared: Locations ───────────────────────────────────────────────────────

/**
 * Fetch all locations where image is not null, limited to 6 results.
 */
export async function getLocations() {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .not("image", "is", null)
      .limit(6)
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

/**
 * Fetch a single location by its id.
 */
export async function getLocation(id) {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw error;
  }
}

// ─── Shared: Distance helpers ─────────────────────────────────────────────────

const ANTWERP_CENTRAL_LAT = 51.2194;
const ANTWERP_CENTRAL_LNG = 4.4215;

/**
 * Calculate distance between two points using the Haversine formula.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
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
 * Format distance for display.
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

// ─── Portal: Categories & vibes ──────────────────────────────────────────────

/**
 * Fetch primary categories (Style / Flavour).
 */
export async function getPrimaryCategories() {
  try {
    const { data, error } = await supabase
      .from("primary_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching primary categories:", error);
    throw error;
  }
}

/**
 * Fetch vibe categories.
 */
export async function getVibeCategories() {
  try {
    const { data, error } = await supabase
      .from("vibe_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vibe categories:", error);
    throw error;
  }
}

/**
 * Fetch traveler types.
 */
export async function getTravelerTypes() {
  try {
    const { data, error } = await supabase
      .from("traveler_types")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching traveler types:", error);
    throw error;
  }
}

// ─── Portal: Filtered locations ───────────────────────────────────────────────

function budgetToMax(budgetLabel) {
  if (budgetLabel.startsWith("€€€")) return null;
  if (budgetLabel.startsWith("€€")) return 60;
  return 30;
}

function distanceToMax(distanceLabel) {
  if (distanceLabel.startsWith("walking")) return 2;
  if (distanceLabel.startsWith("bike")) return 5;
  return 15;
}

/**
 * Fetch locations filtered by the user's portal form choices.
 */
export async function getFilteredLocations({ categoryId, vibeIds, budget, distance }) {
  try {
    let query = supabase
      .from("locations")
      .select("*, location_vibes!inner(vibe_category_id)")
      .not("image", "is", null);

    // Safely check categoryId before adding the filter
    if (categoryId !== undefined && categoryId !== null) {
      query = query.eq("primary_category_id", categoryId);
    }

    if (vibeIds && vibeIds.length > 0) {
      query = query.in("location_vibes.vibe_category_id", vibeIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return [];

    const maxPrice = budgetToMax(budget);
    const maxDist = distanceToMax(distance);

    const filtered = data.filter((loc) => {
      if (maxPrice !== null && Number(loc.price) > maxPrice) return false;
      const dist = calculateDistance(ANTWERP_CENTRAL_LAT, ANTWERP_CENTRAL_LNG, loc.latitude, loc.longitude);
      if (dist > maxDist) return false;
      return true;
    });

    // Deduplicate by keyID (location may appear multiple times if it matches several vibes)
    const seen = new Set();
    return filtered.filter((loc) => {
      if (seen.has(loc.keyID)) return false;
      seen.add(loc.keyID);
      return true;
    });
  } catch (error) {
    console.error("Error fetching filtered locations:", error);
    throw error;
  }
}

// ─── Portal: Session photos ───────────────────────────────────────────────────

/**
 * Save reaction photos captured during the swipe session to sessions_photos.
 * Each photo: { dataUrl (base64 jpeg string), locationId (uuid) }
 */
export async function saveSessionPhotos(userId, photos) {
  if (!photos || photos.length === 0) return;

  const rows = photos
    .filter((p) => p.locationId)
    .map((p) => ({
      user_id: userId,
      photo: p.dataUrl,
      location_id: p.locationId,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("sessions_photos").insert(rows);
  if (error) throw error;
}

// ─── Portal: Sessions ─────────────────────────────────────────────────────────

/**
 * Save a portal session and return the user_id for QR generation.
 */
export async function saveSession({ userId, photoName, primaryCategoryId, travelerTypeId }) {
  const { error } = await supabase
    .from("sessions")
    .upsert({
      user_id: userId,
      photo_name: photoName,
      primary_category_id: primaryCategoryId,
      traveler_type_id: travelerTypeId,
    }, { onConflict: "user_id" });

  if (error) throw error;
  return userId;
}

// ─── Webapp: Session → locations ──────────────────────────────────────────────

/**
 * Fetch a session and its matching locations by user_id.
 * Called by the webapp map route after scanning the QR code.
 */
export async function getSessionLocations(userId) {
  // 1. Fetch the session details, explicit including the raw primary_category_id column
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select(`
      user_id,
      photo_name,
      primary_category_id,
      primary_category:primary_categories ( id, name ),
      traveler_type:traveler_types ( id, name )
    `)
    .eq("user_id", userId)
    .single();

  if (sessionError) throw sessionError;

  // 2. Prepare the locations query safely
  let locationsQuery = supabase
    .from("locations")
    .select(`
      keyID, name, address, latitude, longitude,
      quote, price, image,
      location_vibes ( vibe_categories ( id, name ) )
    `)
    .not("image", "is", null);

  // 3. Prevent the 400 Bad Request error by ensuring the ID is valid before adding the filter
  if (session && session.primary_category_id !== undefined && session.primary_category_id !== null) {
    locationsQuery = locationsQuery.eq("primary_category_id", session.primary_category_id);
  }

  // 4. Fetch your location data and session photos side-by-side
  const [
    { data: locations, error: locError },
    { data: sessionPhotos },
  ] = await Promise.all([
    locationsQuery,
    supabase
      .from("sessions_photos")
      .select("photo, location_id")
      .eq("user_id", userId)
      .order("id", { ascending: true }),
  ]);

  if (locError) throw locError;

  return {
    session,
    locations: locations || [],
    sessionPhotos: sessionPhotos || [],
  };
}