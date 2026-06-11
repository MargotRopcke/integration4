/**
 * Fetches all lanes from the API, including their associated cards.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of card objects.
 */

export const fetchLanes = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/lanes?_embed=cards`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching lanes:", error);
    throw error;
  }
};

/**
 * Creates a new lane with the provided data.
 *
 * @param {*} laneData
 * @returns
 */
export const createLane = async (laneData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lanes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(laneData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating lane:", error);
    throw error;
  }
};
