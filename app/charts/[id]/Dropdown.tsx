import { useEffect, useState } from "react";
import Image from "next/image";

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
    setIsOpen(false); // Close the dropdown after selecting an option

    // Set filter based on the selected option
    if (selectedOption === "Top 100 Games") {
      setId("popular");
    } else if (selectedOption === "Most Popular Games") {
      setId("top");
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
    <div className="relative mb-12 w-fit lg:object-center lg:mx-auto">
      <div
        className="flex items-center border border-white rounded-xl bg-grey-dark text-white cursor-pointer"
        onClick={toggleDropdown}
      >
        <p className="text-lg px-2 ">{selectedOption}</p>
        <Image alt="Arrow" src="/arrow-down.svg" width={50} height={50} />
      </div>
      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white rounded-lg shadow-md">
          <div className="">
            <p
              className="px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionChange(previousOption)}
            >
              {previousOption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
