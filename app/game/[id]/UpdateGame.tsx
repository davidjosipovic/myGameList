import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DeleteGameButton from "@/components/DeleteGameButton";

export default function UpdateGame({ game, setIsUpdateGameOpen, userId }) {
    const { data: session } = useSession();
    const [isAddingToList, setIsAddingToList] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("Playing"); // State for selected status
    const [selectedRating, setSelectedRating] = useState<number>(0); // State for selected rating with initial value
    const [review, setReview] = useState("");
    const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false);
    const[isDeleting,setIsDeleting]=useState(false)

    useEffect(() => {
        // Fetch game data when the component mounts
        if (session && game) {
            checkGameInDatabase();
        }
    }, [session, game]); // Fetch data whenever the 'session' or 'game' changes

    const checkGameInDatabase = () => {
        fetch(`/api/gamelist/${session.user?.name}/${game.id}`, { method: "GET" })
            .then((response) => {
                response.json().then((data) => {
                    if (data.status === 404) {
                        setGameExistsInDatabase(false); // Set the state when the specific status message is received
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
                setGameExistsInDatabase(false); // Handle the error by setting the state accordingly
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
        <div className="fixed h-full w-full sm:w-2/3 lg:w-2/4 xl:w-2/5 top-12 left-0 right-0 md:px-12 mx-auto z-10 bg-grey-light sm:border p-4 lg:py-4 lg:px-12 sm:top-20 sm:h-fit ">
            <div className="flex justify-between items-center mt-2 mb-8">
                <h2 className="text-2xl font-bold text-white">{game.name}</h2>
                <button onClick={() => setIsUpdateGameOpen(false)} className="text-white text-2xl">
                    X
                </button>
            </div>

            <div className="flex mb-4 gap-8">
                {/* Dropdown buttons */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full py-1 border bg-grey-dark text-white rounded-md focus:outline-none focus:border-indigo-500"
                >
                    <option value="Playing">Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Backlog">Backlog</option>
                </select>
                <select
                    value={selectedRating}
                    onChange={(e) => handleRatingChange(parseInt(e.target.value, 10))}
                    className="w-full py-1 border bg-grey-dark text-white rounded-md focus:outline-none focus:border-indigo-500"
                >
                    <option value="" hidden>Rating</option>
                    {[...Array(10)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                            {index + 1}
                        </option>
                    ))}
                </select>
            </div>
            {/* Review input */}
            <label className="text-white" htmlFor="review">
                Review
            </label>
            <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-4 py-1 h-96 border bg-grey-dark text-white rounded-md focus:outline-none focus:border-indigo-500 mb-4"
                placeholder=""
                id="review"
            ></textarea>
            {/* Buttons */}
            <div className="flex justify-between gap-8 my-8">
                <button disabled={isDeleting}
                    onClick={handleAddToListClick}
                    className={`px-6 py-2 w-full bg-green-light text-grey-dark font-bold rounded-md hover:bg-green-dark focus:outline-none ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isAddingToList ? "Adding..." : gameExistsInDatabase ? "Update" : "Add to List"}
                </button>
                <DeleteGameButton  gameId={game.id} userId={userId} isAddingToList={isAddingToList}  onGameDeleted={()=>setIsUpdateGameOpen(false)} text={true} setIsDeletingGame={setIsDeleting} />
            </div>
        </div>
    );
}
