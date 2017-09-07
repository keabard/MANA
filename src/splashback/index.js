import {cloneDeep, filter} from 'lodash';
import Mana from '../MANA';

// Splashback case
const splashGrid = [
    [1, 0, 2, 1, 2, 2],
    [0, 1, 3, 2, 4, 0],
    [4, 2, 0, 4, 3, 3],
    [0, 2, 2, 2, 1, 4],
    [3, 0, 2, 0, 1, 3],
    [0, 1, 3, 4, 3, 3]
];

const getNeighbourCoordinates = (grid, originRow, originCol, direction) => {
    // console.log('** Searching coordinates of neighbour with origin \n', grid, originRow, originCol, 'in direction ', direction, '(Value ', grid[originRow][originCol], ')');
    let modifier = {};
    switch (direction) {
        case 'N':
            modifier = {row: -1, col: 0};
            break;
        case 'E':
            modifier = {row: 0, col: 1};
            break;
        case 'S':
            modifier = {row: 1, col: 0};
            break;
        case 'W':
            modifier = {row: 0, col: -1};            
            break;
    }
    originRow += modifier.row;
    originCol += modifier.col;
    // console.log('*** Coords after modification:', originRow, originCol);

    while(originRow > -1 && originRow < 6 && originCol > -1 && originCol < 6) {
        // console.log('** Checking if neighbour on coordinates ', originRow, originCol);
        if(grid[originRow][originCol] !== 0) {
            // console.log('** Found a neighbour!');
            return {neighbourRow: originRow, neighbourCol: originCol};
        }
        originRow += modifier.row;
        originCol += modifier.col;
    }
    // console.log('** Did not find any neighbour');
    return {neighbourRow: null, neighbourCol: null};
};

const clickOnCell = (grid, row, col) => {
    let resultGrid = cloneDeep(grid);
    let numberOfExplosions = 0;
    // Simulate a click on a cell
    //-- Add +1 to the cell
    resultGrid[row][col] = (resultGrid[row][col] + 1)%5;
    //-- If it becomes 5, it explodes. Becomes 0 then add +1 to its first cardinal neighbours (if they exist).
    if(resultGrid[row][col] === 0) {
        numberOfExplosions += 1;
        ['N', 'E', 'S', 'W'].forEach((direction) => {
            const {neighbourRow, neighbourCol} = getNeighbourCoordinates(resultGrid, row, col, direction);
            if(neighbourRow !== null && neighbourCol !== null) {
                // console.log('Clicking on found neighbour');
                const resultObject = clickOnCell(resultGrid, neighbourRow, neighbourCol);
                numberOfExplosions += resultObject.numberOfExplosions;
                resultGrid = cloneDeep(resultObject.resultGrid);
            }
        });
    }
    return {resultGrid, numberOfExplosions};
};

const mana = new Mana(
    {grid: cloneDeep(splashGrid), score: 0, drops: 19, action: {row: null, col: null}},
    (model) => {
        let score = 0;
        // For each cell, add 4 if cell is 0, else the score of the cell
        model.grid.map((row) => {
            row.map((cell) => {
                const cellScore = cell === 0 ? 5 : cell;
                score += cellScore; 
            });
        });
        // Multiply by the number of drops left
        score *= model.drops;
        return score;
    },
    (model) => {
        const children = [];
        model.grid.map((row, rowIndex) => {
            row.map((cell, cellIndex) => {
                const {resultGrid, numberOfExplosions} = clickOnCell(model.grid, rowIndex, cellIndex);
                children.push({grid: resultGrid, drops: model.drops - 1 + Math.floor(numberOfExplosions / 3), action: {row: rowIndex, col: cellIndex}});
            });
        })
    
        return children;
    },
    (model) => {
        let isSimulationOver = true;
        model.grid.forEach((row) => {
            row.forEach((cell) => {
                if (cell !== 0) {
                    isSimulationOver = false;
                }
            });
        });
        return isSimulationOver;
    }
);


console.log('SOLUTION', mana.solution.map((step) => `Row: ${step.model.action.row} - Col: ${step.model.action.col} / Drops left: ${step.model.drops}`));