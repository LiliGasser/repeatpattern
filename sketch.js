// global variables
// ------------------------------------------------

// initialize canvas, selects and buttons
let sketchFrontInstance;
let sketchBackInstance;
let sketchMotifInstance;
let canvas;
let countrySelect;
let motifSelect;
let symmetrySelect;
let showGrid;
let layoutSelect;
let frameMarginSelect;
let nCellsXInput;
let relMotifSizeInput;
//let rowIndentInput;
let colorPaletteSelect;
let color1; // WTP
let color2; // WTP Belief
let color3; // Norm
let color4; // Government
let colorbg; // Background
let typefaceTitleSelect;
let typefaceTextSelect;
let exportButton;

// initialize data structure
let data = [];
let selData = [];
let countries = [];

// define postcard size (A5 postcard: 148mm x 105mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
const pcWidthMM = 148; // mm
const pcHeightMM = 105; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);

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
const colors_icecream = [
  '#ffc33e',
  '#646563',
  '#fb747b',
  '#5c7d99',
  '#ffffff',
];
const colors_retro = [
  '#f37124',
  '#2f4c43',
  '#96b27e',
  '#67897f',
  '#ffffff',
];
let order = [
  'gccs_wtp', 
  'gccs_norm', 
  'gccs_wtp_belief', 
  'gccs_government',
];

// initialize scales
let rScale = d3.scaleSqrt(); // radius in complete cell
let rScaleHalfCell = d3.scaleSqrt(); // radius in halfcell (actually it's a quarter cell)
let rScaleDonut = d3.scaleSqrt(); // radius in complete cell for donut
let rmin; // minimum radius for donut
let areaScale = d3.scaleLinear(); // area of isoceles triangle
let hScale = d3.scaleLinear(); // height of rectangle
let angleScale = d3.scaleLinear(); // angle of circle completion
let elScaleHalfCell = d3.scaleLinear(); // ellipse size (length of main axis)
let elScaleHalfCellDiagonal = d3.scaleLinear(); // ellipse size (length of main axis)
let elStartPos; // initial position in one direction of ellipse for flower motif

// define canvas size for motif
let mWidth = 200;
let mHeight = 200;

// language
let language = 'de'; // 'en' or 'de'

// text positions and font sizes
let countryTextX;
let countryTextY;
let titleTextX = 20;
let fontSizeCountry = 20;
let fontSizeTitle = 40;
let fontSizePercent = 20;
let fontSizeLegend = 11;
let fontSizeText = 12;
let fontSizeSource = 7;
let lineHeightLegend = 1.2 * fontSizeLegend;
let lineHeightPercent = 1.2 * fontSizePercent;
let lineHeightText = 1.2 * fontSizeText;
let legendTextYStart = 115;
let legendTextYStart2 = 210;
let legendTextYStart3 = pcHeight/2 - 5;



// initialize app
// ------------------------------------------------
// TODO good positioning of canvases
sketchFrontInstance = new p5(sketchFront);
sketchBackInstance = new p5(sketchBack);
sketchMotifInstance = new p5(sketchMotif);
initializeSelects(sketchFrontInstance);
initializeSelects(sketchBackInstance);
initializeSelects(sketchMotifInstance);
initializeButtons(sketchFrontInstance);
//updateCanvasSize(sketchFrontInstance);
updateGrid(sketchFrontInstance);
updateColorPalette(sketchFrontInstance);
loadData(sketchFrontInstance);



// p5 sketches 
// ------------------------------------------------
function sketchFront(p) {
  p.setup = function () {
    if (layoutSelect.value() === 'landscape') {
      canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
      console.log('landscape initial')
    } else if (layoutSelect.value() === 'portrait') {
      canvas = p.createCanvas(pcHeight, pcWidth, p.SVG);
      console.log('portrait initial')
    }
    canvas.parent(document.querySelector('.canvas-container'));
    p.noLoop();

  };

  p.draw = function () {
    p.background(colors['background']);

    // select font
    p.textFont(typefaceTextSelect.value());

    // rectangle around card
    p.noFill()
    p.stroke('black');
    p.strokeWeight(1);
    if (layoutSelect.value() === 'landscape') {
      p.rect(0, 0, pcWidth, pcHeight);
    } else if (layoutSelect.value() === 'portrait') {
      p.rect(0, 0, pcHeight, pcWidth);
    }

    // initialize
    x = initialCellPositionX;
    y = initialCellPositionY
    cellCount = 1;
    rowCount = 1;
    rowIndent = 0;  // parseFloat(rowIndentInput.value());

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


function sketchBack(p) {
  p.setup = function () {
    canvas = p.createCanvas(pcWidth, pcHeight, p.SVG);
    canvas.parent(document.querySelector('.canvas-container-back'));
    p.noLoop();

  };

  p.draw = function () {
    p.background(255);

    p.textFont(typefaceTextSelect.value());

    // rectangle around card
    p.noFill()
    p.stroke('black');
    p.strokeWeight(1);
    p.rect(0, 0, pcWidth, pcHeight);

    // initialize
    let xMotif = pcWidth*0.28;
    let yMotif = pcHeight*0.28;
    let bScale;
    if (['interlockingcirclesclose', 'windwheel45'].includes(motifSelect.value())) {
      bScale = p.min((pcWidth*0.56)/cellWidth, pcHeight/cellHeight)*0.26
    } else {
      bScale = p.min((pcWidth*0.56)/cellWidth, pcHeight/cellHeight)*0.30
    }


    // draw scaled motif, without symmetry operations
    if (selData.length > 0) {
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

      // add text of legend to motif
      addLegendText(p);
    }

    // add author and project info as separating line
    addAuthorText(p);

    // add more info block
    addInfoText(p);

    // address block
    addAddressBlock(p);

  }
}

function sketchMotif(p) {
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



// helper functions
// ------------------------------------------------
function loadData(p) {
  // Load data
  d3.dsv(";", "data/gccs_country_with_temperature_and_gdp.csv", d3.autoType).then(function(csv) {
    data = csv;
    //console.log("Data loaded:", data);

    // Get unique countries and add to select
    countries = data.map(d=>d.country);
    countries = [...new Set(countries)]; // remove duplicates
    let firstCountries = [
      'Switzerland', 
      'Germany', 
      'France', 
      'Italy',
      'United Kingdom',
      'United States',
      'Canada',
      'Brazil',
      'China',
      'India',
      'Iran',
      'Japan',
      'Thailand',
      'South Africa',
      'Nigeria',
      'Tanzania',
    ];
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

  // It is better to define buttons in html and select in p5
  let countrySelectHTML = document.getElementById('country');
  countrySelect = p.select('#country');
  let motifSelectHTML = document.getElementById('motif');
  motifSelect = p.select('#motif');
  let symmetrySelectHTML = document.getElementById('symmetry');
  symmetrySelect = p.select('#symmetry');
  let showGridHTML = document.getElementById('showgrid');
  showGrid = p.select('#showgrid');

  let nCellsXInputHTML = document.getElementById('ncellsx');
  nCellsXInput = p.select('#ncellsx')
  let relMotifSizeInputHTML = document.getElementById('relmotifsize');
  relMotifSizeInput = p.select('#relmotifsize');
  //let rowIndentInputHTML = document.getElementById('rowindent');
  //rowIndentInput = p.select('#rowindent');

  let colorPaletteSelectHTML = document.getElementById('colorpalette');
  colorPaletteSelect = p.select('#colorpalette');
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

  let typefaceTitleSelectHTML = document.getElementById('typefacetitle');
  typefaceTitleSelect = p.select('#typefacetitle');
  let typefaceTextSelectHTML = document.getElementById('typefacetext');
  typefaceTextSelect = p.select('#typefacetext');

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
  //rowIndentInputHTML.addEventListener('change', function(event) {
    //updatePostcard(p);
  //});
  showGridHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  symmetrySelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  motifSelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  colorPaletteSelectHTML.addEventListener('change', function(event) {
    updateColorPalette(p);
  });
  color1HTML.addEventListener('change', function(event) {
    updateColorsObject(p);
  });
  color2HTML.addEventListener('change', function(event) {
    updateColorsObject(p);
  });
  color3HTML.addEventListener('change', function(event) {
    updateColorsObject(p);
  });
  color4HTML.addEventListener('change', function(event) {
    updateColorsObject(p);
  });
  colorbgHTML.addEventListener('change', function(event) {
    updateColorsObject(p);
  });
  typefaceTitleSelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });
  typefaceTextSelectHTML.addEventListener('change', function(event) {
    updatePostcard(p);
  });

}

function initializeButtons(p) {
  let layoutSelectHTML = document.getElementById('layout');
  layoutSelect = p.select('#layout');
  let frameMarginSelectHTML = document.getElementById('framemargin');
  frameMarginSelect = p.select('#framemargin');
  exportButton = document.getElementById('exportButton');
            
  // Add event listeners
  layoutSelectHTML.addEventListener('change', function(event) {
    updateCanvasSize(p);
  })
  frameMarginSelectHTML.addEventListener('change', function(event) {
    updateGrid(p);
  })
  exportButton.addEventListener('click', function(event) {
    exportCanvases();
  });

}

function updateCanvasSize(p) {
  if (layoutSelect.value() === 'landscape') {
    console.log('landscape')
    p.resizeCanvas(pcWidth, pcHeight);
  } else if (layoutSelect.value() === 'portrait') {
    console.log('portrait')
    p.resizeCanvas(pcHeight, pcWidth);
  }

  updateGrid(p);
}

function updateScales(p) {

  // for the arcs and circular motifs spanning the entire cell
  rScale
    .domain([0, 100])
    .range([0, Math.min(cellWidth, cellHeight)]);
  rmin = 10;
  rScaleDonut
    .domain([0, 100])
    .range([rmin, Math.min(cellWidth, cellHeight)]);
  
  // for arcs and circular motifs spanning a quarter of the cell
  rScaleHalfCell
    .domain([0, 100])
    .range([0, Math.min(cellWidth/2, cellHeight/2)]);

  // for the isoceles triangles in windwheel motif
  // max area = 1/2 * hypotenuse * height = 1/2 * cellWidth * cellWidth/2 = cellWidth*cellWidth/4
  areaScale
    .domain([0, 100])
    .range([0, cellWidth*cellWidth/4])

  // for the rectangles in arc motif
  hScale
    .domain([0, 100])
    .range([0, cellWidth/2]);

  // for the open circles motif
  angleScale
    .domain([0, 100])
    .range([0, p.PI]);

  // for the flower motif
  elStartPos = 1;
  elScaleHalfCell
    .domain([0, 100])
    .range([elStartPos, cellHeight/2]);
  elScaleHalfCellDiagonal
    .domain([0, 100])
    .range([elStartPos, cellHeight/2*p.sqrt(2)]);

}

function updateGrid(p) {

  // Set initial cell positions (same distance from top and left)
  let distanceX;
  let distanceY;
  let frameMargin = parseFloat(frameMarginSelect.value());
  if (layoutSelect.value() === 'landscape') {
    initialCellPositionY = frameMargin*pcHeight;
    initialCellPositionX = initialCellPositionY;
    distanceX = pcWidth - 2*initialCellPositionX;
    distanceY = pcHeight - 2*initialCellPositionY;
  } else if (layoutSelect.value() === 'portrait') {
    initialCellPositionY = frameMargin*pcWidth;
    initialCellPositionX = initialCellPositionY;
    distanceX = pcHeight - 2*initialCellPositionX;
    distanceY = pcWidth - 2*initialCellPositionY;
  }

  // Calculate number of cells
  nCellsX = parseInt(nCellsXInput.value());
  cellWidth = distanceX / nCellsX;
  cellHeight = cellWidth / cellsAspectratio;  // aspectratio = width / height
  let nCellsY = Math.floor(distanceY / cellHeight);
  if (layoutSelect.value() === 'portrait') {
    nCellsY = nCellsX + 1;
  }
  nCells = nCellsX * nCellsY;
  console.log('nCells: ' + nCells, nCellsX, nCellsY, 'pcWidth: ' + pcWidth + ', pcHeight: ' + pcHeight);

  // Relative motif size
  relMotifSize = parseFloat(relMotifSizeInput.value());

  // Motif properties
  updateScales(p);

  p.redraw();

}

function updateColorPalette(p) {

  // select palette
  let palette;
  if (colorPaletteSelect.value() === 'icecream') {
    palette = colors_icecream;
  } else if (colorPaletteSelect.value() === 'retro') {
    palette = colors_retro;
  }

  // update colors object
  colors = {
    'gccs_wtp': p.color(palette[0]),
    'gccs_wtp_belief': p.color(palette[1]),
    'gccs_norm': p.color(palette[2]),
    'gccs_government': p.color(palette[3]),
    'background': p.color(palette[4]),
  }

  // update color inputs
  color1.value(palette[0]);
  color2.value(palette[1]);
  color3.value(palette[2]);
  color4.value(palette[3]);
  colorbg.value(palette[4]);

  //console.log('color change', colors);
  p.redraw();

}

function updateColorsObject(p) {

  // update colors object
  colors = {
    'gccs_wtp': p.color(color1.value()),
    'gccs_wtp_belief': p.color(color2.value()),
    'gccs_norm': p.color(color3.value()),
    'gccs_government': p.color(color4.value()),
    'background': p.color(colorbg.value()),
  }

  // set color palette select to custom if colors changed manually
  colorPaletteSelect.value('custom');

  p.redraw();

}

function selectCountry(p) {

  selCountry = countrySelect.value();
  selData = data.filter(d => d.country === selCountry);
  console.log("Filtered data for", selCountry, selData);

  p.redraw();
  sketchBackInstance.redraw();  // for initial drawing of back
  sketchMotifInstance.redraw();  // for initial drawing of motif

}

function updatePostcard(p) {
  
  p.redraw();
  
}
        
function drawGridCell(p) {
  // would need to be fixed for rowIndent > 0

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

function drawMotif(p) {

  if (motifSelect.value() === 'anglecircles') {
    openCirclesMotif(p, 'angle');
  } else if (motifSelect.value() === 'interlockingcirclesclose') {
    interlockingCirclesMotif(p, 'close');
  } else if (motifSelect.value() === 'interlockingcirclesregular') {
    interlockingCirclesMotif(p, 'regular');
  } else if (motifSelect.value() === '3/4circles') {
    openCirclesMotif(p, '3/4');
  } else if (motifSelect.value() === 'windwheel') {
    windwheelMotif(p, 0);
  } else if (motifSelect.value() === 'windwheel45') {
    windwheelMotif(p, p.PI/4);
  } else if (motifSelect.value() === 'arc') {
    arcMotif(p, 'arc');
  } else if (motifSelect.value() === 'arcdonut') {
    arcMotif(p, 'arcdonut');
  } else if (motifSelect.value() === 'arc2') {
    arcMotif2(p);
  } else if (motifSelect.value() === 'squares') {
    arcMotif(p, 'squares');
  } else if (motifSelect.value() === 'rectangles') {
    arcMotif(p, 'rectangles');
  } else if (motifSelect.value() === 'rectangles2') {
    arcMotif(p, 'rectangles2');
  } else if (motifSelect.value() === 'rectangles3') {
    rectMotif(p);
  } else if (motifSelect.value() === 'circles') {
    circlesMotif(p);
  } else if (motifSelect.value() === 'circles2') {
    circlesMotif2(p);
  }

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

function addCountryText(p) {

  let countryText;
  if (language === 'en') {
    countryText = selCountry;
  } else if (language === 'de') {
    countryText = selData[0]['country_de'];
  }

  // text properties
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(fontSizeCountry);
  let txtHeight = p.textAscent() + p.textDescent();
  let paddingY = 5;
  if (layoutSelect.value() === 'landscape') {
    countryTextX = pcWidth / 2;  // centered
    countryTextY = pcHeight - (txtHeight + 2*paddingY)/2 
    infoTextY = pcHeight - (txtHeight + 2*paddingY)/2 
  } else if (layoutSelect.value() === 'portrait') {
    countryTextX = pcHeight / 2;
    countryTextY = pcWidth - initialCellPositionY;  // same distance as from the top
    infoTextY = pcHeight - (txtHeight + 2*paddingY)/2 
  }

  // text
  p.textAlign(p.CENTER, p.BOTTOM);
  p.noStroke();
  p.fill(0);
  p.text(
    countryText, 
    countryTextX,
    countryTextY,
  );
}

function addLegendText(p) {
  // TODO positioning for United Arab Emirates

  let legendText;
  let xPosLeft = pcWidth*0.18;
  let xPosRight = pcWidth*0.38;
  p.noStroke();
  
  // title
  if (language === 'en') {
    legendText = 'Share the good news'
  } else if (language === 'de') {
    legendText = "Sag’s weiter"
  }
  p.textAlign(p.LEFT, p.BOTTOM);
  p.textSize(fontSizeTitle);
  p.fill(0);
  p.textFont(typefaceTitleSelect.value());
  p.text(
    legendText,
    titleTextX,
    initialCellPositionY + p.textAscent(), // same initial Y position as for pattern on front
  )

  // wtp
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.textSize(fontSizePercent);
  p.fill(colors['gccs_wtp']);
  p.textFont(typefaceTextSelect.value());
  if (language === 'en') {
    legendText = `${selData[0]['gccs_wtp']}%`
  } else if (language === 'de') {
    legendText = `${selData[0]['gccs_wtp']}%`
  }
  p.text(
    legendText, 
    xPosLeft,
    legendTextYStart,
  );
  if (language === 'en') {
    legendText = `of the people ${selData[0]['country_prefix'].toLowerCase()}`
  } else if (language === 'de') {
    legendText = `der Menschen ${selData[0]['country_de_prefix'].toLowerCase()} `
  }
  p.textSize(fontSizeLegend);
  p.text(
    legendText, 
    xPosLeft,
    legendTextYStart + 1*lineHeightLegend,
  );
  if (language === 'en') {
    legendText = `${selCountry} are willing`
  } else if (language === 'de') {
    legendText = `${selData[0]['country_de_decl']} sind bereit,`
  }
  p.text(
    legendText, 
    xPosLeft,
    legendTextYStart + 2*lineHeightLegend,
  );
  if (language === 'en') {
    legendText = `to give 1% of their income`
  } else if (language === 'de') {
    legendText = "1% ihres Einkommens für"
  }
  p.text(
    legendText, 
    xPosLeft,
    legendTextYStart + 3*lineHeightLegend,
  );
  if (language === 'en') {
    legendText = "to fight global warming."
  } else if (language === 'de') {
    legendText = "Klimaschutz zu spenden." 
  }
  p.text(
    legendText, 
    xPosLeft,
    legendTextYStart + 4*lineHeightLegend,
  );

  // wtp belief
  p.textAlign(p.LEFT, p.BOTTOM);
  p.textSize(fontSizeLegend)
  let txtHeightLegend = p.textAscent() + p.textDescent();
  p.textSize(fontSizePercent)
  let txtHeightPercent = p.textAscent() + p.textDescent();
  let txtHeightDifference = txtHeightPercent - txtHeightLegend;
  p.textSize(fontSizeLegend)
  p.fill(colors['gccs_wtp_belief']);
  if (language === 'en') {
    legendText = "They assume that only"
  } else if (language === 'de') {
    legendText = "Sie denken, dass nur"
  }
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference,
  );
  if (language === 'en') {
    legendText = `${selData[0]['gccs_wtp_belief']}%`
  } else if (language === 'de') {
    legendText = `${selData[0]['gccs_wtp_belief']}%`
  }
  p.textSize(fontSizePercent);
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference + lineHeightPercent,
  );
  if (language === 'en') {
    legendText = "of the others are willing"
  } else if (language === 'de') {
    legendText = "der anderen dazu bereit"
  }
  p.textSize(fontSizeLegend);
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference + lineHeightPercent + 1*lineHeightLegend,
  );
  if (language === 'en') {
    legendText = "to give 1% of their income,"
  } else if (language === 'de') {
    legendText = "sind, 1% ihres Einkommens"
  }
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference + lineHeightPercent + 2*lineHeightLegend,
  );

  // gap
  if (language === 'en') {
    legendText = `a ${selData[0]['gccs_wtp'] - selData[0]['gccs_wtp_belief']}% gap.`
  } else if (language === 'de') {
    legendText = "zu spenden, ein"
  }
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference + lineHeightPercent + 3*lineHeightLegend,
  );
  if (language === 'en') {
    legendText = ""
  } else if (language === 'de') {
    legendText = `Unterschied von ${selData[0]['gccs_wtp'] - selData[0]['gccs_wtp_belief']}%.`
  }
  p.text(
    legendText, 
    xPosRight,
    legendTextYStart2 - txtHeightDifference + lineHeightPercent + 4*lineHeightLegend,
  );

  // social norm
  p.textAlign(p.LEFT, p.BOTTOM);
  p.fill(colors['gccs_norm']);
  p.textSize(fontSizePercent);
  if (language === 'en') {
    legendText = `${selData[0]['gccs_norm']}%`
  } else if (language === 'de') {
    legendText = `${selData[0]['gccs_norm']}%`
  }
  p.text(
    legendText,
    xPosRight,
    legendTextYStart,
  )
  if (language === 'en') {
    legendText = "state that the other"
  } else if (language === 'de') {
    legendText = "finden, dass die"
  }
  p.textSize(fontSizeLegend);
  p.text(
    legendText,
    xPosRight,
    legendTextYStart + 1*lineHeightLegend,
  )
  if (language === 'en') {
    legendText = `people ${selData[0]['country_prefix'].toLowerCase()} ${selData[0]['country']}`
  } else if (language === 'de') {
    legendText = `anderen Menschen ${selData[0]['country_de_prefix'].toLowerCase()} `
  }
  p.text(
    legendText,
    xPosRight,
    legendTextYStart + 2*lineHeightLegend,
  )
  if (language === 'en') {
    legendText = "should do more to"
  } else if (language === 'de') {
    legendText = `${selData[0]['country_de_decl']} mehr für `
  }
  p.text(
    legendText,
    xPosRight,
    legendTextYStart + 3*lineHeightLegend,
  )
  if (language === 'en') {
    legendText = "fight global warming."
  } else if (language === 'de') {
    legendText = "Klimaschutz tun sollten."
  }
  p.text(
    legendText,
    xPosRight,
    legendTextYStart + 4*lineHeightLegend,
  )

  // government
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.fill(colors['gccs_government']);
  let lineHeightGov;
  if (['Saudi Arabia', 'Myanmar', 'United Arab Emirates'].includes(selCountry)) {
    p.textSize(fontSizeLegend);
    lineHeightGov = lineHeightLegend;
    if (language === 'en') {
      legendText = `${selData[0]['country_prefix']} ${selData[0]['country']},`
    } else if (language === 'de') {
      legendText = `${selData[0]['country_de_prefix']} ${selData[0]['country_de_decl']}`
    }
  } else {
    p.textSize(fontSizePercent);
    lineHeightGov = lineHeightLegend;
    if (language === 'en') {
      legendText = `${selData[0]['gccs_government']}%`
    } else if (language === 'de') {
      legendText = `${selData[0]['gccs_government']}%`
    }
  }
  p.text(
    legendText,
    xPosLeft,
    legendTextYStart2,
  )

  if (['Saudi Arabia', 'Myanmar', 'United Arab Emirates'].includes(selCountry)) {
    if (language === 'en') {
      legendText = "people were not asked"
    } else if (language === 'de') {
      legendText = "wurde nicht gefragt,"
    }
  } else {
    if (language === 'en') {
      legendText = "demand more"
    } else if (language === 'de') {
      legendText = "verlangen mehr"
    }
  }
  p.textSize(fontSizeLegend);
  p.text(
    legendText,
    xPosLeft,
    legendTextYStart2 + lineHeightGov,
  )

  if (['Saudi Arabia', 'Myanmar', 'United Arab Emirates'].includes(selCountry)) {
    if (language === 'en') {
      legendText = "whether the government"
    } else if (language === 'de') {
      legendText = "ob die Regierung"
    }
  } else {
    if (language === 'en') {
      legendText = "political action from"
    } else if (language === 'de') {
      legendText = "politisches Handeln"
    }
  }
  p.text(
    legendText,
    xPosLeft,
    legendTextYStart2 + lineHeightGov + 1*lineHeightLegend,
  )

  if (['Saudi Arabia', 'Myanmar'].includes(selCountry)) {
    if (language === 'en') {
      legendText = "should do more."
    } else if (language === 'de') {
      legendText = "mehr tun soll."
    }
  } else {
    if (language === 'en') {
      legendText = "the government."
    } else if (language === 'de') {
      legendText = `von der Regierung.`
    }
  }
  p.text(
    legendText,
    xPosLeft,
    legendTextYStart2 + lineHeightGov + 2*lineHeightLegend,
  )

  // final sentences
  p.textAlign(p.LEFT, p.BOTTOM);
  p.fill(0); // TODO grey?
  p.textSize(fontSizeText);
  if (language === 'en') {
    legendText = "This pattern repeats in all 125 countries that were part of the study. Globally, 86%"
  } else if (language === 'de') {
    legendText = "Dieses Muster wiederholt sich in allen 125 Ländern aus der Studie. Global wollen"
  }
  p.text(
    legendText,
    titleTextX,
    legendTextYStart3,
  )
  if (language === 'en') {
    legendText = "want that people and 89% want that politics do more to fight global warming."
  } else if (language === 'de') {
    legendText = "86% dass die Bevölkerung und 89% dass die Politik mehr Klimaschutz macht."
  }
  p.text(
    legendText,
    titleTextX,
    legendTextYStart3 + 1*lineHeightText,
  )
  if (language === 'en') {
    legendText = "With whom will you share this?"
  } else if (language === 'de') {
    legendText = "Wem sagst du dies weiter?"
  }
  p.text(
    legendText,
    titleTextX,
    legendTextYStart3 + 2*lineHeightText,
  )
}

function addAuthorText(p) {
  // add author text as separating line

  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(fontSizeSource);
  p.noStroke();
  p.fill(0);
  p.push();
  p.translate(pcWidth*0.56, pcHeight/2);
  p.rotate(-p.PI/2);
  p.text(
    "Lilian Gasser . CAS Generative Data Design . Hochschule der Künste Bern . 2025",
    0,
    0,
  )
  p.pop()

}

function addInfoText(p) {
  // add more info block

  p.textAlign(p.LEFT, p.BOTTOM);
  p.textSize(fontSizeSource);
  p.noStroke(); 
  p.fill(0);
  if (language === 'en') {
    infoText = "Continue reading: https://rcap.netlify.app . Data source: Global Climate Change Survey https://gccs.iza.org/"
  } else if (language === 'de') {
    infoText = "Weiterlesen: https://rcap.netlify.app . Datenquelle: Global Climate Change Survey https://gccs.iza.org/"
  }
  p.text(
    infoText,
    titleTextX,
    infoTextY,
  )

}

function addAddressBlock(p) {
  // address block

  p.push();
  p.noFill();
  p.stroke(200);
  p.strokeWeight(0.8);
  p.line(pcWidth*0.54 + 60, pcHeight*0.50, pcWidth - 70, pcHeight*0.50);
  p.line(pcWidth*0.54 + 60, pcHeight*0.58, pcWidth - 70, pcHeight*0.58);
  p.line(pcWidth*0.54 + 60, pcHeight*0.66, pcWidth - 70, pcHeight*0.66);
  p.line(pcWidth*0.54 + 60, pcHeight*0.74, pcWidth - 70, pcHeight*0.74);
  p.pop();

}

function exportCanvases() {
  let parts = [
    selCountry, 
    motifSelect.value(),
    nCellsX, 
    layoutSelect.value(),
    colors['gccs_wtp'], 
    colors['gccs_wtp_belief'],
    colors['gccs_norm'],
    colors['gccs_government']];
  let filename = parts.join('_');
  sketchFrontInstance.save(filename + '_postcardfront', 'svg');
  sketchBackInstance.save(filename + '_postcardback', 'svg');
  sketchMotifInstance.save(filename + '_motif', 'svg');
}




// motifs
// ------------------------------------------------

function windwheelMotif(p, addRotation) {
  // isosceles (gleichschenklige) triangles adjusting length of hypotenuse
  // all triangles have the same height, i.e., cellWidth/2
  // Area = 1/2 * hypotenuse * height = 1/2 * hypotenuse * cellWidth/2
  // --> hypotenuse = 4*Area / cellWidth

  p.noStroke();

  let adjustedHypotenuse;
  let selVar;
  let initialRotation = -p.PI/2 + addRotation;
  let area;

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
  let el;

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
  let r;
  let h;

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
      } else if (shape == 'arcdonut') {
        r = rScaleDonut(selData[0][selVar]);
        p.arc(0, 0, r, r, 0, p.PI/2);
        p.fill(colors['background']);
        p.ellipse(0, 0, rmin, rmin);
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

  let h;

  // wtp
  // (unclear why -h is needed for this pattern...)
  if (selData[0].gccs_wtp) {
    h = hScale(selData[0].gccs_wtp);
    p.fill(colors['gccs_wtp']);
    p.rect(-cellWidth/2, 0, cellWidth/2, -h);
  }

  // norm
  if (selData[0].gccs_norm) {
    h = hScale(selData[0].gccs_norm);
    p.fill(colors['gccs_norm']);
    p.rect(0, 0, cellWidth/2, -h);
  }

  // wtp belief
  if (selData[0].gccs_wtp_belief) {
    h = hScale(selData[0].gccs_wtp_belief);
    p.fill(colors['gccs_wtp_belief']);
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
  let r;
  let angle;

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

  let r;

  // wtp
  if (selData[0].gccs_wtp) {
    r = rScaleHalfCell(selData[0].gccs_wtp);
    p.fill(colors['gccs_wtp']);
    if (type == 'close') {
      p.arc(-3*cellWidth/8, -cellHeight/4, r, r, p.PI, p.PI/2);
    } else if (type == 'regular') {
      p.arc(-cellWidth/4, -cellHeight/4, r, r, p.PI, p.PI/2);
    }
  }

  // norm 
  if (selData[0].gccs_norm) {
    r = rScaleHalfCell(selData[0].gccs_norm);
    p.fill(colors['gccs_norm']);
    if (type == 'close') {
      p.arc(3*cellWidth/8, -cellHeight/4, r, r, 0, 3*p.PI/2);
    } else if (type == 'regular') {
      p.arc(cellWidth/4, -cellHeight/4, r, r, 0, 3*p.PI/2);
    }
  }

  // wtp belief
  if (selData[0].gccs_wtp_belief) {
    r = rScaleHalfCell(selData[0].gccs_wtp_belief);
    p.fill(colors['gccs_wtp_belief']);
    if (type == 'close') {
      p.arc(cellWidth/8, cellHeight/4, r, r, p.PI, p.PI/2);
    } else if (type == 'regular') {
      p.arc(cellWidth/4, cellHeight/4, r, r, p.PI, p.PI/2);
    }
  }

  // government
  if (selData[0].gccs_government) {
    r = rScaleHalfCell(selData[0].gccs_government);
    p.fill(colors['gccs_government']);
    if (type == 'close') {
      p.arc(-cellWidth/8, cellHeight/4, r, r, 0, 3*p.PI/2);
    } else if (type == 'regular') {
      p.arc(-cellWidth/4, cellHeight/4, r, r, 0, 3*p.PI/2);
    }
  }

}



function arcMotif2(p) {

  p.noStroke();

  let r;

  // wtp
  if (selData[0].gccs_wtp) {
    p.fill(colors['gccs_wtp']);
    r = rScale(selData[0].gccs_wtp);
    p.arc(0, -cellHeight/2, r, r, p.PI/2, p.PI);
  }

  // norm
  if (selData[0].gccs_norm) {
    p.fill(colors['gccs_norm']);
    r = rScale(selData[0].gccs_norm);
    p.arc(0, 0, r, r, -p.PI/2, 0);
  }

  // wtp_belief
  if (selData[0].gccs_wtp_belief) {
    p.fill(colors['gccs_wtp_belief']);
    r = rScale(selData[0].gccs_wtp_belief);
    p.arc(cellWidth/2, 0, r, r, p.PI/2, p.PI);
  }

  // government
  if (selData[0].gccs_government) {
    p.fill(colors['gccs_government']);
    r = rScale(selData[0].gccs_government);
    p.arc(-cellWidth/2, cellHeight/2, r, r, -p.PI/2, 0);
  }
}

function circlesMotif(p) {
  // filled circles in a 2x2 grid

  p.noStroke();
  let selVar;
  let initialRotation = p.PI;
  let r;

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
  let r;
  let alpha;
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
