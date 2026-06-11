/**
 * Fetches all cards from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of card objects.
 */

export const fetchCards = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cards`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

/**
 * Fetches a specific card by its ID from the API.
 *
 * @param {*} cardId
 * @returns
 */
export const fetchCard = async (cardId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/cards/${cardId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching card:", error);
    throw error;
  }
};

/**
 * Updates a specific card by its ID with the provided data.
 *
 * @param {*} cardId
 * @param {*} cardData
 * @returns
 */
export const updateCard = async (cardId, cardData) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/cards/${cardId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

/**
 * Updates the lane of a specific card by its ID.
 *
 * @param {*} cardId
 * @param {*} laneId
 * @returns
 */
export const updateCardLane = async (cardId, laneId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/cards/${cardId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ laneId: parseInt(laneId) }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating card lane:", error);
    throw error;
  }
};

/**
 * Creates a new card with the provided data.
 *
 * @param {*} cardData
 * @returns
 */
export const createCard = async (cardData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...cardData, laneId: parseInt(cardData.laneId) }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
};
