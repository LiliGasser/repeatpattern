
// TODO load from file by country
let gccs_values = {
  'wtp_1': 68,
//  'wtp_pos': 75,
//  'wtp': 71,
  'wtp_1_belief': 41,
  'norm': 91,
  'government': 84,
}

// dropdown menus for selection and export button
let selectCountry;
let selectMotif;
let selectSymmetry;
let selectColors;
let exportButton;

// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt();
let r;

// define postcard size (A5 postcard: 210mm x 148mm)
// calculation: https://imageonline.co/mm-to-px.php
// laptop screen: 1920 x 1200, 14'' diagonal --> 162 ppi; 60Hz
let pcWidthMM = 210; // mm
let pcHeightMM = 148; // mm
let dpi = 150; // dots per inch
let pcWidth = Math.floor(pcWidthMM * dpi / 25.4);
let pcHeight = Math.floor(pcHeightMM * dpi / 25.4);
let pcPosX = 300; // x position of postcard
let pcPosY = 100; // y position of postcard

// define cell
let cellWidth = 100;
let cellHeight = 100;
let nCells;

function setup() {
  let cnv = createCanvas(pcWidth, pcHeight);
  cnv.position(pcPosX, pcPosY);
  noLoop();

  // load data from file
  // TODO continue here!
  d3.csv("data/gccs_country_with_temperature_and_gdp.csv").then(data => {
    console.log(data);
    // TODO filter data by country

  });


  // create dropdown menu for country selection
  // TODO change font size --> tailwindcss
  selectCountry = createSelect();
  selectCountry.position(30, 100);
  selectCountry.option('Switzerland');
  selectCountry.size(200, 50);

  // create dropdown menu for motif selection
  selectMotif = createSelect();
  selectMotif.position(30, 160);
  selectMotif.option('Motif 1');
  selectMotif.size(200, 50);

  // create dropdown menu for symmetry selection
  selectSymmetry = createSelect();
  selectSymmetry.position(30, 220);
  selectSymmetry.option('Translation (3.1)');
  selectSymmetry.size(200, 50);

  // create dropdown menu for color selection
  selectColors = createSelect();
  selectColors.position(30, 280);
  selectColors.option('Color Scheme 1');
  selectColors.size(200, 50);

  // create export button
  // TODO export as other file formats (e.g. svg)
  exportButton = createButton('Export postcard');
  exportButton.position(30, 340);
  exportButton.size(200, 50);
  exportButton.mousePressed(() => {
    saveCanvas('postcard', 'png');
  });

  // TODO test for cell sizes where multiplication with width and height does not result in integer values
  nCells = Math.ceil(pcWidth / cellWidth) * Math.ceil(pcHeight / cellHeight);
  console.log('nCells: ' + nCells);
  console.log('pcWidth: ' + pcWidth + ', pcHeight: ' + pcHeight);


  rScale.domain([0, 100]).range([1, Math.min(cellWidth, cellHeight) * 0.8]);

}

function draw() {
  background(220);
  
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
    if (x >= pcWidth) {
      x = 0;
      y += cellHeight;
    }

  }

}

function drawGrid(x, y) {

  // TODO dashed grid lines: https://github.com/processing/p5.js/issues/3336#issuecomment-441457612
  noFill();
  stroke(100);
  strokeWeight(1);
  rect(x, y, cellWidth, cellHeight);

}

function drawMotif(x, y) {
  //console.log('drawMotif at x: ' + x + ', y: ' + y);
  noStroke();

  // wtp_1
  r = rScale(gccs_values['wtp_1']);
  fill(100, 150, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);

  // wtp_1_belief
  r = rScale(gccs_values['wtp_1_belief']);
  fill(100, 0, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, 0, PI/2);

  // norm
  r = rScale(gccs_values['norm']);
  fill(0, 100, 150);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI/2, PI);

  // government
  r = rScale(gccs_values['government']);
  fill(100, 0, 200);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI, -PI/2);

}