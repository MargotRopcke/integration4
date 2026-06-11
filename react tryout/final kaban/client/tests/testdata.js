export const testdata = {
  lanes: [
    {
      id: 1,
      title: "To Do",
    },
    {
      id: 2,
      title: "In Progress",
    },
  ],
  cards: [
    {
      id: 1,
      laneId: 1,
      title: "Setup API",
      description: "Create a RESTful API using Express.js and MongoDB",
      priority: "low",
    },
    {
      id: 2,
      laneId: 1,
      title: "Implement Authentication",
      description: "Add user authentication using JWT and bcrypt",
      priority: "high",
    },
    {
      id: 3,
      laneId: 2,
      title: "Fix Bug in UI",
      description: "Resolve the issue with the login button not working",
      priority: "high",
    },
  ],
};

export const newLane = {
  title: "New lane",
  id: 888,
};

export const newCard = {
  id: 999,
  title: "New card",
  description: "This is a new card",
  laneId: 1,
  priority: "low",
};
