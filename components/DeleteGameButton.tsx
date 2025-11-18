// DeleteGameButton.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface DeleteGameButtonProps {
  gameId: number;
  userId: string;
  onGameDeleted: any;
  text:boolean;
  setIsDeletingGame:any;
  isAddingToList:any;
}

const DeleteGameButton: React.FC<DeleteGameButtonProps> = ({ gameId, userId,isAddingToList, onGameDeleted,text, setIsDeletingGame }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGame = async () => {
    setIsDeletingGame(true)
    setIsDeleting(true);
    

    try {
      const response = await fetch(`/api/gamelist/${userId}/delete/${gameId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
console.log("OK")
      } else {
        console.log('Error deleting the game.');
      }
    } catch (error) {
      console.error('Error deleting the game:', error);
    }
    onGameDeleted();
    setIsDeletingGame(false)
    setIsDeleting(false);
  };

  return (<>
  {!text? <button
      className={`rounded-lg shadow-lg hover:shadow-xl font-bold p-2 bg-red-500 hover:bg-red-600 transition-all duration-200 active:scale-95 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleDeleteGame}
      disabled={isDeleting}
    >
      <Image width={30} height={30} alt='Delete Button' src={isDeleting?"/trash-deleting.svg":"/trash-bin.svg"}/>
    </button>:<button
      className={`px-6 py-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 active:scale-95 ${isAddingToList ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleDeleteGame}
      disabled={isAddingToList}
    >
      {isDeleting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Deleting...
        </span>
      ) : "Delete"}
    </button>}

  </>
    
    
  );
};

export default DeleteGameButton;
