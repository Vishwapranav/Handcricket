import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

function App() {
  const [gameState, setGameState] = useState('toss'); // States: toss, chooseBatBowl, play, switchInnings, result
  const [tossResult, setTossResult] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [fingerCount, setFingerCount] = useState(null);
  const [computerNumber, setComputerNumber] = useState(null);
  const [isOut, setIsOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batting, setBatting] = useState(null); // true if player is batting, false if bowling
  const [firstInningsOver, setFirstInningsOver] = useState(false);

  const tossCoin = (call) => {
    const tossOutcome = Math.random() < 0.5 ? 'heads' : 'tails';
    setTossResult(tossOutcome);
    if (tossOutcome === call) {
      setGameState('chooseBatBowl');
    } else {
      const computerDecision = Math.random() < 0.5 ? 'bat' : 'bowl';
      setBatting(computerDecision === 'bat' ? false : true);
      setGameState('play');
    }
  };

  const chooseBatBowl = (choice) => {
    setBatting(choice === 'bat');
    setGameState('play');
  };

  useEffect(() => {
    if (gameState === 'play' && !isOut) {
      const interval = setInterval(() => {
        detectFingerCount();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [gameState, isOut]);

  const detectFingerCount = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/detect_fingers');
      const data = await response.json();
      setFingerCount(data.finger_count);

      const randomNum = Math.floor(Math.random() * 6) + 1;
      setComputerNumber(randomNum);

      if (batting) {
        if (data.finger_count === randomNum) {
          setIsOut(true);
          if (!firstInningsOver) {
            setFirstInningsOver(true);
            setGameState('switchInnings');
          } else {
            setGameState('result');
          }
        } else {
          const newPlayerScore = playerScore + data.finger_count;
          setPlayerScore(newPlayerScore);

          // Check if player score exceeds computer score
          if (firstInningsOver && newPlayerScore > computerScore) {
            setGameState('result');
          }
        }
      } else {
        if (data.finger_count === randomNum) {
          setIsOut(true);
          if (!firstInningsOver) {
            setFirstInningsOver(true);
            setGameState('switchInnings');
          } else {
            setGameState('result');
          }
        } else {
          const newComputerScore = computerScore + randomNum;
          setComputerScore(newComputerScore);

          // Check if computer score exceeds player score
          if (firstInningsOver && newComputerScore > playerScore) {
            setGameState('result');
          }
        }
      }
    } catch (error) {
      console.error("Error detecting finger count:", error);
    }
    setLoading(false);
  };

  const switchInnings = () => {
    setIsOut(false);
    setBatting(!batting);
    setGameState('play');
  };

  const resetGame = () => {
    setGameState('toss');
    setTossResult(null);
    setPlayerChoice(null);
    setPlayerScore(0);
    setComputerScore(0);
    setFingerCount(null);
    setComputerNumber(null);
    setIsOut(false);
    setBatting(null);
    setFirstInningsOver(false);
  };

  const determineWinner = () => {
    if (playerScore > computerScore) {
      return 'You Win!';
    } else if (playerScore < computerScore) {
      return 'Computer Wins!';
    } else {
      return 'Match Tied!';
    }
  };

  const resultColor = () => {
    if (gameState === 'result') {
      if (playerScore > computerScore) {
        return 'bg-green-500';
      } else if (playerScore < computerScore) {
        return 'bg-red-500';
      } else {
        return 'bg-yellow-500';
      }
    }
    return 'bg-gradient-to-br from-blue-800 to-purple-800';
  };

  return (
    <div className={`App min-h-screen ${resultColor()} flex flex-col items-center justify-center text-white transition-all duration-500`}>
      <header className="App-header text-center">
        <h1 className="text-4xl font-extrabold mb-8 animate-pulse">Hand Cricket Game</h1>
        {gameState === 'toss' && (
          <>
            <h2 className="text-2xl mb-4">Call the Toss: Heads or Tails?</h2>
            <div className="space-x-4">
              <button 
                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-all duration-300"
                onClick={() => tossCoin('heads')}
              >
                Heads
              </button>
              <button 
                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-all duration-300"
                onClick={() => tossCoin('tails')}
              >
                Tails
              </button>
            </div>
          </>
        )}
        {gameState === 'chooseBatBowl' && (
          <>
            <h2 className="text-2xl mb-4">You won the toss! Choose to Bat or Bowl</h2>
            <div className="space-x-4">
              <button 
                className="px-4 py-2 bg-green-500 font-bold rounded-full hover:bg-green-600 transition-all duration-300"
                onClick={() => chooseBatBowl('bat')}
              >
                Bat
              </button>
              <button 
                className="px-4 py-2 bg-red-500 font-bold rounded-full hover:bg-red-600 transition-all duration-300"
                onClick={() => chooseBatBowl('bowl')}
              >
                Bowl
              </button>
            </div>
          </>
        )}
        {gameState === 'play' && !isOut && (
          <div className="flex w-full h-48">
            <div className="w-1/2 flex flex-col items-center justify-center bg-blue-900 p-4">
              <h3 className="text-xl font-bold">Computer's Number</h3>
              {loading ? (
                <p className="text-lg animate-pulse">Loading...</p>
              ) : (
                computerNumber !== null && (
                  <div className="text-6xl font-extrabold">
                    {computerNumber}
                  </div>
                )
              )}
            </div>
            <div className="w-1/2 flex flex-col items-center justify-center bg-purple-900 p-4">
              <h3 className="text-xl font-bold">Your Number</h3>
              {loading ? (
                <p className="text-lg animate-pulse">Loading...</p>
              ) : (
                fingerCount !== null && (
                  <div className="text-6xl font-extrabold">
                    {fingerCount}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {gameState === 'play' && (
          <div className="mt-4">
            <p className="text-lg">Your Score: {playerScore}</p>
            <p className="text-lg">Computer's Score: {computerScore}</p>
          </div>
        )}
        {gameState === 'switchInnings' && (
          <div className="mt-4">
            <h2 className="text-2xl mb-4">{batting ? "You're Out! Now the Computer will bat." : "Computer is Out! Now it's your turn to bat."}</h2>
            <button 
              className="px-4 py-2 bg-blue-500 font-bold rounded-full hover:bg-blue-600 transition-all duration-300"
              onClick={switchInnings}
            >
              Start Next Innings
            </button>
          </div>
        )}
        {gameState === 'result' && (
          <>
            <h2 className="text-3xl mb-4 animate-bounce">{determineWinner()}</h2>
            <p className="text-lg mb-2">Your Score: {playerScore}</p>
            <p className="text-lg mb-4">Computer's Score: {computerScore}</p>
            <button 
              className="px-4 py-2 bg-purple-500 font-bold rounded-full hover:bg-purple-600 transition-all duration-300"
              onClick={resetGame}
            >
              Play Again
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
