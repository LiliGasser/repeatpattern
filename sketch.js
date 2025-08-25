// initialize canvas, selects and buttons
let canvas;
let countrySelect
let motifSelect
let symmetrySelect
let colorsSelect
let exportButton;

// initialize data structure
let data = [];
let selectedData = [];
let countries = [];

// define postcard size (A5 postcard: 210mm x 148mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
let pcWidthMM = 210; // mm
let pcHeightMM = 148; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);
// QUESTION set appropriate size for export (ask Webvisu guy)
//console.log('aspect ratio: ', pcWidth / pcHeight);
// TODO 2 canvases: https://p5js.org/examples/advanced-canvas-rendering-multiple-canvases/

// define cell
let cellWidth;
let cellHeight;
let nCells;

// motif size within cell
// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt();
let r;

// motif and cell position
let x;
let y;
let nRows;
let rowIndent;
        
function setup() {
  canvas = createCanvas(800, 560, SVG);
  canvas.parent(document.querySelector('.canvas-container'));
  noLoop();
            
  // Get references to HTML elements
  // QUESTION Where to define button, html or p5?
  countrySelectHTML = document.getElementById('country');
  countrySelect = select('#country');
  //console.log('countrySelect:', countrySelect);
  cellWidthInputHTML = document.getElementById('cellwidth');
  cellWidthInput = select('#cellwidth');
  cellHeightInputHTML = document.getElementById('cellheight');
  cellHeightInput = select('#cellheight');
  motifRatioInputHTML = document.getElementById('motifratio');
  motifRatioInput = select('#motifratio');
  rowIndentInputHTML = document.getElementById('rowindent');
  rowIndentInput = select('#rowindent');

  symmetrySelect = document.getElementById('symmetry');
  motifSelect = document.getElementById('motif');
  colorsSelect = document.getElementById('colors');
  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  countrySelectHTML.addEventListener('change', updatePostcard);
  cellWidthInputHTML.addEventListener('change', updateGrid);
  cellHeightInputHTML.addEventListener('change', updateGrid);
  motifRatioInputHTML.addEventListener('change', updateGrid);
  rowIndentInputHTML.addEventListener('change', updatePostcard);
  exportButton.addEventListener('click', exportCanvas);

  // Initialize grid
  updateGrid();
            
  // Load data
  d3.dsv(";", "data/gccs_country_with_temperature_and_gdp.csv", d3.autoType).then(function(csv) {
    data = csv;
    console.log("Data loaded:", data);

    // Get unique countries and add to select
    countries = data.map(d=>d.country);
    countries = [...new Set(countries)]; // remove duplicates
    let firstCountries = ['Switzerland', 'Germany'];
    for (let i = firstCountries.length - 1; i >= 0; i--) {
      let country = firstCountries[i];
      let index = countries.indexOf(country);
      if (index > -1) {
        countries.splice(index, 1);
        countries.unshift(country);
      }
    }
    for (let i = 0; i < countries.length; i++) {
      let country = countries[i];
      countrySelect.option(country);
    }

    // Draw initial postcard
    updatePostcard();

  });
  
}

function updateGrid() {

  // Calculate number of cells
  cellWidth = parseInt(cellWidthInput.value());
  cellHeight = parseInt(cellHeightInput.value());
  nCells = Math.ceil(width / cellWidth) * Math.ceil(height / cellHeight);
  console.log('nCells: ' + nCells, 'pcWidth: ' + width + ', pcHeight: ' + height);

  // Motif size
  motifRatio = parseFloat(motifRatioInput.value());
  rScale
    .domain([0, 100])
    .range([1, Math.min(cellWidth, cellHeight) * motifRatio]);

  redraw();

}

function updatePostcard() {
  selectedCountry = countrySelect.value();
  selectedData = data.filter(d => d.country === selectedCountry);
  console.log("Filtered data for", selectedCountry, selectedData);

  redraw();
}
        
function draw() {
  background(240);

  rowIndent = parseFloat(rowIndentInput.value());

  // initialize
  rectMode(TOP, LEFT);
  x = 0;
  y = 0;
  nRows = 1;

  // draw pattern
  for (let i = 0; i < nCells; i++) {

    // draw grid cell
    drawGridCell(x, y);

    // draw motif
    // TODO draw motif in separate for loop?
    drawMotif(x, y);

    // move to next cell: planar symmetry with translation
    // TODO other symmetriy operations
    doTranslation();

  }

}

function drawGridCell(x, y) {

  noFill();
  stroke(100);
  strokeWeight(0.2);
  rect(x, y, cellWidth, cellHeight);

}

function drawMotif(x, y) {
  //console.log('drawMotif at x: ' + x + ', y: ' + y);
  noStroke();

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    fill(100, 150, 0);
    arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    fill(100, 0, 0);
    arc(x + cellWidth/2, y + cellHeight/2, r, r, 0, PI/2);
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    fill(0, 100, 150);
    arc(x + cellWidth/2, y + cellHeight/2, r, r, PI/2, PI);
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    fill(100, 0, 200);
    arc(x + cellWidth/2, y + cellHeight/2, r, r, PI, -PI/2);
  }

}

function doTranslation() {

  // planar Symmetry operation: 3.1 translation
    x = x + cellWidth;
    if (x >= width) {
      x = 0 + ((nRows*rowIndent) % 1)*cellWidth;
      y += cellHeight;
      nRows +=1;
    }
}

function exportCanvas() {
    save('postcard', 'svg');
}
