// initialize canvas, selects and buttons
// TODO initialize all
let canvas;
let countrySelect;
let motifSelect;
let symmetrySelect;
let colorsSelect;
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
// QUESTION set appropriate size for export (ask Felix Michel)
//console.log('aspect ratio: ', pcWidth / pcHeight);
// TODO 2 canvases: https://p5js.org/examples/advanced-canvas-rendering-multiple-canvases/

// define cell
let cellWidth;
let cellHeight;
let nCells;
let nCellsAdditional;
let initialCellPositionX;
let initialCellPositionY;

// motif properties
// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt(); // radius
let r;
let alphaScale = d3.scaleLinear(); // transparency
let alpha;
let areaScale = d3.scaleLinear(); // area of triangle
let area;

// motif and cell position
let x;
let y;
let rowCount;
let rowIndent;

// colors
let colors;
let order = [
  'gccs_government',
  'gccs_wtp_belief', 
  'gccs_norm', 
  'gccs_wtp', 
];
let initialCellRotation = 0;

function setup() {
  canvas = createCanvas(800, 560, SVG);
  canvas.parent(document.querySelector('.canvas-container'));
  noLoop();
            
  // Get references to HTML elements
  // QUESTION Where to define button, html or p5?
  countrySelectHTML = document.getElementById('country');
  countrySelect = select('#country');
  cellWidthInputHTML = document.getElementById('cellwidth');
  cellWidthInput = select('#cellwidth');
  cellHeightInputHTML = document.getElementById('cellheight');
  cellHeightInput = select('#cellheight');
  motifRatioInputHTML = document.getElementById('motifratio');
  motifRatioInput = select('#motifratio');
  nAddCellsInputHTML = document.getElementById('naddcells');
  nAddCellsInput = select('#naddcells');
  rowIndentInputHTML = document.getElementById('rowindent');
  rowIndentInput = select('#rowindent');
  showGridHTML = document.getElementById('showgrid');
  showGrid = select('#showgrid');

  symmetrySelectHTML = document.getElementById('symmetry');
  symmetrySelect = select('#symmetry');

  motifSelectHTML = document.getElementById('motif');
  motifSelect = select('#motif');
  color1HTML = document.getElementById('color1');
  color1 = select('#color1');
  color2HTML = document.getElementById('color2');
  color2 = select('#color2');
  color3HTML = document.getElementById('color3');
  color3 = select('#color3');
  color4HTML = document.getElementById('color4');
  color4 = select('#color4');

  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  countrySelectHTML.addEventListener('change', updatePostcard);
  cellWidthInputHTML.addEventListener('change', updateGrid);
  cellHeightInputHTML.addEventListener('change', updateGrid);
  motifRatioInputHTML.addEventListener('change', updateGrid);
  nAddCellsInputHTML.addEventListener('change', updateGrid);
  rowIndentInputHTML.addEventListener('change', updatePostcard);
  showGridHTML.addEventListener('change', updatePostcard);
  symmetrySelectHTML.addEventListener('change', updatePostcard);
  motifSelectHTML.addEventListener('change', updatePostcard);
  color1HTML.addEventListener('change', updateColors);
  color2HTML.addEventListener('change', updateColors);
  color3HTML.addEventListener('change', updateColors);
  color4HTML.addEventListener('change', updateColors);
  exportButton.addEventListener('click', exportCanvas);

  // Initialize grid
  updateGrid();
            
  // Colors
  updateColors();

  // Load data
  d3.dsv(";", "data/gccs_country_with_temperature_and_gdp.csv", d3.autoType).then(function(csv) {
    data = csv;
    //console.log("Data loaded:", data);

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
  nCellsAdditional = parseFloat(nAddCellsInput.value());
  let nCellsWidth = Math.ceil(width / cellWidth) + 2*nCellsAdditional;
  let nCellsHeight = Math.ceil(height / cellHeight) + 2*nCellsAdditional;
  nCells = nCellsWidth * nCellsHeight;
  initialCellPositionX = - cellWidth*nCellsAdditional;
  initialCellPositionY = - cellHeight*nCellsAdditional;
  console.log('nCells: ' + nCells, 'pcWidth: ' + width + ', pcHeight: ' + height);

  // Motif ratio
  motifRatio = parseFloat(motifRatioInput.value());

  // Motif properties
  rScale
    .domain([0, 100])
    .range([1, Math.min(cellWidth, cellHeight) * motifRatio]);
  alphaScale
    .domain([0, 100])
    .range([0, 255]);
  areaScale
    .domain([0, 100])
    .range([0, cellWidth*cellWidth/4]) // gleichschenkliges Dreieck, Hypothenuse = cellWidth, cellWidth=cellHeight

  redraw();

}

function updateColors() {
  colors = {
    'gccs_wtp': color(color1.value()),
    'gccs_wtp_belief': color(color2.value()),
    'gccs_norm': color(color3.value()),
    'gccs_government': color(color4.value()),
  }
  //console.log(colors);

  redraw();

}

function updatePostcard() {
  
  selectedCountry = countrySelect.value();
  selectedData = data.filter(d => d.country === selectedCountry);
  console.log("Filtered data for", selectedCountry, selectedData);

  redraw();
  
}
        
function draw() {
  background(255);

  rowIndent = parseFloat(rowIndentInput.value());

  // initialize
  rectMode(TOP, LEFT);
  x = initialCellPositionX;
  y = initialCellPositionY;
  rowCount = 1;

  // draw pattern
  for (let i = 0; i < nCells; i++) {

    // draw grid cell
    if (showGrid.checked()) {
      drawGridCell();
    }

    // draw motif
    // TODO other symmetriy operations
    // TODO draw motif in separate for loop?
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    if (symmetrySelect.value() === '180degreeRotations') {
      rotate(initialCellRotation + i*PI);
    } else if (symmetrySelect.value() === '90degreeRotations') {
      rotate(initialCellRotation + i*PI/2);
    }
    drawMotif();
    pop();

    // move to next cell: translation from left to right, top to bottom
    doTranslation();

  }

}

function drawGridCell() {

  noFill();
  stroke(100);
  strokeWeight(0.2);
  rect(x, y, cellWidth, cellHeight);

}

// TODO select from html
function drawMotif() {
  //console.log('drawMotif at x: ' + x + ', y: ' + y);
  if (motifSelect.value() === 'windwheelMotif') {
    windwheelMotif();
  } else if (motifSelect.value() === 'flowerMotif') {
    flowerMotif();
  } else if (motifSelect.value() === 'arcMotif') {
    arcMotif();
  } else if (motifSelect.value() === 'arcMotif2') {
    arcMotif2();
  } else if (motifSelect.value() === 'circlesMotif') {
    circlesMotif();
  } else if (motifSelect.value() === 'alphaMotif') {
    alphaMotif();
  }

}

function doTranslation() {

  // planar Symmetry operation: 3.1 translation
    x = x + cellWidth;
    if (x >= width) {
      x = initialCellPositionX + ((rowCount*rowIndent) % 1)*cellWidth;
      y += cellHeight;
      rowCount +=1;
    }
}

function exportCanvas() {
    save('postcard', 'svg');
}




// -----------------------------------------------------------------
// Motifs

function windwheelMotif() {
  // isosceles (gleichschenklige) triangles adjusting length of hypotenuse

  stroke(0);
  strokeWeight(0);

  //let xCenter = x + cellWidth/2;
  //let yCenter = y + cellHeight/2;
  let adjustedHypotenuse;
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      fill(colors[selVar]);
      area = areaScale(selectedData[0][selVar]);
      adjustedHypotenuse = 4*area / cellWidth;
      push();
      //translate(xCenter, yCenter);
      rotate(initialRotation + i*PI/2);
      triangle(
        0, 0, 
        - adjustedHypotenuse/2, -cellHeight/2,
        + adjustedHypotenuse/2, -cellHeight/2,
      );
    pop();

    }
  }
}


// TODO how to make petal size dependant on values?
function flowerMotif() {

  stroke(0);
  strokeWeight(0);

  //let xCenter = x + cellWidth/2;
  //let yCenter = y + cellHeight/2;
  let factorCW = 5;
  let factorCH = 4.15;
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      fill(colors[selVar]);
      area = areaScale(selectedData[0][selVar]);
      adjustedHypotenuse = 4*area / cellWidth;
      push();
      //translate(xCenter, yCenter);
      rotate(initialRotation + i*PI/2);
      curve(
        - factorCW*cellWidth, factorCH*cellHeight, 
        0, 0,
        0, 0,
        factorCW*cellWidth, factorCH*cellHeight
      )
      pop();

    }
  }
}

function arcMotif() {

  noStroke();
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      fill(colors[selVar]);
      r = rScale(selectedData[0][selVar]);
      push();
      //translate(x + cellWidth/2, y + cellHeight/2);
      rotate(initialRotation + i*PI/2);
      arc(0, 0, r, r, 0, PI/2);
      pop();

    }
  }
}

function arcMotif2() {

  noStroke();

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    fill(colors['gccs_wtp']);
    arc(0, 0, r, r, -PI/2, 0);
    //arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    fill(colors['gccs_wtp_belief']);
    arc(cellWidth/2, 0, r, r, PI/2, PI);
    //arc(x + cellWidth, y + cellHeight/2, r, r, PI/2, PI);
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    fill(colors['gccs_norm']);
    arc(-cellWidth/2, cellHeight/2, r, r, -PI/2, 0);
    //arc(x, y + cellHeight, r, r, -PI/2, 0);
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    fill(colors['gccs_government']);
    //arc(x + cellWidth/2, y, r, r, PI/2, PI);
    arc(0, -cellHeight/2, r, r, PI/2, PI);
  }
}


function circlesMotif() {

  noFill();
  strokeWeight(2);
  let selVar;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      stroke(colors[selVar]);
      r = rScale(selectedData[0][selVar]);
      push();
      //translate(x + cellWidth/2, y + cellHeight/2);
      ellipse(0, 0, r, r);
      pop();

    }
  }
}

function alphaMotif() {

  noStroke();
  let c = [];

  // wtp
  if (selectedData[0].gccs_wtp) {
    alpha = alphaScale(selectedData[0].gccs_wtp);
    c = [...colors['gccs_wtp'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    rect(0, -cellHeight/2, cellWidth/2, cellHeight/2);
    pop();
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    alpha = alphaScale(selectedData[0].gccs_wtp_belief);
    c = [...colors['gccs_wtp_belief'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    rect(0, 0, cellWidth/2, cellHeight/2);
    pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    alpha = alphaScale(selectedData[0].gccs_norm);
    c = [...colors['gccs_norm'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    rect(-cellWidth/2, 0, cellWidth/2, cellHeight/2);
    pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    alpha = alphaScale(selectedData[0].gccs_government);
    c = [...colors['gccs_government'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    rect(-cellWidth/2, -cellHeight/2, cellWidth/2, cellHeight/2);
    pop();
  }
}
