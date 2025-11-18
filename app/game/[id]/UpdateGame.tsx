import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DeleteGameButton from "@/components/DeleteGameButton";

export default function UpdateGame({ game, setIsUpdateGameOpen, userId }) {
    const { data: session } = useSession();
    const [isAddingToList, setIsAddingToList] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("Playing");
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [review, setReview] = useState("");
    const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (session && game) {
            checkGameInDatabase();
        }
    }, [session, game]);

    const checkGameInDatabase = () => {
        fetch(`/api/gamelist/${session.user?.name}/${game.id}`, { method: "GET" })
            .then((response) => {
                response.json().then((data) => {
                    if (data.status === 404) {
                        setGameExistsInDatabase(false);
                    } else {
                        setSelectedRating(data.rating);
                        setReview(data.review);
                        setSelectedStatus(data.status);
                        setGameExistsInDatabase(true);
                    }
                });
            })
            .catch((error) => {
                console.error("Error checking game in the database:", error);
                setGameExistsInDatabase(false);
            });
    };

    const handleRatingChange = (your_rating: number) => {
        setSelectedRating(your_rating);
    };

    const handleAddToListClick = () => {
        setIsAddingToList(true);

        const requestData = {
            gameId: game.id,
            rating: selectedRating,
            review: review,
            status: selectedStatus,
        };

        const method = gameExistsInDatabase ? "PUT" : "POST";

        fetch(`/api/gamelist/${session.user?.name}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Game added/updated successfully");
                } else {
                    throw new Error(`Error adding/updating game: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error(error.message);
            })
            .finally(() => {
                setIsAddingToList(false);
                setIsUpdateGameOpen(false);
            });
    };

    return (
        <div className="fixed inset-x-0 top-20 mx-auto w-[95%] sm:w-[600px] lg:w-[700px] max-h-[85vh] overflow-y-auto z-50 bg-grey-dark border border-green-light/30 rounded-lg shadow-2xl">
            <div className="sticky top-0 bg-grey-dark border-b border-white/10 p-6 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{game.name}</h2>
                    <button 
                        onClick={() => setIsUpdateGameOpen(false)} 
                        className="text-white/60 hover:text-green-light transition-colors duration-200 p-2 hover:bg-white/5 rounded-full"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Status and Rating Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-3 bg-grey-light border border-white/20 text-white rounded-lg focus:outline-none focus:border-green-light transition-colors duration-200"
                        >
                            <option value="Playing">Playing</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Backlog">Backlog</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Rating</label>
                        <select
                            value={selectedRating}
                            onChange={(e) => handleRatingChange(parseInt(e.target.value, 10))}
                            className="w-full px-4 py-3 bg-grey-light border border-white/20 text-white rounded-lg focus:outline-none focus:border-green-light transition-colors duration-200"
                        >
                            <option value="" hidden>Select rating</option>
                            {[...Array(10)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1} / 10
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Review Textarea */}
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2" htmlFor="review">
                        Review
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full px-4 py-3 h-48 bg-grey-light border border-white/20 text-white rounded-lg focus:outline-none focus:border-green-light transition-colors duration-200 resize-none"
                        placeholder="Share your thoughts about this game..."
                        id="review"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                    <button
                        disabled={isDeleting || isAddingToList}
                        onClick={handleAddToListClick}
                        className={`w-full py-3 px-6 bg-green-light text-grey-dark font-bold text-lg rounded-lg transition-all duration-200 ${
                            isDeleting || isAddingToList 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-green-dark hover:shadow-lg hover:shadow-green-light/30 active:scale-95'
                        }`}
                    >
                        {isAddingToList ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {gameExistsInDatabase ? "Updating..." : "Adding..."}
                            </span>
                        ) : (
                            gameExistsInDatabase ? "Update Game" : "Add to List"
                        )}
                    </button>
                    
                    {gameExistsInDatabase && (
                        <button
                            disabled={isDeleting || isAddingToList}
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    const response = await fetch(`/api/gamelist/${userId}/delete/${game.id}`, {
                                        method: 'DELETE',
                                    });
                                    if (response.ok) {
                                        setIsUpdateGameOpen(false);
                                    }
                                } catch (error) {
                                    console.error('Error deleting the game:', error);
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            className={`w-full py-3 px-6 bg-grey-dark border-2 border-red-500 text-red-500 font-bold text-lg rounded-lg transition-all duration-200 ${
                                isDeleting || isAddingToList
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 active:scale-95'
                            }`}
                        >
                            {isDeleting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Removing...
                                </span>
                            ) : (
                                "Remove from List"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}