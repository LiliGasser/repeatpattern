

// TODO load from file by country
let gccs_values = {
  'wtp_1': 68,
//  'wtp_pos': 75,
//  'wtp': 71,
  'wtp_1_belief': 41,
  'norm': 91,
  'government': 84,
}
let selVar = 'wtp_1';

// TODO buttons for countries

// TODO proper motif with corresponding scales
let rScale = d3.scaleSqrt();
let r;

// define cell
let cellWidth = 150;
let cellHeight = 150;
//let margin = {
  //top: 0,
  //right: 0,
  //bottom: 0,
  //left: 0
//}
let nCells;

function setup() {
  // TODO how to calculate the size of the canvas in pixels? postcard: 210mm x 148mm
  // https://imageonline.co/mm-to-px.php with 300 dpi
  createCanvas(2480, 1748);
  noLoop();

  // TODO test for cell sizes where multiplication with width and height does not result in integer values
  nCells = Math.ceil(width / cellWidth) * Math.ceil(height / cellHeight);
  console.log('nCells: ' + nCells);

  rScale.domain([0, 100]).range([1, 120]);

}

function draw() {
  background(220);
  rectMode(TOP, LEFT);

  // initialize x and y
  let x = 0;
  let y = 0;
  for (let i = 0; i < nCells; i++) {

    // draw grid
    drawGrid(x, y);

    // draw motif
    drawMotif(x, y);

    // move to next cell: planar symmetry with translation
    // TODO other symmetriy operations
    x = x + cellWidth;
    if (x >= width) {
      x = 0;
      y += cellHeight;
    }

  }

  // TODO draw motif in separate for loop?

}

function drawGrid(x, y) {

  // TODO dashed grid lines: https://github.com/processing/p5.js/issues/3336#issuecomment-441457612
  noFill();
  stroke(100);
  strokeWeight(1);
  rect(x, y, cellWidth, cellHeight);

}

function drawMotif(x, y) {
  console.log('drawMotif at x: ' + x + ', y: ' + y);
  noStroke();

  // wtp_1
  r = rScale(gccs_values['wtp_1']);
  console.log('radius wtp_1: ' + r);
  fill(100, 150, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, -PI/2, 0);

  // wtp_1_belief
  r = rScale(gccs_values['wtp_1_belief']);
  console.log('radius wtp_1_belief: ' + r);
  fill(100, 0, 0);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, 0, PI/2);

  // norm
  r = rScale(gccs_values['norm']);
  console.log('radius norm: ' + r);
  fill(0, 100, 150);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI/2, PI);

  // government
  r = rScale(gccs_values['government']);
  console.log('radius government: ' + r);
  fill(100, 0, 200);
  arc(x + cellWidth/2, y + cellHeight/2, r, r, PI, -PI/2);

}