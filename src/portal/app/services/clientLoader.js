import { getPrimaryCategories, getVibeCategories, getTravelerTypes } from "../hooks/data";

export async function clientLoader() {
  try {
    const [primaryCategories, vibeCategories, travelerTypes] = await Promise.all([
      getPrimaryCategories(),
      getVibeCategories(),
      getTravelerTypes(),
    ]);
    return { primaryCategories, vibeCategories, travelerTypes };
  } catch (error) {
    console.error("Failed to load categories/vibes/travelers:", error);
    return { primaryCategories: [], vibeCategories: [], travelerTypes: [] };
  }
}
