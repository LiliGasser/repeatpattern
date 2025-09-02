// initialize canvas, selects and buttons
let sketch1Instance;
let sketch2Instance;
let canvas;
let countrySelect;
let cellWidthInput;
let cellHightInput;
let motifRatioInput;
let nAddCellsInput;
let rowIndentInput;
let showGrid;
let symmetrySelect;
let motifSelect;
let color1;
let color2;
let color3;
let color4;
let exportButton;

// initialize data structure
let data = [];
let selectedData = [];
let countries = [];

// define postcard size (A5 postcard: 148mm x 105mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
let pcWidthMM = 148; // mm
let pcHeightMM = 105; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);
// To set appropriate size for export, Felix would do it as I did already.
// For printing, pdf is better than svg.
//console.log('aspect ratio: ', pcWidth / pcHeight);
// TODO 2 canvases: https://p5js.org/examples/advanced-canvas-rendering-multiple-canvases/
// Does something similar as is needed in Vue

// define cell
let cellWidth;
let cellHeight;
let nCells;
let nCellsAdditional;
let initialCellPositionX;
let initialCellPositionY;

// define motif canvas size
let mWidth = 200;
let mHeight = 200;

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
let initialCellRotation = 0;
// TODO set order of variables in UI
let order = [
  'gccs_government',
  'gccs_wtp_belief', 
  'gccs_norm', 
  'gccs_wtp', 
];

// colors
let colors;


function loadData(p) {
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

    // Select country and draw initial postcard
    selectCountry(p);

  });  
}

function initializeSelectsAndButtons(p) {

  // It is better to define button in html and select in p5
  let countrySelectHTML = document.getElementById('country');
  countrySelect = p.select('#country');
  let cellWidthInputHTML = document.getElementById('cellwidth');
  cellWidthInput = p.select('#cellwidth');
  let cellHeightInputHTML = document.getElementById('cellheight');
  cellHeightInput = p.select('#cellheight');
  let motifRatioInputHTML = document.getElementById('motifratio');
  motifRatioInput = p.select('#motifratio');
  let nAddCellsInputHTML = document.getElementById('naddcells');
  nAddCellsInput = p.select('#naddcells');
  let rowIndentInputHTML = document.getElementById('rowindent');
  rowIndentInput = p.select('#rowindent');
  let showGridHTML = document.getElementById('showgrid');
  showGrid = p.select('#showgrid');

  let symmetrySelectHTML = document.getElementById('symmetry');
  symmetrySelect = p.select('#symmetry');

  let motifSelectHTML = document.getElementById('motif');
  motifSelect = p.select('#motif');
  let color1HTML = document.getElementById('color1');
  color1 = p.select('#color1');
  let color2HTML = document.getElementById('color2');
  color2 = p.select('#color2');
  let color3HTML = document.getElementById('color3');
  color3 = p.select('#color3');
  let color4HTML = document.getElementById('color4');
  color4 = p.select('#color4');

  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  countrySelectHTML.addEventListener('change', function(event) {
    selectCountry(p);
  });
  cellWidthInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  });
  cellHeightInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  });
  motifRatioInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  });
  nAddCellsInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  });
  rowIndentInputHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  showGridHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  symmetrySelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  motifSelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  color1HTML.addEventListener('change', function(event) {
    updateColors(p);
  });
  color2HTML.addEventListener('change', function(event) {
    updateColors(p);
  });
  color3HTML.addEventListener('change', function(event) {
    updateColors(p);
  });
  color4HTML.addEventListener('change', function(event) {
    updateColors(p);
  });
  exportButton.addEventListener('click', function(event) {
    exportCanvas(p);
  });

}

function sketch1(p) {
  p.setup = function () {
    canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

    // Get references to HTML elements
    //initializeSelectsAndButtons(p);

    // Initialize grid
    //updateGrid(p);
            
    // Colors
    //updateColors(p);

    // Load data
    //loadData(p);


  };

  p.draw = function () {
    p.background(255);

    // initialize
    p.rectMode(p.TOP, p.LEFT);
    x = initialCellPositionX;
    y = initialCellPositionY;
    rowCount = 1;
    rowIndent = parseFloat(rowIndentInput.value());

    // draw pattern
    for (let i = 0; i < nCells; i++) {
      console.log(x, y);

      // draw grid cell
      if (showGrid.checked()) {
        drawGridCell(p);
      }

      // draw motif
      // TODO other symmetriy operations
      // TODO draw motif in separate for loop?
      if (selectedData.length > 0) {
//        console.log("in sketch1 draw")
        p.push();
        p.translate(x + cellWidth/2, y + cellHeight/2);
        if (symmetrySelect.value() === '180degreeRotations') {
          p.rotate(initialCellRotation + i*p.PI);
        } else if (symmetrySelect.value() === '90degreeRotations') {
          p.rotate(initialCellRotation + i*p.PI/2);
        }
        drawMotif(p);
        p.pop();
      }

      // move to next cell: translation from left to right, top to bottom
      doTranslation();

    }

    // add text for country
    if (selectedData.length > 0) {
      addCountryText(p);

    }
  }
}

function sketch2(p) {
  p.setup = function() {
    canvas = p.createCanvas(mWidth, mHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

  }

  p.draw = function () {
    p.background(255);

    // initialize
    p.rectMode(p.TOP, p.LEFT);
    let xMotif = 0;
    let yMotif = 0;
    p.ellipse(xMotif, yMotif, 10, 10);

    // draw motif
    // TODO move to a function
    // TODO other symmetriy operations
    if (selectedData.length > 0) {
      console.log("in sketch2 draw")
//      applySymmetry(p);
      p.push();
      p.translate(xMotif + cellWidth/2, yMotif + cellHeight/2);
      if (symmetrySelect.value() === '180degreeRotations') {
        p.rotate(initialCellRotation + i*p.PI);
      } else if (symmetrySelect.value() === '90degreeRotations') {
        p.rotate(initialCellRotation + i*p.PI/2);
      }
      drawMotif(p);
      p.pop();
    }

  }
}


// TODO good positioning of canvases
console.log("new sketch2")
//sketch2Instance = new p5(sketch2);
console.log("new sketch1")
sketch1Instance = new p5(sketch1);
console.log("init sketch 1 buttons")
initializeSelectsAndButtons(sketch1Instance);
console.log("init sketch 2 buttons")
//initializeSelectsAndButtons(sketch2Instance);
console.log("update grid")
updateGrid(sketch1Instance);
console.log("upate colors")
updateColors(sketch1Instance);
console.log("load data")
loadData(sketch1Instance);
console.log("done")


function applySymmetry() {

}

function updateScales() {
  rScale
    .domain([0, 100])
    .range([1, Math.min(cellWidth, cellHeight) * motifRatio]);
  alphaScale
    .domain([0, 100])
    .range([0, 255]);
  areaScale
    .domain([0, 100])
    .range([0, cellWidth*cellWidth/4]) // gleichschenkliges Dreieck, Hypothenuse = cellWidth, cellWidth=cellHeight

}

function updateGrid(p) {

  // Calculate number of cells
  cellWidth = parseInt(cellWidthInput.value());
  cellHeight = parseInt(cellHeightInput.value());
  nCellsAdditional = parseFloat(nAddCellsInput.value());
  let nCellsWidth = Math.ceil(pcWidth / cellWidth) + 2*nCellsAdditional;
  let nCellsHeight = Math.ceil(pcHeight / cellHeight) + 2*nCellsAdditional;
  nCells = nCellsWidth * nCellsHeight;
  initialCellPositionX = - cellWidth*nCellsAdditional;
  initialCellPositionY = - cellHeight*nCellsAdditional;
  console.log('nCells: ' + nCells, 'pcWidth: ' + pcWidth + ', pcHeight: ' + pcHeight);

  // Motif ratio
  motifRatio = parseFloat(motifRatioInput.value());

  // Motif properties
  updateScales();

  p.redraw();

}

function updateColors(p) {
  colors = {
    'gccs_wtp': p.color(color1.value()),
    'gccs_wtp_belief': p.color(color2.value()),
    'gccs_norm': p.color(color3.value()),
    'gccs_government': p.color(color4.value()),
  }
  //console.log(colors);

  p.redraw();

}

function selectCountry(p) {
  selectedCountry = countrySelect.value();
  selectedData = data.filter(d => d.country === selectedCountry);
  console.log("Filtered data for", selectedCountry, selectedData);

  p.redraw();

}

function updatePostcard(p) {
  
  p.redraw();
  
}
        
function drawGridCell(p) {

//  console.log('grid', x,y);
  p.rectMode(p.TOP, p.LEFT);
  p.noFill();
  p.stroke(100);
  p.strokeWeight(0.2);
  p.rect(
    x - cellWidth/2 + ((rowCount*rowIndent) % 1)*cellWidth, 
    y-cellWidth/2, 
    cellWidth, 
    cellHeight
  );

}

// TODO select from html
function drawMotif(p) {
  //console.log('drawMotif at x: ' + x + ', y: ' + y);
  if (motifSelect.value() === 'windwheelMotif') {
    windwheelMotif(p);
  } else if (motifSelect.value() === 'flowerMotif') {
    flowerMotif(p);
  } else if (motifSelect.value() === 'arcMotif') {
    arcMotif(p);
  } else if (motifSelect.value() === 'arcMotif2') {
    arcMotif2(p);
  } else if (motifSelect.value() === 'circlesMotif') {
    circlesMotif(p);
  } else if (motifSelect.value() === 'alphaMotif') {
    alphaMotif(p);
  }

}

function addCountryText(p) {

  // text properties
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(48);
  let txtWidth = p.textWidth(selectedCountry);
  let txtHeight = p.textAscent() + p.textDescent();
  let paddingX = 40;
  let paddingY = 3;
  // white rectangle around text
  p.fill(255, 200);
  p.noStroke();
  p.rectMode(p.CENTER);
  p.rect(
    pcWidth - (txtWidth + 2*paddingX)/2, 
    pcHeight - (txtHeight + 2*paddingY)/2, 
    //pcWidth/2,
    //pcHeight/2, 
    txtWidth + 2*paddingX, 
    txtHeight + 2*paddingY,
  );
  // text
  p.fill(50);
  // TODO choose font
  p.textFont("Georgia");
  p.text(
    selectedCountry, 
    pcWidth - (txtWidth + 2*paddingX)/2, 
    pcHeight - (txtHeight + 2*paddingY)/2, 
    //pcWidth/2,
    //pcHeight/2, 
  );
}

function doTranslation() {

  // move to next cell: translation from left to right, top to bottom
    x = x + cellWidth;
    if (x >= pcWidth) {
      x = initialCellPositionX + ((rowCount*rowIndent) % 1)*cellWidth;
      y += cellHeight;
      rowCount +=1;
    }
}

function exportCanvas(p) {
    p.save('postcard', 'svg');
}




// -----------------------------------------------------------------
// Motifs

function windwheelMotif(p) {
  // isosceles (gleichschenklige) triangles adjusting length of hypotenuse

  p.stroke(0);
  p.strokeWeight(0);

  let adjustedHypotenuse;
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      p.fill(colors[selVar]);
      area = areaScale(selectedData[0][selVar]);
      adjustedHypotenuse = 4*area / cellWidth;
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      p.triangle(
        0, 0, 
        - adjustedHypotenuse/2, -cellHeight/2,
        + adjustedHypotenuse/2, -cellHeight/2,
      );
    p.pop();

    }
  }
}


// TODO how to make petal size dependant on values?
function flowerMotif(p) {

  p.stroke(0);
  p.strokeWeight(0);

  let factorCW = 5;
  let factorCH = 4.15;
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      p.fill(colors[selVar]);
      area = areaScale(selectedData[0][selVar]);
      adjustedHypotenuse = 4*area / cellWidth;
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      p.curve(
        -factorCW*cellWidth, factorCH*cellHeight, 
        0, 0,
        0, 0,
        factorCW*cellWidth, factorCH*cellHeight
      )
      p.pop();

    }
  }
}

function arcMotif(p) {

  p.noStroke();
  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      p.fill(colors[selVar]);
      r = rScale(selectedData[0][selVar]);
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      p.arc(0, 0, r, r, 0, p.PI/2);
      p.pop();

    }
  }
}

function arcMotif2(p) {

  p.noStroke();

  // wtp
  if (selectedData[0].gccs_wtp) {
    r = rScale(selectedData[0].gccs_wtp);
    p.fill(colors['gccs_wtp']);
    p.arc(0, 0, r, r, -p.PI/2, 0);
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    r = rScale(selectedData[0].gccs_wtp_belief);
    p.fill(colors['gccs_wtp_belief']);
    p.arc(cellWidth/2, 0, r, r, p.PI/2, p.PI);
  }

  // norm
  if (selectedData[0].gccs_norm) {
    r = rScale(selectedData[0].gccs_norm);
    p.fill(colors['gccs_norm']);
    p.arc(-cellWidth/2, cellHeight/2, r, r, -p.PI/2, 0);
  }

  // government
  if (selectedData[0].gccs_government) {
    r = rScale(selectedData[0].gccs_government);
    p.fill(colors['gccs_government']);
    p.arc(0, -cellHeight/2, r, r, p.PI/2, p.PI);
  }
}


function circlesMotif(p) {

  p.noFill();
  p.strokeWeight(2);
  let selVar;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selectedData[0][selVar]) {
      p.stroke(colors[selVar]);
      r = rScale(selectedData[0][selVar]);
      p.push();
      p.ellipse(0, 0, r, r);
      p.pop();

    }
  }
}

function alphaMotif(p) {

  p.noStroke();
  let c = [];

  // wtp
  if (selectedData[0].gccs_wtp) {
    alpha = alphaScale(selectedData[0].gccs_wtp);
    c = [...colors['gccs_wtp'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    p.rect(0, -cellHeight/2, cellWidth/2, cellHeight/2);
    p.pop();
  }

  // wtp_belief
  if (selectedData[0].gccs_wtp_belief) {
    alpha = alphaScale(selectedData[0].gccs_wtp_belief);
    c = [...colors['gccs_wtp_belief'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    p.rect(0, 0, cellWidth/2, cellHeight/2);
    p.pop();
  }

  // norm
  if (selectedData[0].gccs_norm) {
    alpha = alphaScale(selectedData[0].gccs_norm);
    c = [...colors['gccs_norm'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    p.rect(-cellWidth/2, 0, cellWidth/2, cellHeight/2);
    p.pop();
  }

  // government
  if (selectedData[0].gccs_government) {
    alpha = alphaScale(selectedData[0].gccs_government);
    c = [...colors['gccs_government'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    p.rect(-cellWidth/2, -cellHeight/2, cellWidth/2, cellHeight/2);
    p.pop();
  }
}
