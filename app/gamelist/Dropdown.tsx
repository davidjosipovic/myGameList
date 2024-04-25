import { useEffect, useState } from "react";
import Image from "next/image";

const Dropdown = ({ setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Playing");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false); // Close the dropdown after selecting an option
    setFilter(option); // Update the filter with the selected option
  };

  return (
    <div className="relative mb-12 w-fit lg:object-center lg:mx-auto">
      <div
        className="flex items-center border border-white rounded-xl bg-grey-dark text-white cursor-pointer"
        onClick={toggleDropdown}
      >
        <p className="text-lg px-2 ">{selectedOption}</p>
        <Image alt="Arrow" src="/arrow-down.svg" width={50} height={50} />
      </div>
      {isOpen && (
        <div className="absolute z-[12] top-full mt-1 w-full bg-white rounded-lg shadow-md">
          <div className="">
            
            {/* Additional options */}
            <p
              className="px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionChange("Completed")}
            >
              Completed
            </p>
            <p
              className="px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionChange("Playing")}
            >
              Playing
            </p>
            <p
              className="px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionChange("Dropped")}
            >
              Dropped
            </p>
            <p
              className="px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionChange("Backlog")}
            >
              Backlog
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
