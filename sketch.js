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
let nRows;
let rowIndent;

// colors
let colors;
        
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
  showGridHTML = document.getElementById('showgrid');
  showGrid = select('#showgrid');

  symmetrySelect = document.getElementById('symmetry');

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

  colorsSelect = document.getElementById('colors');
  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  countrySelectHTML.addEventListener('change', updatePostcard);
  cellWidthInputHTML.addEventListener('change', updateGrid);
  cellHeightInputHTML.addEventListener('change', updateGrid);
  motifRatioInputHTML.addEventListener('change', updateGrid);
  rowIndentInputHTML.addEventListener('change', updatePostcard);
  showGridHTML.addEventListener('change', updatePostcard);
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
  console.log(colors);

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
  x = 0;
  y = 0;
  nRows = 1;

  // draw pattern
  for (let i = 0; i < nCells; i++) {

    // draw grid cell
    if (showGrid.checked()) {
      drawGridCell();
    }

    // draw motif
    // TODO draw motif in separate for loop?
    drawMotif();

    // move to next cell: planar symmetry with translation
    // TODO other symmetriy operations
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
      x = 0 + ((nRows*rowIndent) % 1)*cellWidth;
      y += cellHeight;
      nRows +=1;
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

  let xCenter = x + cellWidth/2;
  let yCenter = y + cellHeight/2;
  let adjustedHypotenuse;

  // wtp
  if (selectedData[0].gccs_wtp) {
    fill(colors['gccs_wtp']);
    area = areaScale(selectedData[0]['gccs_wtp']);
    console.log('area wtp: ', area);
    adjustedHypotenuse = 4*area / cellWidth;
    push();
    translate(xCenter, yCenter);
    triangle(
      0, 0, 
      - adjustedHypotenuse/2, -cellHeight/2,
      + adjustedHypotenuse/2, -cellHeight/2,
    );
    pop();

  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    fill(colors['gccs_wtp_belief']);
    area = areaScale(selectedData[0]['gccs_wtp_belief']);
    console.log('area wtp belief: ', area);
    adjustedHypotenuse = 4*area / cellHeight;
    push();
    translate(xCenter, yCenter);
    rotate(PI/2);
    triangle(
      0, 0, 
      - adjustedHypotenuse/2, -cellHeight/2,
      + adjustedHypotenuse/2, -cellHeight/2,
    );
    pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    fill(colors['gccs_norm']);
    area = areaScale(selectedData[0]['gccs_norm']);
    adjustedHypotenuse = 4*area / cellWidth;
    push();
    translate(xCenter, yCenter);
    rotate(PI);
    triangle(
      0, 0, 
      - adjustedHypotenuse/2, -cellHeight/2,
      + adjustedHypotenuse/2, -cellHeight/2,
    );
    pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    fill(colors['gccs_government']);
    area = areaScale(selectedData[0]['gccs_government']);
    adjustedHypotenuse = 4*area / cellHeight;
    push();
    translate(xCenter, yCenter);
    rotate(-PI/2);
    triangle(
      0, 0, 
      - adjustedHypotenuse/2, -cellHeight/2,
      + adjustedHypotenuse/2, -cellHeight/2,
    );
    pop();
  }
}

function windwheelMotif_old() {
  // isosceles (gleichschenklige) triangles adjusting length of hypotenuse

  stroke(0);
  strokeWeight(0);

  let xCenter = x + cellWidth/2;
  let yCenter = y + cellHeight/2;
  let adjustedHypotenuse;

  // wtp
  if (selectedData[0].gccs_wtp) {
    fill(colors.wtp);
    area = areaScale(selectedData[0].gccs_wtp);
    console.log('area wtp: ', area);
    adjustedHypotenuse = 4*area / cellWidth;
    triangle(
      xCenter, yCenter, 
      xCenter - adjustedHypotenuse/2, y,
      xCenter + adjustedHypotenuse/2, y,
    );

  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    fill(colors.wtp_belief)
    area = areaScale(selectedData[0].gccs_wtp_belief);
    console.log('area wtp belief: ', area);
    adjustedHypotenuse = 4*area / cellHeight;
    triangle(
      xCenter, yCenter, 
      x + cellWidth, yCenter - adjustedHypotenuse/2,
      x + cellWidth, yCenter + adjustedHypotenuse/2,
    );
  }

  // norm
  if (selectedData[0].gccs_norm) {
    fill(colors.norm);
    area = areaScale(selectedData[0].gccs_norm);
    console.log('area norm: ', area);
    adjustedHypotenuse = 4*area / cellWidth;
    triangle(
      xCenter, yCenter, 
      xCenter - adjustedHypotenuse/2, y + cellHeight,
      xCenter + adjustedHypotenuse/2, y + cellHeight,
    );
  }

  // government
  if (selectedData[0].gccs_government) {
    fill(colors.government);
    area = areaScale(selectedData[0].gccs_government);
    console.log('area wtp belief: ', area);
    adjustedHypotenuse = 4*area / cellHeight;
    triangle(
      xCenter, yCenter, 
      x, yCenter - adjustedHypotenuse/2,
      x, yCenter + adjustedHypotenuse/2,
    );
  }
}

// TODO how to make petal size dependant on values?
function flowerMotif() {

  stroke(0);
  strokeWeight(0);

  let xCenter = x + cellWidth/2;
  let yCenter = y + cellHeight/2;
  let factorCW = 5;
  let factorCH = 4.15;

  // wtp
  if (selectedData[0].gccs_wtp) {
    fill(colors['gccs_wtp']);
    push();
    translate(xCenter, yCenter);
    curve(
      - factorCW*cellWidth, factorCH*cellHeight, 
      0, 0,
      0, 0,
      factorCW*cellWidth, factorCH*cellHeight
    )
    pop();
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    fill(colors['gccs_wtp_belief'])
    push();
    translate(xCenter, yCenter);
    rotate(PI/2);
    curve(
      - factorCW*cellWidth, factorCH*cellHeight, 
      0, 0,
      0, 0,
      factorCW*cellWidth, factorCH*cellHeight
    )
    pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    fill(colors['gccs_norm']);
    push();
    translate(xCenter, yCenter);
    rotate(PI);
    curve(
      - factorCW*cellWidth, factorCH*cellHeight, 
      0, 0,
      0, 0,
      factorCW*cellWidth, factorCH*cellHeight
    )
    pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    fill(colors['gccs_government']);
    push();
    translate(xCenter, yCenter);
    rotate(-PI/2);
    curve(
      - factorCW*cellWidth, factorCH*cellHeight, 
      0, 0,
      0, 0,
      factorCW*cellWidth, factorCH*cellHeight
    )
    pop();
  }
}

function arcMotif() {

  noStroke();

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    fill(colors['gccs_wtp']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    arc(0, 0, r, r, -PI/2, 0);
    pop();
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    fill(colors['gccs_wtp_belief']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    rotate(PI/2);
    arc(0, 0, r, r, -PI/2, 0);
    pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    fill(colors['gccs_norm']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    rotate(PI);
    arc(0, 0, r, r, -PI/2, 0);
    pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    fill(colors['gccs_government']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    rotate(-PI/2);
    arc(0, 0, r, r, -PI/2, 0);
    pop();
  }
}

function arcMotif2() {

  noStroke();

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    fill(colors['gccs_wtp']);
    arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    fill(colors['gccs_wtp_belief']);
    arc(x + cellWidth, y + cellHeight/2, r, r, PI/2, PI);
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    fill(colors['gccs_norm']);
    arc(x, y + cellHeight, r, r, -PI/2, 0);;
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    fill(colors['gccs_government']);
    arc(x + cellWidth/2, y, r, r, PI/2, PI);
  }
}


function circlesMotif() {

  noFill();
  strokeWeight(1);

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    stroke(colors['gccs_wtp']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    ellipse(0, 0, r, r);
    pop(); 
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    stroke(colors['gccs_wtp_belief']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    ellipse(0, 0, r, r);
    pop(); 
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    stroke(colors['gccs_norm']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    ellipse(0, 0, r, r);
    pop(); 
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    stroke(colors['gccs_government']);
    push();
    translate(x + cellWidth/2, y + cellHeight/2);
    ellipse(0, 0, r, r);
    pop();
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
    translate(x, y);
    rect(cellWidth/2, 0, cellWidth/2, cellHeight/2);
    pop();
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    alpha = alphaScale(selectedData[0].gccs_wtp_belief);
    c = [...colors['gccs_wtp_belief'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    translate(x, y);
    rect(cellWidth/2, cellHeight/2, cellWidth/2, cellHeight/2);
    pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    alpha = alphaScale(selectedData[0].gccs_norm);
    c = [...colors['gccs_norm'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    translate(x,y);
    rect(0, cellHeight/2, cellWidth/2, cellHeight/2);
    pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    alpha = alphaScale(selectedData[0].gccs_government);
    c = [...colors['gccs_government'].levels.slice(0,3), round(alpha,0)];
    fill(color(c));
    push();
    translate(x,y);
    rect(0, 0, cellWidth/2, cellHeight/2);
    pop();
  }
}
