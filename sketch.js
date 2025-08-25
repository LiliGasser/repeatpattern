// initialize canvas, selects and buttons
let canvas;
let countrySelect
let motifSelect
let symmetrySelect
let colorsSelect
let exportButton;

// initialize data structure
// TODO might need to be the whole array
let gccsValues;

// define postcard size (A5 postcard: 210mm x 148mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
let pcWidthMM = 210; // mm
let pcHeightMM = 148; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);
// TODO use to set good size for export (ask Webvisu guy)
//console.log('aspect ratio: ', pcWidth / pcHeight);

// define cell
let cellWidth = 40;
let cellHeight = 40;
let nCells;
// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt();
let r;
        
function setup() {
  canvas = createCanvas(800, 560, SVG);
  canvas.parent(document.querySelector('.canvas-container'));
            
  // Get references to HTML elements
  countrySelect = document.getElementById('country');
  motifSelect = document.getElementById('motif');
  symmetrySelect = document.getElementById('symmetry');
  colorsSelect = document.getElementById('colors');
  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  exportButton.addEventListener('click', exportCanvas);
            
  // Set initial drawing properties
  strokeCap(ROUND);
  strokeJoin(ROUND);

  // Load data
  d3.dsv(";", "data/gccs_country_with_temperature_and_gdp.csv", d3.autoType).then(function(data) {
    console.log("Data loaded:", data);

    dataCountry = data.filter(d => d.country === 'Switzerland');
    console.log("Filtered data for a country:", dataCountry);
    gccsValues = {
      temperature: dataCountry[0].temperature,
      gdp: dataCountry[0].gdp,
      wtp: dataCountry[0].gccs_wtp,
      wtp_belief: dataCountry[0].gccs_wtp_belief,
      norm: dataCountry[0].gccs_norm,
      government: dataCountry[0].gccs_government,
    }
    console.log(gccsValues);
    
  });
  
  // TODO test for cell sizes where multiplication with width and height does not result in integer values
  nCells = Math.ceil(width / cellWidth) * Math.ceil(height / cellHeight);
  console.log('nCells: ' + nCells, 'pcWidth: ' + width + ', pcHeight: ' + height);

  rScale.domain([0, 100]).range([1, Math.min(cellWidth, cellHeight) * 0.8]);
}
        
function draw() {
  background(240);
  
  // initialize
  rectMode(TOP, LEFT);
  let x = 0;
  let y = 0;

  // draw pattern
  for (let i = 0; i < nCells; i++) {

    // draw grid
    drawGrid(x, y);

    // draw motif
    // TODO draw motif in separate for loop?
    drawMotif(x, y);

    // move to next cell: planar symmetry with translation
    // TODO other symmetriy operations
    x = x + cellWidth;
    if (x >= width) {
      x = 0;
      y += cellHeight;
    }

  }

}

function drawGrid(x, y) {

  noFill();
  stroke(100);
  strokeWeight(0.2);
  rect(x, y, cellWidth, cellHeight);

}

function drawMotif(x, y) {
  //console.log('drawMotif at x: ' + x + ', y: ' + y);
  noStroke();

  // wtp
  r = rScale(gccsValues.wtp);
  fill(100, 150, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);

  // wtp_belief
  r = rScale(gccsValues.wtp_belief);
  fill(100, 0, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, 0, PI/2);

  // norm
  r = rScale(gccsValues.norm);
  fill(0, 100, 150);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI/2, PI);

  // government
  r = rScale(gccsValues.government);
  fill(100, 0, 200);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI, -PI/2);

}

function exportCanvas() {
    save('postcard', 'svg');
}
