// DeleteGameButton.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface DeleteGameButtonProps {
  gameId: number;
  userId: string;
  onGameDeleted: any;
  text:boolean;
}

const DeleteGameButton: React.FC<DeleteGameButtonProps> = ({ gameId, userId, onGameDeleted,text }) => {
  const [isDeleting, setDeleting] = useState(false);

  const handleDeleteGame = async () => {
    setDeleting(true);
    

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
    setDeleting(false);
  };

  return (<>
  {!text? <button
      className={`rounded-lg text-lg shadow-xl font-bold px-2 bg-red m-1 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleDeleteGame}
      disabled={isDeleting}
    >
      <Image width={30} height={30} alt='Delete Button' src={isDeleting?"/trash-deleting.svg":"/trash-bin.svg"}/>
    </button>:<button
      className={`px-6 py-2 w-full bg-red hover:bg-opacity-60 text-grey-dark font-bold  rounded-md  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleDeleteGame}
      disabled={isDeleting}
    >
      Delete
    </button>}

  </>
    
    
  );
};

export default DeleteGameButton;
