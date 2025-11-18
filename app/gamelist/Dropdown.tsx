import { useEffect, useState } from "react";

const Dropdown = ({ setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All games");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setFilter(option);
  };

  const options = ["All games", "Completed", "Playing", "Dropped", "Backlog"];

  return (
    <div className="relative mb-12 w-fit lg:mx-auto">
      <button
        className="flex items-center gap-3 px-6 py-3 border border-white/20 rounded-lg bg-grey-dark text-white hover:bg-grey-light hover:border-green-light transition-all duration-300 shadow-lg min-w-[200px] justify-between"
        onClick={toggleDropdown}
      >
        <span className="text-lg font-semibold">{selectedOption}</span>
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-[12] top-full mt-2 w-full bg-grey-dark border border-white/20 rounded-lg shadow-2xl overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              className={`w-full px-6 py-3 text-left text-white hover:bg-grey-light transition-colors ${
                selectedOption === option ? 'bg-grey-light text-green-light' : 'hover:text-green-light'
              }`}
              onClick={() => handleOptionChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;