
const state = {
    "index": 0,
    "height": 1,
    "width": 1,
};
const treeNodes = [{
    "children": [],
    "data": {},
    "depth": 0,
    "order": 0
}];
const directions = ["left", "right", "up", "down"];
const emptyIndices = [];
const indexStack = [0];
console.log("--------------------------------start--------------------------------");
function reset() {
    while (treeNodes.length > 1) {
        treeNodes.pop();
    };
    while (emptyIndices.length > 1) {
        emptyIndices.pop();
    };
    state.index = 0;
    state.height = 1;
    state.width = 1;
    return;
};

function TreeNode(parent, depth, order, data) {
    this.children = [];
    this.data = data;
    this.depth = depth;
    this.order = order;
    this.parent = parent;
    return this;
}

function addNode(data) {
    let parent = treeNodes[state.index]
    let nChildren = parent.children.length;
    let newIndex = emptyIndices.length ? emptyIndices.shift() : treeNodes.length;
    //let insertIndex = treeNodes.length; 
    parent.children.push(newIndex);
    let child = (new TreeNode(state.index, parent.depth + 1, nChildren, data));
    if (nChildren === 0) {
        if (child.depth === state.height) { //this is the first node at this depth
            console.log(`increasing height to ${++state.height}`);
        }
    }
    else {
        console.log(`increasing width to ${++state.width}`);
    }
    console.log(`added child`);
    treeNodes[newIndex] = child;
    printNodeInfo(newIndex);
}
function move(direction) {// left right up down
    if (direction > 3) {
        throw new Error(`direction index ${direction} out of range (0-3)`);
    }
    let currentIndex = state.index;
    let currentNode = treeNodes[state.index];
    if (direction < 2) {
        if (!("parent" in currentNode)) {
            return console.log(`at root node, cannot move ${directions[direction]}`);
        }
        let siblings = treeNodes[currentNode.parent].children;
        let childIndex = currentNode.order;
        if (direction) { //right
            if (currentNode.order === (siblings.length - 1)) {
                return console.log(`at rightmost child, cannot move right`);
            }
            state.index = siblings[childIndex + 1];
        }
        else { //left
            if (!childIndex) {
                return console.log(`at leftmost child, cannot move left`);
            }
            else {
                state.index = siblings[childIndex - 1];
            }
        }
    }
    else {
        if (direction == 2) {
            if (!("parent" in currentNode)) {
                return console.log(`at root node, cannot move up`);
            }
            state.index = currentNode.parent;
        }
        else { //down
            if (!currentNode.children.length) {
                return console.log(`at a leaf node, cannot move down`);
            }
            state.index = currentNode.children[0];
        }
    }
    console.log(`moved ${directions[direction]} from ${currentIndex}`);
    printNodeInfo(state.index);
}
function removeNode() {
    let currentNode = treeNodes[state.index];
    if (!("parent" in currentNode)) {
        return console.log(`cannot remove root node`);
    }
    let currentParent = treeNodes[currentNode.parent];
    currentParent.children.concat(currentNode.children);
    treeNodes[state.index] = undefined;
    emptyIndices.push(state.index);
}

function traverse() {
    let xPosition, yPosition;
    let count = 0;
    let leafIndex = 0;
    let xStep = (2 / (state.width + 1));
    let yStep = (2 / (state.height + 1));

    let leftmostChildPositions = [];
    let rightmostChildPositions = [];
    let indexStack = [0];
    let currentChildIndex = 0;
    while (indexStack.length && (count++ < 100)) {
        console.log("-------------------------------step: " + count + "-------------------------------");
        var currentIndex = indexStack[indexStack.length - 1];
        printNodeInfo(currentIndex);
        var currentNode = treeNodes[currentIndex];
        var nChildren = currentNode.children.length;
        if (currentChildIndex < nChildren) {
            indexStack.push(currentNode.children[currentChildIndex]);
            currentChildIndex = 0;
            continue;
        }
        yPosition = yStep * (currentNode.depth + 1) - 1;
        if (nChildren) {
            xPosition = (rightmostChildPositions.pop() + leftmostChildPositions.pop()) / 2;
            console.log(`draw stem at ${xPosition} ${yPosition}`);
        }
        else {
            xPosition = xStep * (++leafIndex) - 1;
            console.log(`draw leaf at ${xPosition} ${yPosition}`);
        }
        let currentParent = treeNodes[currentNode.parent];
        if (currentParent) {
            if ((treeNodes[currentNode.parent].children.length - 1) === currentNode.order) {
                rightmostChildPositions.push(xPosition);
                console.log(`rightmost child`);
            }
            if (!currentNode.order) {
                leftmostChildPositions.push(xPosition);
                console.log(`leftmost child`);
            }
        }
        currentChildIndex = currentNode.order + 1;
        indexStack.pop();
        console.log(`index stack size ${indexStack.length}`);
    }
}


function printNodeInfo(tgtIndex) {
    let node = treeNodes[tgtIndex];
    console.log(`index: ${tgtIndex}, depth: ${node.depth}, order: ${node.order}`);
    console.log(`node has ${node.children.length} children${node.children.length ? ': ' + node.children.join(' ') : ''}`);
}

let testData = [];
for (i = 0; i < 32; i++) {
    testData.push({ "val": i });
};

let arrA = [];
let arrB = ["@"];
let arrC = [1];
let arrD = [1,"@"];
let arrE = [0,1];
let arrF = [0,1,"@"];
let arrG = ["@",70,71];
let arrH = [0,"@",70,71];
let arrI = [0,1,"@",70,71];

function test(args){
    this.range =  [];
    console.log("args are "+args.join(' '));
    if(args.length) {
        let argSplit = args.indexOf("@");
        console.log("split at "+argSplit);
        if(argSplit<0) {
            this.range = args; 
        }
        else {
            if(argSplit){
                this.range = args.slice(0,argSplit);
            }
            if((args.length-1)>argSplit){
                this.letters = args.slice(argSplit+1);
            }
        }
    }
    return this;
} 
