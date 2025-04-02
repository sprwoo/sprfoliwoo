"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";

const TETROMINOS = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  'O': [
    [4, 4],
    [4, 4],
  ],
  'S': [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  'Z': [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0],
  ],
  'T': [
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0],
  ]
};

export default function Home() {
  const [gridSize, setGridSize] = useState({ cols: 10, rows: 10 });
  const [gridArray, setGridArray] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
  const [currentPosition, setCurrentPosition] = useState({ x: 3, y: 0 }); // Change this value to not hardcoded
  const [sevenBag, setSevenBag] = useState<string[]>([]);
  const [pieceActive, setPieceActive] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const updateGridSize = () => {
      const squareSize = 75; // Base size of squares
      const cols = Math.floor(window.innerWidth / squareSize);
      const rows = Math.floor(window.innerHeight / squareSize);
      setGridSize({ cols, rows });

      // Create a 2D array based on cols and rows
      const newGridArray = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => 0)
      );

      console.log("Grid Array:", newGridArray);
      setGridArray(newGridArray);
      setCurrentPiece([]);
      setCurrentPosition({ x: Math.floor(cols / 2) - 1, y: 0 });
      setSevenBag([]);
      setPieceActive(false);
      setShowText(true);

      console.log("Game reset due to window resize");
    };

    updateGridSize();
    window.addEventListener("resize", updateGridSize);

    return () => window.removeEventListener("resize", updateGridSize);
  }, []);

  const canMoveTo = (position: { x: number; y: number }) => {
    return currentPiece.every((row, rIndex) =>
      row.every((cell, cIndex) => {
        if (cell === 0) return true;
        const x = position.x + cIndex;
        const y = position.y + rIndex;

        return (
          x >= 0 && y >= 0 &&
          x < gridSize.cols &&
          y < gridSize.rows &&
          gridArray[y][x] === 0
        );
      })
    );
  };

  const rotatePiece = (direction: 1 | -1) => {
    // Transpose the piece
    const rotatedPiece = currentPiece[0].map((_, colIndex) =>
      currentPiece.map((row) => row[colIndex])
    );

    const newPiece =
      direction === 1
        ? rotatedPiece.map((row) => row.reverse())
        : rotatedPiece.reverse();

    if (canMoveTo(currentPosition)) {
      setCurrentPiece(newPiece);
    }
  };

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (!pieceActive) return;

      switch (e.code) {
        case "ArrowLeft": // Move piece left
          setCurrentPosition((prev) => {
            const nextPosition = { ...prev, x: prev.x - 1 };
            if (canMoveTo(nextPosition)) {
              return nextPosition;
            }
            return prev;
          });
          break;

        case "ArrowRight": // Move piece right
          setCurrentPosition((prev) => {
            const nextPosition = { ...prev, x: prev.x + 1 };
            if (canMoveTo(nextPosition)) {
              return nextPosition;
            }
            return prev;
          });
          break;

        case "ArrowDown": // Soft drop
          setCurrentPosition((prev) => {
            const nextPosition = { ...prev, y: prev.y + 1 };
            if (canMoveTo(nextPosition)) {
              return nextPosition;
            }
            return prev;
          });
          break;

        case "Space": // Hard drop
          setCurrentPosition((prev) => {
            const nextPosition = { ...prev };
            while (canMoveTo({ ...nextPosition, y: nextPosition.y + 1 })) {
              nextPosition.y += 1;
            }
            return nextPosition;
          });
          break;

        case "KeyZ": // Counterclockwise
          rotatePiece(-1);
          break;

        case "ArrowUp": // Clockwise
          rotatePiece(1);
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [pieceActive, currentPiece, currentPosition]);


  const generateSequence = () => {
    const tetrominoKeys = Object.keys(TETROMINOS);
    const shuffledTetrominos = tetrominoKeys.sort(() => Math.random() - 0.5);
    setSevenBag(shuffledTetrominos);
    console.log("Bag", sevenBag);
  };

  useEffect(() => {
    if (!pieceActive && sevenBag.length > 0) {
      const tetrominoKey = sevenBag[0] as keyof typeof TETROMINOS;
      setSevenBag(sevenBag.slice(1)); // Remove used piece
      setCurrentPiece(TETROMINOS[tetrominoKey]);

      if (tetrominoKey == "O") {
        setCurrentPosition({ x: Math.floor(gridSize.cols / 2) - 1, y: 0 });
      } else if (tetrominoKey == "I") {
        setCurrentPosition({ x: Math.floor(gridSize.cols / 2) - 2, y: -1 });
      } else {
        setCurrentPosition({ x: Math.floor(gridSize.cols / 2) - 2, y: 0 });
      }

      setPieceActive(true);
    } else if (!pieceActive && sevenBag.length === 0) {
      generateSequence();
    }
  }, [sevenBag, pieceActive]);

  const getDimensions = (piece: number[][]) => {
    let minX = piece[0].length, maxX = 0;
    let minY = piece.length, maxY = 0;

    piece.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        if (cell >= 1) {
          if (cIndex < minX) minX = cIndex;
          if (cIndex > maxX) maxX = cIndex;
          if (rIndex < minY) minY = rIndex;
          if (rIndex > maxY) maxY = rIndex;
        }
      });
    });

    return { width: maxX - minX + 1, height: maxY - minY + 1 };
  };

  // Updated Movement Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        const nextPosition = { ...prev, y: prev.y + 1 };
        const pieceDimensions = getDimensions(currentPiece);

        console.log("Next Position:", nextPosition);
        console.log("Piece Dimensions:", pieceDimensions);

        // Improved collision check for all occupied cells
        let canMove = true;
        currentPiece.forEach((row, rIndex) => {
          row.forEach((cell, cIndex) => {
            if (cell >= 1) {
              const y = nextPosition.y + rIndex;
              const x = nextPosition.x + cIndex;
              if (y >= gridSize.rows || gridArray[y][x] >= 1) {
                canMove = false;
              }
            }
          });
        });

        if (!canMove) {
          setGridArray((prevGrid) => {
            const newGrid = prevGrid.map(row => [...row]);
            currentPiece.forEach((row, rIndex) => {
              row.forEach((cell, cIndex) => {
                if (cell >= 1) {
                  const y = prev.y + rIndex;
                  const x = prev.x + cIndex;
                  if (y >= 0 && y < gridSize.rows && x >= 0 && x < gridSize.cols) {
                    newGrid[y][x] = cell;
                  }
                }
              });
            });
            return newGrid;
          });

          setPieceActive(false);
          return prev;
        }
        return nextPosition;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPiece, gridArray]);

  const renderGrid = () => {
    const tempGrid = gridArray.map(row => [...row]);

    if (currentPiece.length > 0) {
      currentPiece.forEach((row, rIndex) => {
        row.forEach((cell, cIndex) => {
          if (cell >= 1) {
            const y = currentPosition.y + rIndex;
            const x = currentPosition.x + cIndex;
            if (y >= 0 && y < gridSize.rows && x >= 0 && x < gridSize.cols) {
              tempGrid[y][x] = cell;
            }
          }
        });
      });
    }

    return tempGrid;
  };


  useEffect(() => {
    console.log("current piece", currentPiece);
    console.log("rendered", renderGrid());
  });

  const COLORS: { [key: string]: string } = {
    '0': '#D6D6B1', // Empty
    '1': '#03f0fc', // I
    '2': '#4a03fc', // J
    '3': '#fca103', // L
    '4': '#d8f002', // O
    '5': '#f00216', // S
    '6': '#47d600', // Z
    '7': '#cc02f0', // T
  };

  return (
    <div className={`relative w-screen h-screen ${showText == true ? "block" : "hidden" }`}>
      <div className="absolute inset-0 w-full z-10 opacity-50">
        <h1 className="ml-30 mt-30 text-3xl">Hey, I&apos;m Daniel.</h1>
        <p className="ml-50 mt-5">I am a math student studying at the University of Waterloo.</p>
        <p className="ml-50 mt-5">I like to build random things from time to time.</p>
        <p className="ml-50 mt-5">Whenever I am not building or doing school work, I bum out and play Tekken 8 or Deadlock.</p>
        <p className="ml-50 mt-5">Feel free to reach out to me.</p>
        <div className="text-4xl text-center space-x-4">  
          <Link
              href="https://github.com/sprwoo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon
                icon={faGithub}
                className="icon text-gray-300 hover:text-gray transition-all duration-200 ease-in-out hover:scale-110"
              />
            </Link>
            <Link
              href="https://linkedin.com/in/yangielll/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                className="icon text-gray-300 hover:text-gray transition-all duration-200 ease-in-out hover:scale-110"
              />
            </Link>
          </div>
      </div>

      <div
        className="grid w-screen h-screen z-10"
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
        }}
      >
        {renderGrid().map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center"
              style={{
                backgroundColor: COLORS[cell] ,
                opacity: cell >= 1 ? 0.2 : 1,
                zIndex: cell >= 1 ? 0 : 100,
              }}
            >
            </div>
          ))
        )}
      </div>
    </div>
  );
}
