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
        onGameDeleted();
      } else {
        console.log('Error deleting the game.');
      }
    } catch (error) {
      console.error('Error deleting the game:', error);
    }

    setDeleting(false);
  };

  return (
    <button onClick={handleDeleteGame} disabled={isDeleting}>
      {isDeleting ? 'Deleting...' : 'Delete Game'}
    </button>
  );
};

export default DeleteGameButton;
