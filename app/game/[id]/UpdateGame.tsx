import React from "react";

export default function UpdateGame({ game, setIsUpdateGameOpen }) {
    return (
        <div className="fixed h-full top-16 left-0 z-10 bg-grey-light w-full  p-4 ">


            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">{game.name}</h2>
                <button
                    onClick={() => setIsUpdateGameOpen(false)}
                    className="text-white text-2xl "
                >
                    X
                </button>
            </div>

            <div className="flex mb-4">
                {/* Dropdown buttons */}
                <select className="mr-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500">
                    {/* Dropdown options */}
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500">
                    {/* Dropdown options */}
                </select>
            </div>
            {/* Review input */}
            <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 mb-4"
                placeholder="Write your review here..."
            ></textarea>
            {/* Buttons */}
            <div className="flex justify-between">
                <button className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">
                    Add to List
                </button>
                <button className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">
                    Delete
                </button>
            </div>

        </div>
    );
}
