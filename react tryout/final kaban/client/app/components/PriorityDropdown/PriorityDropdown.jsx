import { useState, useRef, useEffect } from "react";
import "./PriorityDropdown.css";
import { getPriority, priorities } from "../../utils";

const PriorityDropdown = ({ defaultPriority, name = "priority" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedPriority, setSelectedPriority] = useState(defaultPriority);

  const handlePriorityChange = (newPriorityId) => {
    setSelectedPriority(newPriorityId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="priority-dropdown" ref={dropdownRef}>
      {/* Hidden native select for form functionality */}
      <select
        value={selectedPriority}
        onChange={(e) => handlePriorityChange(e.target.value)}
        className="priority-dropdown__native-select"
        name={name}
        title={name}
      >
        {priorities.map((priority) => (
          <option key={priority.id} value={priority.id}>
            {priority.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="priority-dropdown__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="priority-dropdown-button"
      >
        <div className="priority-dropdown__display">
          <div
            className="priority-dropdown__dot"
            style={{ backgroundColor: getPriority(selectedPriority).color }}
          ></div>
          <span>{getPriority(selectedPriority).name}</span>
        </div>
        <span
          className={`priority-dropdown__arrow ${
            isOpen ? "priority-dropdown__arrow--rotate" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Custom dropdown menu */}
      {isOpen && (
        <ul
          className={`priority-dropdown__menu ${
            isOpen ? "priority-dropdown__menu--open" : ""
          }`}
          role="listbox"
        >
          {priorities.map((priority) => (
            <li
              key={priority.id}
              className={`priority-dropdown__option ${
                priority.id === selectedPriority
                  ? "priority-dropdown__option--selected"
                  : ""
              }`}
              onClick={() => handlePriorityChange(priority.id)}
              role="option"
              aria-selected={priority.id === selectedPriority}
            >
              <div
                className="priority-dropdown__dot"
                style={{ backgroundColor: priority.color }}
              ></div>
              <span>{priority.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PriorityDropdown;
