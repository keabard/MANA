// t = new Tree with 1 initial node
//
// Deduce children
// Calculate score for each child
// Order each child amongst new nodes according to its score
// Determine highest score child:
//  If highest score is above target score, STOP
//  If highest score is lower than one of parent sibling score, resolve that parent sibling
//  Else resolve child
// Repeat

// --- MANA ---
// Resolve combinatory problems through trees
// Give key functions and a score goal to MANA, let it solve it for you via backtracking
// MANA monitors which steps slow your process
// ------------

import TreeModel from 'tree-model';
import {cloneDeep, filter} from'lodash';

class Mana {
    constructor(initialModel, modelToScore, modelToChildren, finishCondition) {
        this.initialModel = initialModel;
        this.modelToScore = modelToScore;
        this.modelToChildren = modelToChildren;
        this.finishCondition = finishCondition;

        this.tree = new TreeModel({
            modelComparatorFn: (modelA, modelB) => {
                if(modelB.score === modelA.score) {
                    return 0;
                }
                return modelB.score > modelA.score ? 1 : -1; 
            }
        });

        this.rootNode = this.tree.parse(initialModel);
        this.resolve(this.rootNode);
        this.solution;
    }

    resolve(node) {
        if(this.finishCondition(node.model)) {
            this.solution = node.getPath();
            return;
        }
        // console.log('*** Resolving node', node);
        console.log('*** Node grid : \n', node.model.grid);
        console.log('*** Node drops : \n', node.model.drops);
        console.log('*** Node action : \n', node.model.action);
        const children = this.modelToChildren(node.model);
        if(children.length === 0) {
            console.log('*** Stopping resolution on node: ', node, ' - 0 child found');
            return node.model;
        }
        children.forEach((child) => {
            // console.log('*** CHILD', child);
            child.score = this.modelToScore(child);
            const childNode = this.tree.parse(child); 
            // console.log('*** childNode', childNode);
            node.addChild(childNode);
        });
        console.log('*** Children scores', node.children.map(child => child.model.score).join('|'));
        this.resolve(node.children[0]);
    }
}

// Simple case
// const mana = new Mana(
//     {key: 'x', score: 1},
//     (model) => {
//         console.log('coucou', model);
//         return model.key.length;
//     },
//     (model) => {
//         return [{key: model.key + 'x'}];
//     },
//     10
// );

const splashGrid = [
    [4, 3, 1, 3, 2, 0],
    [2, 2, 1, 0, 1, 4],
    [2, 0, 3, 3, 4, 3],
    [2, 0, 2, 2, 3, 0],
    [1, 2, 2, 4, 3, 2],
    [0, 0, 0, 4, 1, 4]
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

// Splashback case
const mana = new Mana(
    {grid: cloneDeep(splashGrid), score: 0, drops: 13, action: {row: null, col: null}},
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