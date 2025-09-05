// initialize canvas, selects and buttons
let sketch1Instance;
let sketch2Instance;
let sketch3Instance;
let canvas;
let countrySelect;
let nCellsXInput;
let relMotifSizeInput;
let rowIndentInput;
let showGrid;
let symmetrySelect;
let motifSelect;
let color1;
let color2;
let color3;
let color4;
let colorbg;
let typefaceSelect;
let exportButton;

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

// Scaling: https://p5js.org/tutorials/coordinates-and-transformations/

// define cell
let cellWidth;
let cellHeight;
let nCells;
let nCellsX;
let cellsAspectratio = 1;
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
// order of variables in UI
let order = [];
//let order = [
  //'gccs_government',
  //'gccs_wtp_belief', 
  //'gccs_norm', 
  //'gccs_wtp', 
//];
// initialize scales
let rScale = d3.scaleSqrt(); // radius
let rScaleHalfCell = d3.scaleSqrt(); // radius in halfcell (actually it's a quarter cell)
let r;
let alphaScale = d3.scaleLinear(); // transparency
let alpha;
let areaScale = d3.scaleLinear(); // area of triangle
let area;
let hScale = d3.scaleLinear(); // height of rectangle
let h;
let angleScale = d3.scaleLinear(); // angle of circle completion
let angle;
let elScaleHalfCell = d3.scaleLinear(); // ellipse size (length of main axis)
let elScaleHalfCellDiagonal = d3.scaleLinear(); // ellipse size (length of main axis)
let el;
let elStartPos = 1;

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

function initializeSelects(p) {

  // It is better to define button in html and select in p5
  let countrySelectHTML = document.getElementById('country');
  countrySelect = p.select('#country');
  let nCellsXInputHTML = document.getElementById('ncellsx');
  nCellsXInput = p.select('#ncellsx')
  let relMotifSizeInputHTML = document.getElementById('relmotifsize');
  relMotifSizeInput = p.select('#relmotifsize');
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
  let colorbgHTML = document.getElementById('colorbg');
  colorbg = p.select('#colorbg');

  let pos1HTML = document.getElementById('pos1');
  let pos2HTML = document.getElementById('pos2');
  let pos3HTML = document.getElementById('pos3');
  let pos4HTML = document.getElementById('pos4');

  let typefaceSelectHTML = document.getElementById('typeface');
  typefaceSelect = p.select('#typeface');

  // Add event listeners
  countrySelectHTML.addEventListener('change', function(event) {
    selectCountry(p);
  });
  nCellsXInputHTML.addEventListener('change', function(event) {
    updateGrid(p);
  })
  relMotifSizeInputHTML.addEventListener('change', function(event) {
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
  colorbgHTML.addEventListener('change', function(event) {
    updateColors(p);
  });
  pos1HTML.addEventListener('change', function(event) {
    updateOrder(p);
  });
  pos2HTML.addEventListener('change', function(event) {
    updateOrder(p);
  });
  pos3HTML.addEventListener('change', function(event) {
    updateOrder(p);
  });
  pos4HTML.addEventListener('change', function(event) {
    updateOrder(p);
  });
  typefaceSelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });

}

function initializeButtons() {
  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  exportButton.addEventListener('click', function(event) {
    exportCanvases();
  });

}

function getDropdownOrder() {
  order = [
    document.getElementById('pos1').value,
    document.getElementById('pos2').value,
    document.getElementById('pos3').value,
    document.getElementById('pos4').value
  ].filter(val => val !== ''); // Remove empty selections
            
  //document.getElementById('dropdownResult').innerHTML = 
    //`<strong>Selected Order:</strong> [${order.join(', ')}]`;
}


function sketch1(p) {
  p.setup = function () {
    canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

  };

  p.draw = function () {
    p.background(colors['background']);

    // select font
    // https://p5js.org/tutorials/loading-and-selecting-fonts/
    // https://www.fontsquirrel.com/fonts/list/find_fonts
    // Adobe Fonts
    p.textFont(typefaceSelect.value());

    // rectangle around card
    p.noFill()
    p.stroke('black');
    p.strokeWeight(1);
    p.rect(0, 0, pcWidth, pcHeight);

    // initialize
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
      if (selData.length > 0) {
        p.push();
        p.translate(x + cellWidth/2, y + cellHeight/2);
        p.scale(relMotifSize, relMotifSize);
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

    p.textFont(typefaceSelect.value());

    // rectangle around card
    p.noFill()
    p.stroke('black');
    p.strokeWeight(1);
    p.rect(0, 0, pcWidth, pcHeight);

    // initialize
    let xMotif = bWidth*0.2;
    let yMotif = bHeight*0.4;
    let bScale = p.min(bWidth/cellWidth, bHeight/cellHeight)*0.3

    // draw scaled motif, without symmetry operations
    if (selData.length > 0) {
      //console.log("in sketch2 draw")
      p.push();
      p.translate(xMotif, yMotif);
      p.scale(bScale, bScale);
      p.push();
      drawMotif(p);
      p.pop();

      // draw grid cell 
      // TODO move to function again
      if (showGrid.checked()) {
        p.noFill();
        p.stroke(100);
        p.strokeWeight(0.2);
        p.rect(
          -cellWidth/2, 
          -cellHeight/2, 
          cellWidth, 
          cellHeight
        );
        p.line(-cellWidth/2, 0, cellWidth/2, 0);
        p.line(0, -cellHeight/2, 0, cellHeight/2);
      }
      p.pop();

      // add legend text
      addLegendText(p);
    }

    // add source as separating line
    // TODO add link to my scrollytelling website
    // TODO add my name and contact
    // TODO add HKB CAS GDD
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.noStroke();
    p.fill(150);
    p.push();
    p.translate(pcWidth*0.55, pcHeight/2);
    p.rotate(-p.PI/2);
    p.text(
      'Data from the global climate change survey. https://gccs.iza.org/',
      0,
      0,
    )
    p.pop();


    // address block
    p.push();
    p.noFill();
    p.stroke(200);
    p.strokeWeight(0.8);
    p.line(bWidth*1.08 + 60, bHeight*0.50, pcWidth - 70, bHeight*0.50);
    p.line(bWidth*1.08 + 60, bHeight*0.58, pcWidth - 70, bHeight*0.58);
    p.line(bWidth*1.08 + 60, bHeight*0.66, pcWidth - 70, bHeight*0.66);
    p.line(bWidth*1.08 + 60, bHeight*0.74, pcWidth - 70, bHeight*0.74);
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
    let xMotif = mWidth/2;
    let yMotif = mHeight/2;
    let mScale = p.min(mWidth/cellWidth, mHeight/cellHeight)*0.8

    // draw scaled motif, without symmetry operations
    if (selData.length > 0) {
      //console.log("in sketch3 draw")
      p.push();
      p.translate(xMotif, yMotif);
      p.scale(mScale, mScale);
      p.push();
      drawMotif(p);
      p.pop();

      // draw grid cell 
      // TODO move to function again
      if (showGrid.checked()) {
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
initializeSelects(sketch1Instance);
initializeSelects(sketch2Instance);
initializeSelects(sketch3Instance);
initializeButtons(sketch1Instance);
updateGrid(sketch1Instance);
updateOrder(sketch1Instance);
updateColors(sketch1Instance);
loadData(sketch1Instance);


function updateScales(p) {

  rScale
    .domain([0, 100])
    .range([1, Math.min(cellWidth, cellHeight)]);
  rScaleHalfCell
    .domain([0, 100])
    .range([1, Math.min(cellWidth/2, cellHeight/2)]);
  alphaScale
    .domain([0, 100])
    .range([0, 255]);
  areaScale
    .domain([0, 100])
    .range([0, cellWidth*cellWidth/4]) // gleichschenkliges Dreieck, Hypothenuse = cellWidth, cellWidth=cellHeight
  hScale
    .domain([0, 100])
    .range([0, cellWidth/2]);
  angleScale
    .domain([0, 100])
    .range([0, p.PI]);
  elScaleHalfCell
    .domain([0, 100])
    .range([elStartPos, cellHeight/2]);
  elScaleHalfCellDiagonal
    .domain([0, 100])
    .range([elStartPos, cellHeight/2*p.sqrt(2)]);

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
  cellHeight = cellWidth / cellsAspectratio;  // aspectratio = width / height
  let nCellsY = Math.floor(distanceY / cellHeight);
  nCells = nCellsX * nCellsY;
  console.log('nCells: ' + nCells, nCellsX, nCellsY, 'pcWidth: ' + pcWidth + ', pcHeight: ' + pcHeight);

  // Relative motif size
  relMotifSize = parseFloat(relMotifSizeInput.value());

  // Motif properties
  updateScales(p);

  p.redraw();

}

function updateOrder(p) {

  getDropdownOrder();

  console.log('order change', order);
  p.redraw();

}

function updateColors(p) {

  colors = {
    'gccs_wtp': p.color(color1.value()),
    'gccs_wtp_belief': p.color(color2.value()),
    'gccs_norm': p.color(color3.value()),
    'gccs_government': p.color(color4.value()),
    'background': p.color(colorbg.value()),
  }

  console.log('color change', colors);
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

  if (motifSelect.value() === 'windwheel') {
    windwheelMotif(p, 0);
  } else if (motifSelect.value() === 'windwheel45') {
    windwheelMotif(p, p.PI/4);
  } else if (motifSelect.value() === 'arc') {
    arcMotif(p, 'arc');
  } else if (motifSelect.value() === 'squares') {
    arcMotif(p, 'squares');
  } else if (motifSelect.value() === 'rectangles') {
    arcMotif(p, 'rectangles');
  } else if (motifSelect.value() === 'rectangles2') {
    arcMotif(p, 'rectangles2');
  } else if (motifSelect.value() === 'rectangles3') {
    rectMotif(p);
  } else if (motifSelect.value() === '3/4circles') {
    openCirclesMotif(p, '3/4');
  } else if (motifSelect.value() === 'anglecircles') {
    openCirclesMotif(p, 'angle');
  } else if (motifSelect.value() === 'interlockingcirclesclose') {
    interlockingCirclesMotif(p, 'close');
  } else if (motifSelect.value() === 'interlockingcirclesregular') {
    interlockingCirclesMotif(p, 'regular');
  } else if (motifSelect.value() === 'arc2') {
    arcMotif2(p);
  } else if (motifSelect.value() === 'circles') {
    circlesMotif(p);
  } else if (motifSelect.value() === 'flower') {
    flowerMotif(p, 0);
  } else if (motifSelect.value() === 'flower45') {
    flowerMotif(p, p.PI/4);
  } else if (motifSelect.value() === 'circles2') {
    circlesMotif2(p);
  } else if (motifSelect.value() === 'alphaRect') {
    alphaMotif(p, 'rect');
  } else if (motifSelect.value() === 'alphaEllipse') {
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
  p.noStroke();
  p.fill(150);
  p.text(
    selCountry, 
    pcWidth / 2, 
    //pcWidth - (txtWidth + 2*paddingX)/2, 
    pcHeight - (txtHeight + 2*paddingY)/2, 
  );
}

function addLegendText(p) {
  // TODO add around motif?
  // TODO short sentence for WTP, statements for rest?

  // legend text
  let xPos = 20;
  p.textAlign(p.TOP, p.LEFT);
  p.noStroke();
  p.fill(50);
  p.textSize(20);
  p.text(
    'Share the good news',
    xPos,
    60,
  )
  p.textSize(14);
  p.fill(colors['gccs_wtp']);
  p.text(
    `${selData[0]['gccs_wtp']}% of the people ${selData[0]['country_prefix'].toLowerCase()} ${selCountry} are willing to give 1% of their income`, 
    xPos,
    90,
  );
  p.text(
    "to fight global warming.", 
    xPos,
    110,
  );
  p.fill(colors['gccs_wtp_belief']);
  p.text(
    `They think that only ${selData[0]['gccs_wtp_belief']}% of the others are also willing to do so, `, 
    xPos,
    130,
  );
  p.text(
    `a ${selData[0]['gccs_wtp'] - selData[0]['gccs_wtp_belief']}% gap.`, 
    xPos,
    150,
  );
  p.fill(colors['gccs_norm']);
  p.text(
    `${selData[0]['gccs_norm']}%: others should try to fight global warming.`,
    xPos,
    330,
  )
  p.fill(colors['gccs_government']);
  p.text(
    `${selData[0]['gccs_government']}%: national government should do more.`,
    xPos,
    350,
  )

  p.fill(100);
  p.text(
    "This difference in perception is reported in 125 countries,",
    xPos,
    370,
  )
  p.text(
    "in every country partcipating in the survey.",
    xPos,
    390,
  )

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

function exportCanvases() {
  let parts = [
    selCountry, 
    motifSelect.value(),
    nCellsX, 
    colors['gccs_wtp'], 
    colors['gccs_wtp_belief'],
    colors['gccs_norm'],
    colors['gccs_government']];
  let filename = parts.join('_');
  sketch1Instance.save(filename + '_postcardfront', 'svg');
  sketch2Instance.save(filename + '_postcardback', 'svg');
  sketch3Instance.save(filename + '_motif', 'svg');
}




// -----------------------------------------------------------------
// Motifs

function windwheelMotif(p, addRotation) {
  // isosceles (gleichschenklige) triangles adjusting length of hypotenuse

  p.noStroke();

  let adjustedHypotenuse;
  let selVar;
  let initialRotation = -p.PI/2 + addRotation;

  for (let i=0; i<4; i++) {
    selVar = order[i];
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


function flowerMotif(p, addRotation) {

  p.noStroke();

  let selVar;
  let initialRotation = p.PI + addRotation;
  let ellipseWidth = 15;
  let ellipseX = 0;
  let ellipseY;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    if (selData[0][selVar]) {
      if (addRotation == 0) {
        el = elScaleHalfCell(selData[0][selVar]);
      } else if (addRotation == p.PI/4) {
        el = elScaleHalfCellDiagonal(selData[0][selVar]);
      }
      ellipseY = elStartPos + el/2;
      p.fill(colors[selVar]);
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      p.ellipse(ellipseX, ellipseY, ellipseWidth, el);
      p.pop();

    }
  }

  selVar = order[0];
  if (selData[0][selVar]) {
    if (addRotation == 0) {
      el = elScaleHalfCell(selData[0][selVar]);
    } else if (addRotation == p.PI/4) {
      el = elScaleHalfCellDiagonal(selData[0][selVar]);
    }
    ellipseY = elStartPos + el/2;
    p.fill(colors[selVar]);
    p.push();
    p.rotate(initialRotation);
    p.arc(ellipseX, ellipseY, ellipseWidth, el, -p.PI/2, p.PI/2);
    p.pop();
  }
}

function arcMotif(p, shape) {

  p.noStroke();
  let selVar;
  let initialRotation = p.PI;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //console.log('selVar', selVar);
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      if (shape == 'arc') {
        r = rScale(selData[0][selVar]);
        p.arc(0, 0, r, r, 0, p.PI/2);
      } else if (shape == 'triangle') {
        // TODO maybe?
      } else if (shape == 'squares') {
        r = rScaleHalfCell(selData[0][selVar]);
        p.rect(0, 0, r, r);
      } else if (shape == 'rectangles') {
        h = hScale(selData[0][selVar]);
        p.rect(0, 0, cellWidth/2, h);
      } else if (shape == 'rectangles2') {
        h = hScale(selData[0][selVar]);
        p.rect(0, cellHeight/2 - h, cellWidth/2, h);
      }
      p.pop();

    }
  }
}

function rectMotif(p) {

  p.noStroke();

  // wtp
  // TODO unclear why -h is needed for this one....
  if (selData[0].gccs_wtp) {
    h = hScale(selData[0].gccs_wtp);
    p.fill(colors['gccs_wtp']);
    p.rect(-cellWidth/2, 0, cellWidth/2, -h);
  }

  // wtp_belief
  if (selData[0].gccs_wtp_belief) {
    h = hScale(selData[0].gccs_wtp_belief);
    p.fill(colors['gccs_wtp_belief']);
    p.rect(0, 0, cellWidth/2, -h);
  }

  // norm
  if (selData[0].gccs_norm) {
    h = hScale(selData[0].gccs_norm);
    p.fill(colors['gccs_norm']);
    p.rect(0, 0, cellWidth/2, h);
  }

  // government
  if (selData[0].gccs_government) {
    h = hScale(selData[0].gccs_government);
    p.fill(colors['gccs_government']);
    p.rect(-cellWidth/2, 0, cellWidth/2, h);
  }
}

function openCirclesMotif(p, shape) {
  
  p.noStroke();
  let selVar;
  let initialRotation = p.PI;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //console.log('selVar', selVar);
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      if (shape == '3/4') {
        r = rScaleHalfCell(selData[0][selVar]);
        p.arc(cellWidth/4, cellHeight/4, r, r, -p.PI/2, p.PI);
      } else if (shape == 'angle') {
        angle = angleScale(selData[0][selVar]);
        p.arc(cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2, -angle+5*p.PI/4, angle+5*p.PI/4);
        //p.arc(cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2, -angle+p.PI/4, angle+p.PI/4);
      }
      p.pop();

    }
  }
}

function interlockingCirclesMotif(p, type='close') {
  
  p.noStroke();

  // wtp
  if (selData[0].gccs_wtp) {
    r = rScaleHalfCell(selData[0].gccs_wtp);
    //p.stroke(colors['gccs_wtp']);
    p.fill(colors['gccs_wtp']);
    if (type == 'close') {
      p.arc(-3*cellWidth/8, -cellHeight/4, r, r, p.PI, p.PI/2);
      //p.arc(-3*cellWidth/8, -cellHeight/4, cellWidth/2, cellHeight/2, p.PI, p.PI/2);
    } else if (type == 'regular') {
      p.arc(-cellWidth/4, -cellHeight/4, r, r, p.PI, p.PI/2);
      //p.arc(-cellWidth/4, -cellHeight/4, cellWidth/2, cellHeight/2, p.PI, p.PI/2);
    }
  }

  // wtp_belief
  if (selData[0].gccs_wtp_belief) {
    r = rScaleHalfCell(selData[0].gccs_wtp_belief);
    //p.stroke(colors['gccs_wtp_belief']);
    p.fill(colors['gccs_wtp_belief']);
    if (type == 'close') {
      p.arc(3*cellWidth/8, -cellHeight/4, r, r, 0, 3*p.PI/2);
      //p.arc(3*cellWidth/8, -cellHeight/4, cellWidth/2, cellHeight/2, 0, 3*p.PI/2);
    } else if (type == 'regular') {
      p.arc(cellWidth/4, -cellHeight/4, r, r, 0, 3*p.PI/2);
      //p.arc(cellWidth/4, -cellHeight/4, cellWidth/2, cellHeight/2, 0, 3*p.PI/2);
    }
  }

  // norm
  if (selData[0].gccs_norm) {
    r = rScaleHalfCell(selData[0].gccs_norm);
    //p.stroke(colors['gccs_norm']);
    p.fill(colors['gccs_norm']);
    if (type == 'close') {
      p.arc(-cellWidth/8, cellHeight/4, r, r, 0, 3*p.PI/2);
      //p.arc(-cellWidth/8, cellHeight/4, cellWidth/2, cellHeight/2, 0, 3*p.PI/2);
    } else if (type == 'regular') {
      p.arc(-cellWidth/4, cellHeight/4, r, r, 0, 3*p.PI/2);
      //p.arc(-cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2, 0, 3*p.PI/2);
    }
  }

  // government
  if (selData[0].gccs_government) {
    r = rScaleHalfCell(selData[0].gccs_government);
    //p.stroke(colors['gccs_government']);
    p.fill(colors['gccs_government']);
    if (type == 'close') {
      p.arc(cellWidth/8, cellHeight/4, r, r, p.PI, p.PI/2);
      //p.arc(cellWidth/8, cellHeight/4, cellWidth/2, cellHeight/2, p.PI, p.PI/2);
    } else if (type == 'regular') {
      p.arc(cellWidth/4, cellHeight/4, r, r, p.PI, p.PI/2);
      //p.arc(cellWidth/4, cellHeight/4, cellWidth/2, cellHeight/2, p.PI, p.PI/2);
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
  // filled circles in a 2x2 grid

  p.noStroke();
  let selVar;
  let initialRotation = p.PI;

  for (let i=0; i<4; i++) {
    selVar = order[i];
    //console.log('selVar', selVar);
    if (selData[0][selVar]) {
      p.fill(colors[selVar]);
      r = rScaleHalfCell(selData[0][selVar]);
      p.push();
      p.rotate(initialRotation + i*p.PI/2);
      p.ellipse(cellWidth/4, cellWidth/4, r, r);
      p.pop();

    }
  }
}

function circlesMotif2(p) {
  // concentric non-filled circles

  p.noFill();
  p.strokeWeight(2);
  let selVar;
  let c = [];

  for (let i=0; i<4; i++) {
    selVar = order[i];
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
