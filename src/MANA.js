// t = new Tree with 1 initial node
//
// Deduce children
// Calculate score for each child
// Order each child amongst new nodes according to its score
// Determine highest score child:
//  If highest score child is above target score, STOP
//  If highest score child is lower than one of parent sibling score, resolve that parent sibling
//  Else resolve child
// Repeat

// --- MANA ---
// Resolve combinatory problems through trees
// Give key functions and a score goal to MANA, let it solve it for you via backtracking
// MANA monitors which steps slow your process
// ------------

import TreeModel from 'tree-model';

class Mana {
    constructor(initialModel, modelToScore, modelToChildren, finishCondition) {
        this.initialModel = Object.assign({}, initialModel, {id : 0});
        this.modelToScore = modelToScore;
        this.modelToChildren = modelToChildren;
        this.finishCondition = finishCondition;
        this.idCounter = 1;

        this.tree = new TreeModel({
            modelComparatorFn: (modelA, modelB) => {
                if(modelB.score === modelA.score) {
                    return 0;
                }
                return modelB.score > modelA.score ? 1 : -1; 
            }
        });

        this.rootNode = this.tree.parse(this.initialModel);
        this.resolve(this.rootNode);
        this.solution;
    }

    resolve(node, noChildren) {
        if(this.finishCondition(node.model)) {
            this.solution = node.getPath();
            return;
        }
        console.log('*** Resolving node', node);
        if(!noChildren) {
            const children = this.modelToChildren(node.model);
            if(children.length === 0 || node.model.id === 3) {
                console.log('*** Stopping resolution on node: ', node, ' (0 child found)');
                const nodeParent = node.parent;
                node.drop();
                console.log('*** Backtracking to parent node: ', nodeParent)
                return this.resolve(nodeParent, true);
            }
            children.forEach((child) => {
                // console.log('*** CHILD', child);
                child.score = this.modelToScore(child);
                if(child.score >= node.model.score) {
                    const childNode = this.tree.parse(Object.assign({}, child, {id : this.idCounter}));
                    this.idCounter++;
                    // console.log('*** childNode', childNode);
                    node.addChild(childNode);
                }
            });
        }
        console.log('*** Children scores', node.children.map(child => child.model.score).join('|'));
        this.resolve(node.children[0]);
    }
}

export default Mana;
