const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};


function sevenBag() {
    const tetrominoKeys = Object.keys(tetrominos);
    const shuffledTetrominos = tetrominoKeys.sort(() => Math.random() - 0.5);
    return shuffledTetrominos.slice(0, 7).map(key => ({ key, matrix: tetrominos[key] }));    
}

function rotate(matrix) {
    const N = matrix.length - 1; 
    const result = matrix.map((row, i) => 
        row.map((val, j) => matrix[N - j][i])
    );

    matrix.length = 0; 
    matrix.push(...result);
    return matrix;
}

function nextTetromino() {
    if (sequence.length === 0) {
        sequence = sevenBag();
    }

    const next = sequence.pop();
    return next;
}

const playfield = [];