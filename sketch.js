// initialize canvas, selects and buttons
let sketch1Instance;
let sketch2Instance;
let sketch3Instance;
let canvas;
let countrySelect;
let nCellsXInput;
let cellsAspectratioInput;
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
let exportButtonBack;
let exportButtonMotif;

// initialize data structure
let data = [];
let selData = [];
let countries = [];

// define postcard size (A5 postcard: 148mm x 105mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
let pcWidthMM = 148; // mm
let pcHeightMM = 105; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);
let bWidth = pcWidth/2;
let bHeight = pcHeight;
// To set appropriate size for export, Felix would do it as I did already.
// For printing, pdf is better than svg.

// define frame
// TODO as input in app
let frame = {
  'top': 0.05,
  'bottom': 0.05,
}

// 2 canvases: https://p5js.org/examples/advanced-canvas-rendering-multiple-canvases/
// Does something similar as is needed in Vue

// Scaling: https://p5js.org/tutorials/coordinates-and-transformations/

// define cell
let cellWidth;
let cellHeight;
let nCells;
let nCellsX;
let cellsAspectratio;
let nCellsAdditional;
let initialCellPositionX;
let initialCellPositionY;
let initialCellRotation = 0;
let cellCount;
let rowCount;
let rowIndent;
let x;
let y;

// motif
let colors;
// TODO set order of variables in UI
let order = [
  'gccs_government',
  'gccs_wtp_belief', 
  'gccs_norm', 
  'gccs_wtp', 
];
// initialize scales
// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt(); // radius
let r;
let alphaScale = d3.scaleLinear(); // transparency
let alpha;
let areaScale = d3.scaleLinear(); // area of triangle
let area;

// define canvas size for motif
let mWidth = 200;
let mHeight = 200;



function loadData(p) {
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

    // Select country and draw initial postcard
    selectCountry(p);

  });  
}

function initializeSelectsAndButtons(p, selSketch) {

  // It is better to define button in html and select in p5
  let countrySelectHTML = document.getElementById('country');
  countrySelect = p.select('#country');
  let nCellsXInputHTML = document.getElementById('ncellsx');
  nCellsXInput = p.select('#ncellsx')
  let cellsAspectratioInputHTML = document.getElementById('cellaspectratio');
  cellsAspectratioInput = p.select('#cellaspectratio')
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
  exportButtonBack = document.getElementById('exportButtonBack');
  exportButtonMotif = document.getElementById('exportButtonMotif');
            
  // Add event listeners
  countrySelectHTML.addEventListener('change', function(event) {
    selectCountry(p);
  });
  nCellsXInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  })
  cellsAspectratioInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  })
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
  if (selSketch == 1) {
    exportButton.addEventListener('click', function(event) {
      exportCanvas(p, selSketch);
    });
  } else if (selSketch == 2) {
    exportButtonBack.addEventListener('click', function(event) {
      exportCanvas(p, selSketch);
    });
  } else if (selSketch == 3) {
    exportButtonMotif.addEventListener('click', function(event) {
      exportCanvas(p, selSketch);
    });
  }

}

function sketch1(p) {
  p.setup = function () {
    canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

  };

  p.draw = function () {
    p.background(255);

    // initialize
    p.rectMode(p.TOP, p.LEFT);
    x = initialCellPositionX;
    y = initialCellPositionY;
    cellCount = 1;
    rowCount = 1;
    rowIndent = parseFloat(rowIndentInput.value());

    // draw pattern
    for (let i = 0; i < nCells; i++) {

      // draw grid cell
      if (showGrid.checked()) {
        drawGridCell(p);
      }

      // draw motif
      // TODO other symmetry operations
      if (selData.length > 0) {
        p.push();
        p.translate(x + cellWidth/2, y + cellHeight/2);
        p.scale(cellsAspectratio, 1);
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
    if (selData.length > 0) {
      addCountryText(p);

    }
  }
}


function sketch2(p) {
  p.setup = function () {
    canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

  };

  p.draw = function () {
    p.background(255);

    // initialize
    p.rectMode(p.TOP, p.LEFT);
    let xMotif = bWidth/2;
    let yMotif = bHeight/2;
    let bScale = p.min(bWidth/cellWidth, bHeight/cellHeight)*0.5

    // draw scaled motif, without symmetry operations
    if (selData.length > 0) {
      console.log("in sketch2 draw")
      p.push();
      p.translate(xMotif, yMotif);
      p.scale(bScale, bScale);
      p.push();
      //p.scale(cellsAspectratio, 1);
      drawMotif(p);
      p.pop();

      // draw grid cell 
      // TODO move to function again
      if (showGrid.checked()) {
        p.rectMode(p.TOP, p.LEFT);
        p.noFill();
        p.stroke(100);
        p.strokeWeight(0.2);
        p.rect(
          -cellWidth/2, 
          -cellHeight/2, 
          cellWidth, 
          cellHeight
        );
      }
      p.pop();
    }

    // legend text
    p.textAlign(p.TOP, p.LEFT);
    // TODO choose font
    // https://p5js.org/tutorials/loading-and-selecting-fonts/
    // https://www.fontsquirrel.com/fonts/list/find_fonts
    p.textFont("Verdana");  // Option: Avantgarde
    p.fill(50);
    p.textSize(20);
    p.text(
      'Good news',
      50,
      60,
    )
    p.textSize(14);
    p.fill(colors['gccs_wtp']);
    p.text(
      `In ${selCountry}, ${selData[0]['gccs_wtp']}% of the people are willing`, 
      50, 
      90,
    );
    p.text(
      "to give 1% of their income to fight global warming.", 
      50, 
      110,
    );
    p.fill(colors['gccs_wtp_belief']);
    p.text(
      `Interestingly, they think that only ${selData[0]['gccs_wtp_belief']}% of the others`, 
      50, 
      140,
    );
    p.text(
      "are also willing to fight global warming,", 
      50, 
      160,
    );
    p.text(
      `a ${selData[0]['gccs_wtp'] - selData[0]['gccs_wtp_belief']}% gap.`, 
      50, 
      180,
    );
    p.fill(colors['gccs_norm']);
    p.text(
      `Also, ${selData[0]['gccs_norm']}% think that social norms should`,
      50,
      460,
    )
    p.text(
      "be climate-friendly.",
      50,
      480,
    )
    p.fill(colors['gccs_government']);
    p.text(
      `And ${selData[0]['gccs_government']}% think that politics and `,
      50,
      510,
    )
    p.text(
      "politicians should do more.",
      50,
      530,
    )

    p.fill(100);
    p.text(
      "This difference in perception is reported in 125 countries across the globe,",
      50,
      560,
    )
    p.text(
      "all that participated in the survey (see source).",
      50,
      580,
    )



    // reference
    p.textSize(12);
    p.fill(150);
    p.text(
      'Source: Here comes the reference',
      20,
      pcHeight - 10,
    )

    // address block
    p.push();
    p.noFill();
    p.stroke(200);
    p.strokeWeight(2);
    p.line(bWidth, 20, bWidth, bHeight-20);
    p.line(bWidth + 40, bHeight*0.5, pcWidth-200, bHeight*0.5);
    p.line(bWidth + 40, bHeight*0.59, pcWidth-50, bHeight*0.59);
    p.line(bWidth + 40, bHeight*0.68, pcWidth-50, bHeight*0.68);
    p.line(bWidth + 40, bHeight*0.77, pcWidth-50, bHeight*0.77);
    p.line(bWidth + 40, bHeight*0.86, pcWidth-50, bHeight*0.86);
    p.pop();

  }
}

function sketch3(p) {
  p.setup = function() {
    canvas = p.createCanvas(mWidth, mHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container-motif'));
    p.noLoop();

  }

  p.draw = function () {
    p.background(255);

    // initialize
    p.rectMode(p.TOP, p.LEFT);
    let xMotif = mWidth/2;
    let yMotif = mHeight/2;
    let mScale = p.min(mWidth/cellWidth, mHeight/cellHeight)*0.8

    // draw scaled motif, without symmetry operations
    if (selData.length > 0) {
      console.log("in sketch3 draw")
      p.push();
      p.translate(xMotif, yMotif);
      p.scale(mScale, mScale);
      p.push();
      //p.scale(cellsAspectratio, 1);
      drawMotif(p);
      p.pop();

      // draw grid cell 
      // TODO move to function again
      if (showGrid.checked()) {
        p.rectMode(p.TOP, p.LEFT);
        p.noFill();
        p.stroke(100);
        p.strokeWeight(0.2);
        p.rect(
          -cellWidth/2, 
          -cellHeight/2, 
          cellWidth, 
          cellHeight
        );
      }
      p.pop();
    }

  }
}


// TODO good positioning of canvases
sketch1Instance = new p5(sketch1);
sketch2Instance = new p5(sketch2);
sketch3Instance = new p5(sketch3);
initializeSelectsAndButtons(sketch1Instance, 1);
initializeSelectsAndButtons(sketch2Instance, 2);
initializeSelectsAndButtons(sketch3Instance, 3);
updateGrid(sketch1Instance);
updateColors(sketch1Instance);
loadData(sketch1Instance);


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

  // Set initial cell positions (same distance from top and left)
  initialCellPositionY = frame['top']*pcHeight;
  initialCellPositionX = initialCellPositionY;
  let distanceX = pcWidth - 2*initialCellPositionX;
  let distanceY = pcHeight - 2*initialCellPositionY;

  // Calculate number of cells
  nCellsX = parseInt(nCellsXInput.value());
  cellWidth = distanceX / nCellsX;
  cellsAspectratio = parseFloat(cellsAspectratioInput.value());
  cellHeight = cellWidth / cellsAspectratio;  // aspectratio = width / height
  let nCellsY = Math.floor(distanceY / cellHeight);
  nCells = nCellsX * nCellsY;
  console.log('nCells: ' + nCells, nCellsX, nCellsY, 'pcWidth: ' + pcWidth + ', pcHeight: ' + pcHeight);
  //nCellsAdditional = parseFloat(nAddCellsInput.value());

  // Motif ratio
  // TODO implement mit push, scale, pop
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

  p.redraw();

}

function selectCountry(p) {

  selCountry = countrySelect.value();
  selData = data.filter(d => d.country === selCountry);
  console.log("Filtered data for", selCountry, selData);

  p.redraw();
  sketch2Instance.redraw();  // for initial drawing of back
  sketch3Instance.redraw();  // for initial drawing of motif

}

function updatePostcard(p) {
  
  p.redraw();
  
}
        
// TODO fix for rowIndent
function drawGridCell(p) {

  p.rectMode(p.TOP, p.LEFT);
  p.noFill();
  p.stroke(100);
  p.strokeWeight(0.2);
  //console.log(x + ((rowCount*rowIndent) % 1)*cellWidth, y)
  p.rect(
    x + ((rowCount*rowIndent) % 1)*cellWidth, 
    y, 
    cellWidth, 
    cellHeight
  );

}

// TODO select from html
function drawMotif(p) {

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
  } else if (motifSelect.value() === 'alphaMotifRect') {
    alphaMotif(p, 'rect');
  } else if (motifSelect.value() === 'alphaMotifEllipse') {
    alphaMotif(p, 'ellipse');
  }

}

function addCountryText(p) {

  // text properties
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(20);
  //let txtWidth = p.textWidth(selCountry);
  let txtHeight = p.textAscent() + p.textDescent();
  //let paddingX = 40;
  let paddingY = 10;

  // text
  p.fill(150);
  // TODO choose font
  // https://p5js.org/tutorials/loading-and-selecting-fonts/
  // https://www.fontsquirrel.com/fonts/list/find_fonts
  p.textFont("Verdana");  // Option: Avantgarde
  p.text(
    selCountry, 
    pcWidth / 2, 
    //pcWidth - (txtWidth + 2*paddingX)/2, 
    pcHeight - (txtHeight + 2*paddingY)/2, 
  );
}

function doTranslation() {

  // move to next cell: translation from left to right, top to bottom
    x = x + cellWidth;
    cellCount +=1;
    if (cellCount > nCellsX) {
      x = initialCellPositionX + ((rowCount*rowIndent) % 1)*cellWidth;
      y += cellHeight;
      cellCount = 1;
      rowCount +=1;
    }
}

function exportCanvas(p, selSketch) {
  if (selSketch == 1) {
    p.save('postcard', 'svg');
  } else if (selSketch == 2) {
    p.save('motif', 'svg');
  } else if (selSketch == 3) {
    p.save('back', 'svg');
  }
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
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      area = areaScale(selData[0][selVar]);
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

  // TODO test with stroke
  p.noStroke();

  let selVar;
  let initialRotation = 0;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      p.push();
      p.rotate(initialRotation + p.PI/4+ i*p.PI/2);
      p.ellipse(cellWidth*0, cellWidth*0.25, 20, 30);
      p.pop();

    }
  }
}

function flowerMotifCurve(p) {

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
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      area = areaScale(selData[0][selVar]);
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
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      r = rScale(selData[0][selVar]);
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
  if (selData[0].gccs_wtp) {
    r = rScale(selData[0].gccs_wtp);
    p.fill(colors['gccs_wtp']);
    p.arc(0, 0, r, r, -p.PI/2, 0);
  }

  // wtp_belief
  if (selData[0].gccs_wtp_belief) {
    r = rScale(selData[0].gccs_wtp_belief);
    p.fill(colors['gccs_wtp_belief']);
    p.arc(cellWidth/2, 0, r, r, p.PI/2, p.PI);
  }

  // norm
  if (selData[0].gccs_norm) {
    r = rScale(selData[0].gccs_norm);
    p.fill(colors['gccs_norm']);
    p.arc(-cellWidth/2, cellHeight/2, r, r, -p.PI/2, 0);
  }

  // government
  if (selData[0].gccs_government) {
    r = rScale(selData[0].gccs_government);
    p.fill(colors['gccs_government']);
    p.arc(0, -cellHeight/2, r, r, p.PI/2, p.PI);
  }
}


function circlesMotif(p) {

  p.noFill();
  p.strokeWeight(3);
  let selVar;
  let c = [];

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //selVar = Object.keys(colors)[i];
    //console.log('selVar', selVar);
    if (selData[0][selVar]) {
      alpha = 200;
      c = [...colors[selVar].levels.slice(0,3), alpha]
      p.stroke(p.color(c));
      //p.stroke(colors[selVar]);
      r = rScale(selData[0][selVar]);
      p.push();
      p.ellipse(0, 0, r, r);
      p.pop();

    }
  }
}

function alphaMotif(p, shape='ellipse') {

  p.noStroke();
  let c = [];

  // wtp
  if (selData[0].gccs_wtp) {
    alpha = alphaScale(selData[0].gccs_wtp);
    c = [...colors['gccs_wtp'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    if (shape == 'rect') {
      p.rect(0, -cellHeight/2, cellWidth/2, cellHeight/2);
    } else if (shape == 'ellipse') {
      p.ellipse(-cellWidth/4, -cellHeight/4, cellWidth/2, cellHeight/2);
    }
    p.pop();
  }

  // wtp_belief
  if (selData[0].gccs_wtp_belief) {
    alpha = alphaScale(selData[0].gccs_wtp_belief);
    c = [...colors['gccs_wtp_belief'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    if (shape == 'rect') {
      p.rect(0, 0, cellWidth/2, cellHeight/2);
    } else if (shape == 'ellipse') {
      p.ellipse(cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2);
    }
    p.pop();
  }

  // norm
  if (selData[0].gccs_norm) {
    alpha = alphaScale(selData[0].gccs_norm);
    c = [...colors['gccs_norm'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    if (shape == 'rect') {
      p.rect(-cellWidth/2, 0, cellWidth/2, cellHeight/2);
    } else if (shape == 'ellipse') {
      p.ellipse(-cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2);
    }
    p.pop();
  }

  // government
  if (selData[0].gccs_government) {
    alpha = alphaScale(selData[0].gccs_government);
    c = [...colors['gccs_government'].levels.slice(0,3), p.round(alpha,0)];
    p.fill(p.color(c));
    p.push();
    if (shape == 'rect') {
      p.rect(-cellWidth/2, -cellHeight/2, cellWidth/2, cellHeight/2);
    } else if (shape == 'ellipse') {
      p.ellipse(cellWidth/4, -cellHeight/4, cellWidth/2, cellHeight/2);
    }
    p.pop();
  }
}
