import { useEffect, useState } from "react";

const Dropdown = ({ setId, filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [previousOption, setPreviousOption] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (option) => {
    setPreviousOption(selectedOption);
    setSelectedOption(option);
    setIsOpen(false);

    // Set filter based on the selected option
    if (option === "Top 100 Games") {
      setId("top");
    } else if (option === "Most Popular Games") {
      setId("popular");
    }
  };

  useEffect(() => {
    if (filter === "popular") {
      setSelectedOption("Most Popular Games");
      setPreviousOption("Top 100 Games");
    } else if (filter === "top") {
      setSelectedOption("Top 100 Games");
      setPreviousOption("Most Popular Games");
    }
  }, [filter]);

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-3 px-6 py-3 border border-white/20 rounded-lg bg-grey-dark text-white hover:bg-grey-light hover:border-green-light transition-all duration-300 shadow-lg min-w-[250px] justify-between"
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
        <div className="absolute z-10 top-full mt-2 w-full bg-grey-dark border border-white/20 rounded-lg shadow-2xl overflow-hidden">
          <button
            className="w-full px-6 py-3 text-left text-white hover:bg-grey-light hover:text-green-light transition-colors"
            onClick={() => handleOptionChange(previousOption)}
          >
            {previousOption}
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
