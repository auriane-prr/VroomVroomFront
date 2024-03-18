import React, { useState, useEffect, useRef } from 'react';
import './App.css'; 
import voiture from './voiture.png';
import logo from './logo_app.png';

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const gridSize = 10;
  const socketRef = useRef(null); 
  const [validPositions, setValidPositions] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [carDirection, setCarDirection] = useState(0);
  const [gameStatus, setGameStatus] = useState("");
  const [showPenalty, setShowPenalty] = useState(false);



  const connectWebSocket = () => {
    socketRef.current = new WebSocket("ws://localhost:8080/game-socket");
  
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
      socketRef.current.send("START"); 
    };
  
    socketRef.current.onmessage = (event) => {
      console.log("Message from server", event.data);

      if (event.data.startsWith("Nouvelle position:") || event.data.startsWith("Initial position:")) {
        const newPosition = parsePositionFromResponse(event.data.substring("Initial position:".length));
        setPosition(newPosition);
      } else if (event.data.startsWith("Path:")) {
        const pathData = event.data.substring("Path:".length);
        const positions = JSON.parse(pathData).map(pos => ({
          x: pos.x,
          y: gridSize - 1 - pos.y 
      }));
      setValidPositions(positions);
      } else if (event.data.startsWith("Victory:")) {
        setGameStatus("victory");
      } else if (event.data.startsWith("Defeat:")) {
        setGameStatus("defeat");
      } else if (event.data.startsWith("ElapsedTime:")) {
        const time = parseInt(event.data.split(":")[1].trim(), 10);
        setElapsedTime(time);
      } else if (event.data.startsWith("Penalty:")) {
        console.log("Pénalité de 1 secondes");
        setShowPenalty(true);
        setTimeout(() => setShowPenalty(false), 2000);
      }
    };
  
    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };
  
    setIsConnected(true);
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
      let rotation = carDirection;

      switch (event.key) {
        case 'ArrowUp': 
        direction = "UP"; 
        rotation = 0; 
        break;
        case 'ArrowDown': 
        direction = "DOWN";
        rotation = 180; 
        break;
        case 'ArrowLeft': 
        direction = "LEFT"; 
        rotation = 270;
        break;
        case 'ArrowRight': 
        direction = "RIGHT"; 
        rotation = 90;
        break;
        default: return; 
        
      }
      setCarDirection(rotation);

      if (socketRef.current) {
        socketRef.current.send(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected]); 

  const parsePositionFromResponse = (responseBody) => {
    const match = responseBody.match(/X=(\d+), Y=(\d+)/);
    if (match) {
      return {
        x: parseInt(match[1], 10),
        y: parseInt(match[2], 10)
      };
    }
    return { x: 0, y: 0 };
  };
  
  const Modal = ({ onStartClick }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <img src={logo} alt="Logo" className='logo' />
        <h2 className='modal-title'>Bienvenue dans VroomVroom !</h2>
        <p>Il faut faire le parcours en moins de 10 seconde,</p>
        <p>Prêt, feu, partez !</p>
        <button onClick={onStartClick}>GO</button>
      </div>
    </div>
  );

  const VictoryModal = ({ onRestart }) => (
    <div className="modal-overlay">
      <div className="modal-victoire">
        <h2>Victoire !</h2>
        <p>Bravo ! vous avez gagné !</p>
        <button onClick={onRestart}>Rejouer</button>
      </div>
    </div>
  );
  
  const DefeatModal = ({ onRestart }) => (
    <div className="modal-overlay">
      <div className="modal-perdre">
        <h2>Défaite !</h2>
        <p>Dommage... Prenez votre revanche et rejouez !</p>
        <button onClick={onRestart}>Rejouer</button>
      </div>
    </div>
  );

  const handleRestart = () => {
    setGameStatus("");
    setIsConnected(false);
  };

  const renderGrid = () => {
    let grid = [];
    const imagePath = voiture;
    for (let y = gridSize - 1; y >= 0; y--) {
      let row = [];
      for (let x = 0; x < gridSize; x++) {
        let isLetterPosition = x === position.x && y === position.y;
        let isValidPosition = validPositions.some(pos => pos.x === x && pos.y === (gridSize - 1 - y));
        row.push(
          <div key={`${x},${y}`}
            className={`grid-cell ${isValidPosition ? 'valid' : 'invalid'}`}
          >
            {isLetterPosition ? <img src={imagePath} alt="Car" style={{ maxWidth: '100%', maxHeight: '100%', transform: `rotate(${carDirection}deg)` }} /> : ''}
          </div>
        );
      }
      grid.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
    }
    return <div style={{ display: 'flex', flexDirection: 'column' }}>{grid}</div>;
  };
    

  return (
    <div className='App-page' >
      <h2 className='App-header'> VroomVroom </h2>
      {!isConnected && <Modal onStartClick={handleConnectClick} />}
      {gameStatus === "victory" && <VictoryModal onRestart={handleRestart} />}
      {gameStatus === "defeat" && <DefeatModal onRestart={handleRestart} />}
      {showPenalty && <div className="penalty-message">Pénalité de 1 seconde !</div>}
      <div className='time'>Temps écoulé: {elapsedTime} secondes</div>
      {renderGrid()}
      
    </div>
  );
}



export default App;
