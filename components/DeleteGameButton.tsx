// DeleteGameButton.tsx
import React, { useState } from 'react';

interface DeleteGameButtonProps {
  gameId: number;
  userId: string;
  onGameDeleted: () => void;
}

const DeleteGameButton: React.FC<DeleteGameButtonProps> = ({ gameId, userId, onGameDeleted }) => {
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

  return (
    <button
      className={`rounded-lg text-lg font-bold px-2 bg-red m-1 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleDeleteGame}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default DeleteGameButton;
