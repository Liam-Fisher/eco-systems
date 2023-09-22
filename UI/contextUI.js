autowatch = 1;
invars = 1;
outvars = 3;

var state = {};
var treeNodes = [];
var emptyIndices = [];
var indexStack = [];
var childPositions = [];
var alphabet = [];
var brgb = [0.09, 0.08, 0.07, 1.]; // border color
var crgb = [0.79, 0.78, 0.8, 1.]; // canvas color
var hrgb =  [0.9, 0.9, 0.65, 0.5]; // position highlighting rectangle color
var nrgb = [0.025, 0.2, 0.05, 0.75]; // node ellipse color
var lrgb = [0.2, 0.15, 0.025, 1.]; // line segment color
var trgb = [0.96, 0.97, 0.98, 1.]; // node text color
var bdim = [0.1,0.1]; // border size
var ndim = [0.5, 0.25]; // x and y radii of node ellipse
var ldim = 0.5; // width of line segment
var tdim = 0.9; // relative font size for node text
sketch.default2d();
reset();
bang();


function reset() {
    treeNodes = [(new TreeNode(-1, 0, 0, {}))];
    state.index = 0;
    state.height = 1;
    state.width = 1;
    emptyIndices = [];
    indexStack = [];
};

function TreeNode(parent, depth, order, args) {
    this.children = [];
    this.depth = depth;
    this.order = order;
    this.parent = parent;
    this.range = [];
    if (args.length) {
        var argSplit = args.indexOf("@");
        if (argSplit < 0) {
            this.range = args;
        }
        else {
            if (argSplit) {
                this.range = args.slice(0, argSplit);
            }
            if ((args.length - 1) > argSplit) {
                this.letters = args.slice(argSplit + 1);
            }
        }
    }
    return this;
}
function move(direction) {// left right up down
    var currentIndex = state.index;
    var currentNode = treeNodes[state.index];
    var isRoot = ("parent" in currentNode);
    var isLeaf = (!currentNode.children.length);
    if (direction === "down") {
        if(isLeaf) {
            return post("\nat a leaf node, cannot move down");
        }
        state.index = currentNode.children[0];
    }
    else {
        if (isRoot) {
            return post("\nat root node, cannot move "+direction);
        }
        if (direction === "up") {
            state.index = currentNode.children[0];
        }
        else {    
            var siblings = treeNodes[currentNode.parent].children;
            var childIndex = currentNode.order;
            if (direction === "right") {
                if (currentNode.order === (siblings.length - 1)) {
                    return post("\nat rightmost child, cannot move right");
                }
                state.index = siblings[childIndex + 1];
            }
            else if (direction === "left") {
                if (!childIndex) {
                    return post("\nat leftmost child, cannot move left");
                }
                else {
                    state.index = siblings[childIndex - 1];
                }
            }
            else {
                throw new Error("direction " + direction + " is invalid. use left, right, up, or down");
            }
        }
    }
    post("\nmoved " + direction + " from " + currentIndex + " to " + state.index);
    printNodeInfo(state.index);
    bang();
}
function addNode() {
    var args = arrayfromargs(arguments);
    var parent = treeNodes[state.index]
    var nChildren = parent.children.length;
    post("\nadding child " + nChildren + "to node at " + state.index);
    var newIndex = emptyIndices.length ? emptyIndices.shift() : treeNodes.length;
    parent.children.push(newIndex);
    var child = (new TreeNode(state.index, parent.depth + 1, nChildren, args));
    if (nChildren === 0) {
        if (child.depth === state.height) { //this is the first node at this depth
            state.height++;
            post("\nincreasing height to " + state.height);
        }
    }
    else {
        post("\nincreasing height to " + state.width);
    }
    post("printing info for added node");
    treeNodes[newIndex] = child;
    printNodeInfo(newIndex);
    bang();
}
function removeNode() {
    var currentNode = treeNodes[state.index];
    if (!("parent" in currentNode)) {
        return post("\ncannot remove root node");
    }
    var currentParent = treeNodes[currentNode.parent];
    currentParent.children.concat(currentNode.children);
    treeNodes[state.index] = undefined;
    emptyIndices.push(state.index);
    bang();
}

function printNodeInfo(tgtIndex) {
    var node = treeNodes[tgtIndex];
    post("\nindex: " + tgtIndex + ", depth: " + node.depth + ", order: " + node.order);
    post("\nnode has " + node.children.length + " children ");
    if (node.children.length) {
        post(node.children.join(' '));
    }
}
function bang() {
    draw();
    refresh();
} 

function draw() { // main graphics function
    var xPosition, yPosition, childX, childY, textSize;
    var currentIndex, nChildren, nodeType;
    var currentNode, currentChildren;
    var count = 0;
    var leafIndex = 0;
    var offsetX = (1-bdim[0]);
    var offsetY = (1-bdim[1]);
    var xStep = (2*offsetX / (state.width + 1));
    var yStep = (2*offsetY / (state.height + 1));
    var rX = xStep*ndim[0]/2;
    var rY = yStep*ndim[1]/2;

    var childIndex = 0;
    var childPositions = [];

    post("\n current height " + state.height);
    post("\n current width " + state.width);
    post("\n current xStep " + xStep);
    post("\n current yStep " + yStep);
    indexStack.push(0);
    sketch.glclearcolor(crgb[0], crgb[1], crgb[2], crgb[3]); // set the clear color
    sketch.glclear(); // erase the background
    //sketch.textalign("center", "center");
    while (indexStack.length && (count++ < 100)) {
        post("\n-------------------------------step: " + count + "-------------------------------");
        currentIndex = indexStack[indexStack.length - 1];
        currentNode = treeNodes[currentIndex];
        currentChildren = currentNode.children 
        nChildren = currentChildren.length;
        if (childIndex < nChildren) {
            indexStack.push(currentNode.children[childIndex]);
            childIndex = 0;
            continue;
        }
        yPosition = offsetY - yStep * (currentNode.depth + 1);
        if (nChildren) {
            nodeType = "stem";
            post("\n leftmost child " + childPositions[currentChildren[0]]);
            post("\n rightmost child " + childPositions[currentChildren[nChildren-1]]);
            xPosition = (childPositions[currentChildren[0]] + childPositions[currentChildren[nChildren-1]]) / 2 ;
            
            sketch.glcolor(lrgb[0],lrgb[1],lrgb[2],lrgb[3]);
            childY = yPosition - yStep;
            for(i=0;i<currentNode.children.length;i++) {
                childX = childPositions[currentNode.children[i]];
                sketch.linesegment(childX,childY,0., xPosition,yPosition,0.);
                post("\ndrew line from child " + i + " at "+childX + " " + childY);
            }
        }
        else {
            nodeType = "leaf";
            xPosition = xStep * (++leafIndex) - offsetX;
            //leafIndex++;
        }
        sketch.moveto(xPosition, yPosition, 0.);
        sketch.glcolor(nrgb[0],nrgb[1],nrgb[2],nrgb[3]);
        sketch.ellipse(rX, rY);
        
        post("\ndrew "+nodeType+" node at " + xPosition + " " + yPosition);
        if(currentIndex === state.index) {
            sketch.glcolor(hrgb[0],hrgb[1],hrgb[2],hrgb[3]);
            sketch.quad(
                xPosition-rX, yPosition-rY, 0.,
                xPosition+rX, yPosition-rY, 0.,
                xPosition+rX, yPosition+rY, 0.,
                xPosition-rX, yPosition+rY, 0.);
        }
        childPositions[currentIndex] = xPosition;
        
        post("\nset childPosition at "+currentIndex+" to " + xPosition);
        childIndex = currentNode.order + 1;
        indexStack.pop();
        printNodeInfo(currentIndex);
    }
}