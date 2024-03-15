import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const gridSize = 10;
  const caseSize = 50;
  const socketRef = useRef(null); // Utiliser useRef pour maintenir la référence de socket


  const connectWebSocket = () => {
    // Établir la connexion WebSocket ici
    socketRef.current = new WebSocket("ws://localhost:8080/game-socket");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
      socketRef.current.send("GET_INITIAL_POSITION");
    };

    socketRef.current.onmessage = (event) => {
      console.log("Message from server", event.data);
      const newPosition = parsePositionFromResponse(event.data);
      setPosition(newPosition);
    };
    
    socketRef.current.onopen = () => {
      // Demander le chemin après l'établissement de la connexion
      socketRef.current.send("GET_PATH");
    };
    socketRef.current.onmessage = (event) => {
      console.log("Message from server", event.data);
      if (event.data.startsWith("Path:")) {
        const path = event.data.substring(5);
        const positions = path.split(";").map(p => {
          const [x, y] = p.split(",").map(Number);
          return { x, y };
        });
      } else {
        const newPosition = parsePositionFromResponse(event.data);
        setPosition(newPosition);
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false); // Mettre à jour l'état de connexion
    };

    setIsConnected(true); // Mettre à jour l'état de connexion après l'ouverture
  };

  const handleConnectClick = () => {
    if (!isConnected) {
      connectWebSocket();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      event.preventDefault();
      let direction;

      switch (event.key) {
        case 'ArrowUp': direction = "UP"; break;
        case 'ArrowDown': direction = "DOWN"; break;
        case 'ArrowLeft': direction = "LEFT"; break;
        case 'ArrowRight': direction = "RIGHT"; break;
        default: return; // Quitter si une touche non gérée est pressée
      }

      // Envoyer la direction via WebSocket
      if (socketRef.current) {
        socketRef.current.send(direction);
      }
    };

    // Ajouter l'écouteur d'événement pour les touches
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); 

  const parsePositionFromResponse = (responseBody) => {
    const match = responseBody.match(/X=(\d+), Y=(\d+)/);
    if (match) {
      return { x: parseInt(match[1], 10), y: parseInt(match[2], 10) };
    }
    return { x: 0, y: 0 };
  };

  
  const renderGrid = () => {
    let grid = [];
    // Inverser l'ordre des lignes pour que y=0 soit en bas
    for (let y = gridSize - 1; y >= 0; y--) {
      let row = [];
      // Générer les colonnes normalement
      for (let x = 0; x < gridSize; x++) {
        // Utiliser directement la position.x et inverser la logique pour position.y
        // car l'ordre des lignes est déjà inversé
        let isLetterPosition = x === position.x && y === position.y;
        row.push(
          <div
            key={`${x},${y}`}
            style={{
              width: `${caseSize}px`,
              height: `${caseSize}px`,
              border: '1px solid black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'red', // Couleur de la lettre
              margin: '2px', // Marge entre les cases
            }}>
            {isLetterPosition ? 'A' : ''}
          </div>
        );
      }
      // Ajouter chaque ligne à la grille, en commençant par le bas
      grid.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
    }
    // Puisque l'ordre des lignes est inversé, afficher directement la grille construite
    return <div style={{ display: 'flex', flexDirection: 'column' }}>{grid}</div>;
  };
  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      {!isConnected && <button onClick={handleConnectClick}>GO</button>}
      {renderGrid()}
    </div>
  );
}



export default App;
