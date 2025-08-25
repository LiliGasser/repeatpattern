let canvas;
let countrySelect
let motifSelect
let symmetrySelect
let colorsSelect
let exportButton;
        
function setup() {
    canvas = createCanvas(800, 600);
    canvas.parent(document.querySelector('.canvas-container'));
            
    // Get references to HTML elements
    countrySelect = document.getElementById('country');
    motifSelect = document.getElementById('motif');
    symmetrySelect = document.getElementById('symmetry');
    colorsSelect = document.getElementById('colors');
    exportButton = document.getElementById('exportButton');
            
    // Set initial background
    //updateBackground();
            
    // Add event listeners
    //backgroundSelect.addEventListener('change', updateBackground);
    exportButton.addEventListener('click', exportCanvas);
            
    // Set initial drawing properties
    strokeCap(ROUND);
    strokeJoin(ROUND);
}
        
function draw() {
    if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        //// Get current settings
        //let brushSize = parseInt(brushSizeSelect.value);
        //let colorValues = brushColorSelect.value.split(',');
        //let brushStyle = brushStyleSelect.value;
                
        //// Set color
        //stroke(parseInt(colorValues[0]), parseInt(colorValues[1]), parseInt(colorValues[2]));
        //strokeWeight(brushSize);
                
        //// Apply brush style
        //if (brushStyle === 'dotted') {
            //// Draw dots instead of lines
            //noStroke();
            //fill(parseInt(colorValues[0]), parseInt(colorValues[1]), parseInt(colorValues[2]));
            //circle(mouseX, mouseY, brushSize);
        //} else if (brushStyle === 'dashed') {
            //// Draw dashed line effect
            //if (frameCount % 3 === 0) {
                //line(pmouseX, pmouseY, mouseX, mouseY);
            //}
        //} else if (brushStyle === 'rough') {
            //// Add some randomness for rough effect
            //for (let i = 0; i < 3; i++) {
                //let offsetX = random(-brushSize/2, brushSize/2);
                //let offsetY = random(-brushSize/2, brushSize/2);
                //point(mouseX + offsetX, mouseY + offsetY);
            //}
        //} else {
            //// Normal line
            //line(pmouseX, pmouseY, mouseX, mouseY);
        //}
    }
}
        
function updateBackground() {
    let bgValues = backgroundSelect.value.split(',');
    background(parseInt(bgValues[0]), parseInt(bgValues[1]), parseInt(bgValues[2]));
}
        
function exportCanvas() {
    saveCanvas('my-drawing', 'png');
}
        
// Clear canvas when 'C' key is pressed
function keyPressed() {
    if (key === 'c' || key === 'C') {
        updateBackground();
    }
}