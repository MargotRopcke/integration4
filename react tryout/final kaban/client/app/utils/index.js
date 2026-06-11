export const priorities = [
  { id: "high", name: "High", color: "#e74c3c" },
  { id: "medium", name: "Medium", color: "#f39c12" },
  { id: "low", name: "Low", color: "#27ae60" },
  { id: "none", name: "None", color: "#cccccc" },
];

export const getPriority = (priority) =>
  priorities.find((p) => p.id === priority);
