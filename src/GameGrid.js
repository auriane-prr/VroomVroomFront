import React, { useState, useEffect } from 'react';

function GameGrid() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          move('UP');
          break;
        case 'ArrowDown':
          move('DOWN');
          break;
        case 'ArrowLeft':
          move('LEFT');
          break;
        case 'ArrowRight':
          move('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position]); // Déclenche l'effet à chaque changement de position

  const move = (direction) => {
    // Envoyez une demande au backend pour valider le déplacement
    // Mettez à jour la position côté client si le déplacement est valide
  };

  return (
    <div tabIndex="0">
      Voici la grille de jeu avec la position actuelle
      {/* Affichez votre grille de jeu avec la position actuelle */}
    </div>
  );
}

export default GameGrid;
