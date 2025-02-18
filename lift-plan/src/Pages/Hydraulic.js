import React, { useEffect, useRef, useCallback, useState } from 'react';
import doorDimensionsLibrary from './doorDimensionsLibrary';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';



const T_SHAPE_RAIL_OPTIONS = {
  "standard 9mm": { width: 65, height: 70, widthThickness: 9, heightThickness: 9 },
  "standard 16mm": { width: 70, height: 75, widthThickness: 16, heightThickness: 16 },
  "Monteferro 9mm": { width: 60, height: 65, widthThickness: 9, heightThickness: 9 },
  "Monteferro 16mm": { width: 89.5, height: 62, widthThickness: 9, heightThickness: 16 },
  "Marazzi 9mm": { width: 62, height: 67, widthThickness: 9, heightThickness: 9 },
  "Marazzi 16mm": { width: 68, height: 72, widthThickness: 16, heightThickness: 16 },
};

const Hydraulic = () => {
  const canvasRef = useRef(null);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const location = useLocation();

 
  // Get project and load details from navigation state
  const projectDetails = location.state?.projectDetails || {};
  const loadDetails = location.state?.loadDetails || {};
  const [selectedScale, setSelectedScale] = useState(1 / 25); // Default scale
  const PIXELS_PER_MM = 5; // Conversion factor for actual size
  const SCALE_FACTOR = PIXELS_PER_MM *  selectedScale; // Pixels per mm at 1:25 scale mm at 1:25 scale
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level

  const scaledFactor = SCALE_FACTOR * zoomLevel; // Apply zoom to scaling

   const [shaftDimensions, setShaftDimensions] = useState({
    innerWidth: 1590, // Inner shaft width in mm
    innerDepth:1528, // Inner shaft depth in mm
    });

    const [wallThickness, setWallThickness] = useState({
      rear: 250,   // Rear wall thickness in mmf
      front: 250,  // Front wall thickness in mm
      left: 250,   // Left wall thickness in mm
      right: 250,  // Right wall thickness in mm
  });

  const [verticalOffset, setVerticalOffset] = useState(0);

  const [tShapeSettings, setTShapeSettings] = useState({
    width: 62,
    height: 65,
    widthThickness: 9,  // Separate thickness for width
    heightThickness: 16, // Separate thickness for height
    offsetX: 150,
    offsetY: 150,
    leftOffsetX :150,
    rightOffsetX: 150,
    railDistance: 700,
    selectedWall: [] // Default to left wall
  });
 
  const [bracketsSettings, setBracketsSettings] = useState({
    width:250, // Width of the brackets
    height: 50, // Height of the brackets
    frameHeight: 200  // Default car frame height, in mm
  });
  const [horizontalOffsetX, setHorizontalOffsetX] = useState(0); // Adjust the default value as needed
  const [verticalOffsetY, setVerticalOffsetY] = useState(0);


  const [wallOpeningOffset, setWallOpeningOffset] = useState(0);

  const [DoorDimensions, setDoorDimensions] = useState({
    width: 700, // Door width in mm
    height: 54, // Door height in mm (default)
  });
  const [selectedDoorType, setSelectedDoorType] = useState('S2C'); // Define state here

  const [selectedRailType, setSelectedRailType] = useState("standard 9mm");
  
  
  const doorWidths = [
    600, 650, 700, 750, 800, 850, 900, 1000, 
    1100, 1200, 1300, 1400, 1500, 1600, 
    1700, 1800, 1900, 2000
  ];
  const dimensions = doorDimensionsLibrary[selectedDoorType]?.[DoorDimensions.width];

  const [landingDoorDimensions, setLandingDoorDimensions] = useState({});
  
  const [carDoorDimensions, setCarDoorDimensions] = useState({ });

  const [cabinSettings, setCabinSettings] = useState({
    wallThickness: 30,        // Inner wall thickness in mm
    leftDistance: 200,         // Default distance for left wall
    rightDistance: 200,        // Default distance for right wall
    rearDistance: 100,         // Default distance for rear wall
    railDistance: 300, 
    frontDistance: 60,      // Default distance for rail wall
});


const[ carDoorjamb , setCarDoorJamb] = useState(60);

  const [doorGap, setDoorGap] = useState(30);  // Gap between the landing door and car door in mm
  
  const [doorFrameSettings, setDoorFrameSettings] = useState({
    width: 120, // Default width in mm
    height: 60, // Default height in mm
  });
 
 
  

  const downloadPDF = () => {
    const mainCanvas = canvasRef.current;
   

    if (!mainCanvas ) return;

    const mainImg = mainCanvas.toDataURL('image/png'); // Convert main canvas to image
   
    const pdf = new jsPDF({
        orientation: 'portrait', // 'portrait' (vertical) or 'landscape' (horizontal)
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin =20*SCALE_FACTOR; // Margin from edges

    // Scale images proportionally
    const mainImgWidth = pageWidth - 5 * margin;
    const mainImgHeight = (mainCanvas.height / mainCanvas.width) * mainImgWidth;




    const totalHeight = mainImgHeight+ margin; // Combined height with spacing

    if (totalHeight <= pageHeight ) {
        // Both images fit within a single A4 page
        pdf.addImage(mainImg, 'PNG', margin, margin, mainImgWidth, mainImgHeight);
      
    } else {
        // If images exceed one page, scale them down to fit within page height
        const scaleFactor = (pageHeight ) / totalHeight;
        const scaledMainHeight = mainImgHeight*scaleFactor ;
   

        pdf.addImage(mainImg, 'PNG', margin, margin, mainImgWidth, scaledMainHeight);
     
    }

    pdf.save('Hydraulic_Drawing.pdf'); // Save PDF
};



  const drawShaft = useCallback((context) => {
     // Clear previous drawings
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // Function logic here...
  // Apply zoom before drawing
  context.save();
  context.scale(zoomLevel, zoomLevel);
  const startX = 150; 
  const startY = 175;

  // Inner shaft dimensions
  const innerWidthPx = shaftDimensions.innerWidth * SCALE_FACTOR;
  const innerDepthPx = shaftDimensions.innerDepth * SCALE_FACTOR;

 


    // Draw the shaft, walls, doors, etc.
    context.strokeStyle = 'black';
    
    context.lineWidth = 4;
    context.strokeRect(startX, startY, innerWidthPx, innerDepthPx); // Draw inner shaft



  // Convert wall thickness for each wall to pixels
  const rearWallThicknessPx = wallThickness.rear * SCALE_FACTOR;
  const frontWallThicknessPx = wallThickness.front * SCALE_FACTOR;
  const leftWallThicknessPx = wallThickness.left * SCALE_FACTOR;
  const rightWallThicknessPx = wallThickness.right * SCALE_FACTOR;

  // Starting points for the outer shaft walls
  const outerStartX = 150 - leftWallThicknessPx;
  const outerStartY = 175 - rearWallThicknessPx;

  // Calculate outer shaft dimensions
  const outerWidthPx = innerWidthPx + leftWallThicknessPx + rightWallThicknessPx;  // Add left and right wall thickness
  const outerDepthPx = innerDepthPx + frontWallThicknessPx + rearWallThicknessPx;  // Add front and rear wall thickness

 // Fill walls with concrete color
 context.fillStyle = "#d9d9d9"; // Concrete gray color

 // Fill Rear Wall
 context.fillRect(outerStartX, outerStartY, outerWidthPx, rearWallThicknessPx);

 // Fill Front Wall
 context.fillRect(outerStartX, outerStartY + outerDepthPx - frontWallThicknessPx, outerWidthPx, frontWallThicknessPx);
// Fill Front Wall

 context.fillRect(outerStartX, outerStartY, leftWallThicknessPx, outerDepthPx);

 // Fill Right Wall
 context.fillRect(outerStartX + outerWidthPx - rightWallThicknessPx, outerStartY, rightWallThicknessPx, outerDepthPx);
  // Draw the outer shaft walls
  context.strokeStyle = 'black';
  context.lineWidth = 2;

  // Draw the outer shaft rectangle (with varying wall thickness)
  context.strokeRect(outerStartX, outerStartY, outerWidthPx, outerDepthPx);
  
  // Add axis lines at mouse position
 


    // Dimension lines for inner width
     const arrowSize = 32*SCALE_FACTOR;
    const labelFontSize = 72*SCALE_FACTOR;
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    context.lineWidth = 1;

    // Horizontal dimension line (inner width)
    const widthLineY = outerStartY  - 475* SCALE_FACTOR ; // Below the inner shaft
    context.beginPath();
    context.moveTo(startX, widthLineY);
    context.lineTo(startX + innerWidthPx, widthLineY);
    context.stroke();

    // Add arrows for inner width
    context.beginPath();
    context.moveTo(startX+ arrowSize, widthLineY - arrowSize / 2);
    context.lineTo(startX+ arrowSize, widthLineY + arrowSize / 2);
    context.lineTo(startX + arrowSize - arrowSize, widthLineY);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(startX - arrowSize+ innerWidthPx, widthLineY - arrowSize / 2);
    context.lineTo(startX - arrowSize + innerWidthPx, widthLineY + arrowSize / 2);
    context.lineTo(startX - arrowSize+ innerWidthPx + arrowSize, widthLineY);
    context.closePath();
    context.fill();
    // Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX , startY );
context.lineTo(startX, widthLineY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx ,startY );
context.lineTo(startX+ innerWidthPx ,widthLineY);
context.stroke();

    // Label for inner width (horizontal text)
context.save();
context.font = `${labelFontSize}px Arial`; // Set font size and style
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`SW ${shaftDimensions.innerWidth} `, startX + innerWidthPx / 2, widthLineY -40*SCALE_FACTOR); // Adjusted Y for readability
context.restore();

    // Vertical dimension line (inner depth)
    const depthLineX =outerStartX + innerWidthPx + leftWallThicknessPx+ rightWallThicknessPx + 350 *SCALE_FACTOR; // To the right of the inner shaft
    context.beginPath();
    context.moveTo(depthLineX, startY);
    context.lineTo(depthLineX, startY + innerDepthPx);
    context.stroke();

    // Add arrows for inner depth
    context.beginPath();
    context.moveTo(depthLineX - arrowSize / 2, startY+ arrowSize);
    context.lineTo(depthLineX + arrowSize / 2, startY + arrowSize);
    context.lineTo(depthLineX, startY );
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(depthLineX - arrowSize / 2, startY - arrowSize + innerDepthPx);
    context.lineTo(depthLineX + arrowSize / 2, startY- arrowSize + innerDepthPx);
    context.lineTo(depthLineX, startY + innerDepthPx );
    context.closePath();
    context.fill();
    context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX , startY );
context.lineTo( depthLineX, startY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(startX ,startY+innerDepthPx );
context.lineTo( depthLineX ,startY+innerDepthPx);
context.stroke();

    // Label for inner depth (rotated vertical text)
context.save();
context.font = `${labelFontSize}px Arial`; // Set font size and style
context.translate(depthLineX +40*SCALE_FACTOR, startY + innerDepthPx / 2); // Move context to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`SD ${shaftDimensions.innerDepth} `, 0, 0);
context.restore();


// Rear wall thickness (vertical dimension line)
const rearWallLineX = outerStartX + innerWidthPx+ leftWallThicknessPx+ rightWallThicknessPx + 350 * SCALE_FACTOR;
context.strokeStyle = 'Black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Rear wall dimension line
context.beginPath();
context.moveTo(rearWallLineX, outerStartY + arrowSize); // Start below arrow tip
context.lineTo(rearWallLineX, outerStartY + rearWallThicknessPx - arrowSize); // End above arrow tip
context.stroke();

// Rear wall arrows
context.beginPath();
context.moveTo(rearWallLineX - arrowSize / 2, outerStartY + arrowSize);
context.lineTo(rearWallLineX + arrowSize / 2, outerStartY + arrowSize);
context.lineTo(rearWallLineX, outerStartY);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(rearWallLineX - arrowSize / 2, outerStartY + rearWallThicknessPx - arrowSize);
context.lineTo(rearWallLineX + arrowSize / 2, outerStartY + rearWallThicknessPx - arrowSize);
context.lineTo(rearWallLineX, outerStartY + rearWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX , startY- rearWallThicknessPx );
context.lineTo( rearWallLineX, startY- rearWallThicknessPx);
context.stroke();


// Rear wall label (rotated vertically)
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearWallLineX +40*SCALE_FACTOR, outerStartY + rearWallThicknessPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`${wallThickness.rear} `, 0, 0);
context.restore();

// Front wall thickness (vertical dimension line)
const frontWallLineX = outerStartX + outerWidthPx + 350 * SCALE_FACTOR; // Position for front wall dimension line


// Front wall dimension line
context.beginPath();
context.moveTo(frontWallLineX, outerStartY + outerDepthPx- arrowSize); // Start below the top arrow
context.lineTo(frontWallLineX, outerStartY +  outerDepthPx- frontWallThicknessPx  + arrowSize); // End above the bottom arrow
context.stroke();

// Front wall arrows
context.beginPath();
context.moveTo(frontWallLineX - arrowSize / 2, outerStartY + outerDepthPx - arrowSize);
context.lineTo(frontWallLineX + arrowSize / 2, outerStartY+outerDepthPx - arrowSize);
context.lineTo(frontWallLineX, outerStartY + outerDepthPx);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(frontWallLineX - arrowSize / 2, outerStartY+ outerDepthPx - frontWallThicknessPx + arrowSize);
context.lineTo(frontWallLineX + arrowSize / 2, outerStartY+ outerDepthPx - frontWallThicknessPx + arrowSize);
context.lineTo(frontWallLineX, outerStartY +outerDepthPx- frontWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX , startY +innerDepthPx+ frontWallThicknessPx);
context.lineTo( rearWallLineX, startY +innerDepthPx+ frontWallThicknessPx);
context.stroke();

// Front wall label (rotated vertically)
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(frontWallLineX +40*SCALE_FACTOR, outerStartY + outerDepthPx - frontWallThicknessPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`${wallThickness.front} `, 0, 0);
context.restore();



// Left wall thickness (horizontal dimension line)
const leftWallLineY = outerStartY  - 475 * SCALE_FACTOR;
context.beginPath();
context.moveTo(outerStartX + arrowSize, leftWallLineY); // Start right of arrow tip
context.lineTo(outerStartX + leftWallThicknessPx - arrowSize, leftWallLineY); // End left of arrow tip
context.stroke();

// Left wall arrows
context.beginPath();
context.moveTo(outerStartX + arrowSize, leftWallLineY - arrowSize / 2);
context.lineTo(outerStartX + arrowSize, leftWallLineY + arrowSize / 2);
context.lineTo(outerStartX, leftWallLineY);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(outerStartX + leftWallThicknessPx - arrowSize, leftWallLineY - arrowSize / 2);
context.lineTo(outerStartX + leftWallThicknessPx - arrowSize, leftWallLineY + arrowSize / 2);
context.lineTo(outerStartX + leftWallThicknessPx, leftWallLineY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX -leftWallThicknessPx, startY );
context.lineTo(startX-leftWallThicknessPx, leftWallLineY);
context.stroke();



// Left wall label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`${wallThickness.left} `, outerStartX + leftWallThicknessPx / 2, leftWallLineY -40*SCALE_FACTOR);
context.restore();

// Right wall thickness (horizontal dimension line)
const rightWallLineY = outerStartY -475 * SCALE_FACTOR;
context.beginPath();
context.moveTo(outerStartX + outerWidthPx - rightWallThicknessPx + arrowSize, rightWallLineY);
context.lineTo(outerStartX + outerWidthPx - arrowSize, rightWallLineY);
context.stroke();

// Right wall arrows
context.beginPath();
context.moveTo(outerStartX + outerWidthPx - rightWallThicknessPx + arrowSize, rightWallLineY - arrowSize / 2);
context.lineTo(outerStartX + outerWidthPx - rightWallThicknessPx + arrowSize, rightWallLineY + arrowSize / 2);
context.lineTo(outerStartX + outerWidthPx - rightWallThicknessPx, rightWallLineY);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(outerStartX + outerWidthPx - arrowSize, rightWallLineY - arrowSize / 2);
context.lineTo(outerStartX + outerWidthPx - arrowSize, rightWallLineY + arrowSize / 2);
context.lineTo(outerStartX + outerWidthPx, rightWallLineY);
context.closePath();
context.fill();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;


// Right perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx+ rightWallThicknessPx ,startY );
context.lineTo(startX+ innerWidthPx +rightWallThicknessPx,leftWallLineY);
context.stroke();

// Right wall label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`${wallThickness.right} `, outerStartX + outerWidthPx - rightWallThicknessPx / 2, rightWallLineY -40*SCALE_FACTOR);
context.restore();
// Draw dimension line from the left inner shaft wall to the left wall opening line

  







   

    // Draw components inside the shaft (Door , door frames, T-shape guide rails, etc.)


    drawTShapeWithFrame(context, startX, startY, innerWidthPx, innerDepthPx, bracketsSettings);
    drawCabin(context, startX, startY, innerWidthPx, innerDepthPx);
  
   

  
    // Call door-specific drawing functions
  switch (selectedDoorType) {
    case 'S1L':
      drawDoorsS1L(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
    case 'S1R':
      drawDoorsS1R(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
    case 'S2C':
      drawDoorsS2C(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
      case 'S2L':
      drawDoorsS2L(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
    case 'S2R':
      drawDoorsS2R(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
    case 'S3L':
      drawDoorsS3L(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
      case 'S3R':
      drawDoorsS3R(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
      case 'S4C':
      drawDoorsS4C(context, startX, startY, innerWidthPx, innerDepthPx);
      break;
    // Add cases for other door types
    default:
      console.warn('Unknown door type:', selectedDoorType);
  }
  });
  
  const drawCabin = (context, startX, startY, innerWidthPx, innerDepthPx , outerStartX , outerStartY) => {
    const { selectedWall } = tShapeSettings;

    // Dynamic distances from shaft walls in pixels
    const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;
    const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
    const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
    const railwallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
    const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
    const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
    const doorGapPx = doorGap * SCALE_FACTOR;
    // Wall thickness and inner dimensions
    const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;
    const carDoorjambPx = carDoorjamb * SCALE_FACTOR -cabinWallThicknessPx +verticalOffset*SCALE_FACTOR ;
    const frontDistancePx = carDoorHeightPx + landingDoorHeightPx + doorGapPx + carDoorjambPx  ;
    const rearWallThicknessPx = wallThickness.rear * SCALE_FACTOR;
  const frontWallThicknessPx = wallThickness.front * SCALE_FACTOR;
  const leftWallThicknessPx = wallThickness.left * SCALE_FACTOR;
  const rightWallThicknessPx = wallThickness.right * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
   const arrowSize = 32*SCALE_FACTOR;
const labelFontSize = 72*SCALE_FACTOR;
const perpendicularSize = 24 *SCALE_FACTOR; // Size of the perpendicular lines
            const labelOffset = 8; // Offset for the label position


    let cabinX, cabinY, cabinWidthPx, cabinDepthPx , centerX , centerY ;

    switch (selectedWall) {
        case 'left': 
            // Offset cabin entrance by wallOpeningOffset to the right
            cabinX = startX + railwallDistancePx ;
            cabinWidthPx = innerWidthPx - railwallDistancePx - rightDistancePx;
            cabinY = startY + rearDistancePx ;  // 90 mm from rear wall
            cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx ;
            centerX = cabinX + cabinWidthPx / 2;
            centerY = cabinY + cabinDepthPx/2 + carDoorjambPx/2 +carDoorHeightPx/2 - verticalOffset*SCALE_FACTOR/2  ;
            

            // Draw the center axis for width

            
// Constants for arrow size and label font size


// Horizontal Dimension Line for Cabin Width
const cabinWidthLineY = cabinY - rearDistancePx - rearWallThicknessPx - 100 * SCALE_FACTOR; // Below the cabin

context.strokeStyle = 'black';
context.fillStyle = 'black';

// Thicker line for the main dimension line
context.lineWidth = 1; 

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, cabinWidthLineY); // Start at left edge of the cabin
context.lineTo(cabinX - cabinWallThicknessPx + cabinWidthPx, cabinWidthLineY); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize + cabinWallThicknessPx, cabinWidthLineY - arrowSize / 2);
context.lineTo(cabinX + arrowSize + cabinWallThicknessPx, cabinWidthLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWallThicknessPx, cabinWidthLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize - cabinWallThicknessPx, cabinWidthLineY - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize - cabinWallThicknessPx, cabinWidthLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinWidthLineY);
context.closePath();
context.fill();

// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWallThicknessPx, cabinWidthLineY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinWidthLineY);
context.stroke();

// Label for cabin width
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx / SCALE_FACTOR - (cabinWallThicknessPx * 2) / SCALE_FACTOR).toFixed(0)} `, 
    cabinX + cabinWidthPx / 2, cabinWidthLineY - 40 * SCALE_FACTOR);

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 100 * SCALE_FACTOR; // To the right of the cabin


// Dimension line for cabin depth
context.beginPath();
context.moveTo(cabinDepthLineX, cabinY+ cabinWallThicknessPx); // Start at top edge of the cabin
context.lineTo(cabinDepthLineX, cabinY + cabinDepthPx - cabinWallThicknessPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(cabinDepthLineX - arrowSize / 2, cabinY + arrowSize + cabinWallThicknessPx);
context.lineTo(cabinDepthLineX + arrowSize / 2, cabinY + arrowSize+ cabinWallThicknessPx);
context.lineTo(cabinDepthLineX, cabinY+ cabinWallThicknessPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(cabinDepthLineX - arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX + arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX, cabinY + cabinDepthPx - cabinWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY+cabinWallThicknessPx );
context.lineTo(cabinDepthLineX , cabinY+cabinWallThicknessPx);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx - cabinWallThicknessPx);
context.lineTo(cabinDepthLineX  , cabinY+cabinDepthPx- cabinWallThicknessPx);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();



// Horizontal Dimension Line for Cabin Width
const PlatformLineY = cabinY  - rearDistancePx- rearWallThicknessPx- 225 * SCALE_FACTOR ; // Below the cabin


// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX, PlatformLineY); // Start at left edge of the cabin
context.lineTo(cabinX + cabinWidthPx, PlatformLineY); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize, PlatformLineY - arrowSize / 2);
context.lineTo(cabinX + arrowSize, PlatformLineY + arrowSize / 2);
context.lineTo(cabinX, PlatformLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, PlatformLineY);
context.closePath();
context.fill();
// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(cabinX , PlatformLineY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx , cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx , PlatformLineY);
context.stroke();


// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX, cabinY + cabinDepthPx -verticalOffset*SCALE_FACTOR+carDoorjambPx+ carDoorHeightPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(PlatformLineX - arrowSize / 2, cabinY + arrowSize );
context.lineTo(PlatformLineX + arrowSize / 2, cabinY + arrowSize);
context.lineTo(PlatformLineX, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(PlatformLineX - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx - arrowSize+ carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX + arrowSize / 2, cabinY + cabinDepthPx+carDoorjambPx - arrowSize+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(PlatformLineX , cabinY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX  , cabinY+cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR + carDoorjambPx/SCALE_FACTOR + carDoorHeightPx/SCALE_FACTOR- verticalOffset*SCALE_FACTOR/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX = startX+ innerWidthPx+rearWallThicknessPx  + 225 * SCALE_FACTOR ; // Position left of the cabin
context.beginPath();
context.moveTo(rearDistanceLineX, startY); // Start from top of the cabin
context.lineTo(rearDistanceLineX,  startY + rearDistancePx+ verticalOffset*SCALE_FACTOR); // End at bottom of the cabin
context.stroke();

// Rear Distance Arrows
// Top arrow
context.beginPath();
context.moveTo(rearDistanceLineX - arrowSize / 2, startY+ arrowSize);
context.lineTo(rearDistanceLineX + arrowSize / 2, startY + arrowSize);
context.lineTo(rearDistanceLineX, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(rearDistanceLineX - arrowSize / 2, startY + rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX + arrowSize / 2, startY +rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX, startY+ rearDistancePx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(startX , startY );
context.lineTo(rearDistanceLineX , startY);
context.stroke();



// Rear Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearDistanceLineX +40*SCALE_FACTOR, startY+rearDistancePx/2); // Adjust label position
context.rotate(Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance


// Right Distance Horizontal Dimension Line
const rightDistanceLineY = startY - rearWallThicknessPx   - 225 * SCALE_FACTOR; // Position below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightDistanceLineY); // Start at the right edge of the cabin
context.lineTo(cabinX + cabinWidthPx + rightDistancePx, rightDistanceLineY); // End at the distance marker
context.stroke();

// Right Distance Arrows
// Left arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx + arrowSize, rightDistanceLineY - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + arrowSize, rightDistanceLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, rightDistanceLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx + rightDistancePx - arrowSize, rightDistanceLineY - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + rightDistancePx - arrowSize, rightDistanceLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + rightDistancePx, rightDistanceLineY);
context.closePath();
context.fill();

// Right Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${cabinSettings.rightDistance}`,
  cabinX + cabinWidthPx + rightDistancePx / 2,
  rightDistanceLineY -40*SCALE_FACTOR
);
context.restore();






// Left Wall Thickness Line
const leftWallThicknessLineY = startY - rearWallThicknessPx - 100 * SCALE_FACTOR; // Vertical position for the thickness line
context.strokeStyle = 'black';
context.lineWidth = 1;

// Draw the dimension line for left wall thickness
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY); // Start at the left edge
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY); // End at the right edge
context.stroke();

// Perpendicular Lines
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY - perpendicularSize / 2); // Start above the line
context.lineTo(cabinX, leftWallThicknessLineY + perpendicularSize / 2); // End below the line
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY - perpendicularSize / 2); // Start above the line
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY + perpendicularSize / 2); // End below the line
context.stroke();

// Left Wall Thickness Label
context.save();
  // Set font size and style
context.textAlign = 'center'; // Center the label
context.textBaseline = 'middle'; // Vertically align the text
context.fillStyle = 'black';
context.fillText(
  `${cabinSettings.wallThickness} `, // Label text with thickness in mm
  cabinX + cabinWallThicknessPx / 2, // Center horizontally
  leftWallThicknessLineY - labelOffset // Place above the line
);
context.restore();
// Vertical Dimension Line for Cabin Depth
const carDepthLineX = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX, cabinY- cabinWallThicknessPx+ cabinDepthPx ); // Start at top edge of the cabin
context.lineTo(carDepthLineX, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX - arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+ arrowSize);
context.lineTo(carDepthLineX + arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+arrowSize);
context.lineTo(carDepthLineX, cabinY- cabinWallThicknessPx+ cabinDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-arrowSize- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX + arrowSize / 2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx- arrowSize- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx-cabinWallThicknessPx*2)/2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(   carDoorjamb*SCALE_FACTOR/SCALE_FACTOR + carDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();


const carDepthLineX1 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX1, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx- verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX1, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx- verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX1 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX1 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX1 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX1 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx- verticalOffset*SCALE_FACTOR);

context.stroke();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX1 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX1 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx) - doorGapPx/2- verticalOffset*SCALE_FACTOR); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(  doorGapPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX2 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX2, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx+ doorGapPx - verticalOffset*SCALE_FACTOR); // Start at top edge of the cabin
context.lineTo(carDepthLineX2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx + landingDoorHeightPx- verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX2 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx+ doorGapPx- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX2 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx+ doorGapPx- verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX2 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX2 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx- verticalOffset*SCALE_FACTOR);

context.stroke();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+landingDoorHeightPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX1 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX2 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx + doorGapPx)+ landingDoorHeightPx- verticalOffset*SCALE_FACTOR)); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX3 = cabinX  - railwallDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX3, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx - verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX3, startY+ innerDepthPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX3 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX3 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx- verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX3 - perpendicularSize/2, startY+ innerDepthPx);
context.lineTo(carDepthLineX3 + perpendicularSize/2, startY+ innerDepthPx);




// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX3 -40*SCALE_FACTOR,  startY+innerDepthPx -verticalOffset*SCALE_FACTOR/2 -landingDoorHeightPx/2 - doorGapPx/2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/ SCALE_FACTOR+ doorGapPx/SCALE_FACTOR + verticalOffset*SCALE_FACTOR/SCALE_FACTOR  ).toFixed(0)} `, 0, 0);
context.restore();






// Right Wall Thickness Line
const rightWallThicknessLineY = startY - rearWallThicknessPx - 100 * SCALE_FACTOR; // Vertical position for the thickness line
context.strokeStyle = 'black';
context.lineWidth = 1;

// Draw the dimension line for right wall thickness
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY); // Start at the outer edge of the wall
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, rightWallThicknessLineY); // End at the inner edge
context.stroke();

// Perpendicular Lines
// Outer perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY - perpendicularSize / 2); // Start above the line
context.lineTo(cabinX + cabinWidthPx, rightWallThicknessLineY + perpendicularSize / 2); // End below the line
context.stroke();

// Inner perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - cabinWallThicknessPx, rightWallThicknessLineY - perpendicularSize / 2); // Start above the line
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, rightWallThicknessLineY + perpendicularSize / 2); // End below the line
context.stroke();

// Right Wall Thickness Label
context.save();
  // Set font size and style
context.textAlign = 'center'; // Center the label
context.textBaseline = 'middle'; // Vertically align the text
context.fillStyle = 'black';
context.fillText(
  `${cabinSettings.wallThickness} `, // Label text with thickness in mm
  cabinX + cabinWidthPx - cabinWallThicknessPx / 2, // Center horizontally between the ends
  rightWallThicknessLineY - labelOffset // Place above the line
);
context.restore();

const topWallThicknessLineX = startX + innerWidthPx + rightWallThicknessPx + 100 * SCALE_FACTOR; // Position to the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Draw the dimension line for top wall thickness
context.beginPath();
context.moveTo(topWallThicknessLineX, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX, cabinY + cabinWallThicknessPx); // End at the bottom of the wall
context.stroke();

// Perpendicular Lines
// Top perpendicular line
context.beginPath();
context.moveTo(topWallThicknessLineX - perpendicularSize / 2, cabinY); // Start to the left of the top point
context.lineTo(topWallThicknessLineX + perpendicularSize / 2, cabinY); // End to the right of the top point
context.stroke();

// Bottom perpendicular line
context.beginPath();
context.moveTo(topWallThicknessLineX - perpendicularSize / 2, cabinY + cabinWallThicknessPx); // Start to the left of the bottom point
context.lineTo(topWallThicknessLineX + perpendicularSize / 2, cabinY + cabinWallThicknessPx); // End to the right of the bottom point
context.stroke();

// Top Wall Thickness Label
context.save();
  // Set font size and style
context.textAlign = 'center'; // Center the label
context.textBaseline = 'middle'; // Vertically align the text
context.translate(topWallThicknessLineX + labelOffset, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`${cabinSettings.wallThickness} `, 0, 0); // Draw the label
context.restore();


// Horizontal Center Axis Dimension Line
const centerAxisLineY = cabinY  - rearDistancePx- rearWallThicknessPx - 350 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX, centerAxisLineY); // Start at the left edge
context.lineTo(centerX, centerAxisLineY); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX + arrowSize, centerAxisLineY - arrowSize / 2);
context.lineTo(startX + arrowSize, centerAxisLineY + arrowSize / 2);
context.lineTo(startX, centerAxisLineY);
context.closePath();
context.fill();




// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY);

context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((centerX - startX) / SCALE_FACTOR).toFixed(0)} `,
  (startX + centerX) / 2,
  centerAxisLineY -40*SCALE_FACTOR
);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY1 = cabinY  - rearDistancePx- rearWallThicknessPx -350 * SCALE_FACTOR ; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY1); // Start at the left edge
context.lineTo(centerX, centerAxisLineY1); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx - arrowSize, centerAxisLineY1 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx - arrowSize, centerAxisLineY1 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX + arrowSize, centerAxisLineY1 - arrowSize / 2);
context.lineTo(centerX + arrowSize, centerAxisLineY1 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY1);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(centerX,startY);
context.lineTo(centerX, centerAxisLineY1);
context.stroke();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY1 -40*SCALE_FACTOR
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX =cabinX-railwallDistancePx-leftWallThicknessPx  - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX, startY); // Start at the top edge
context.lineTo(centerAxisLineX, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX - arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX + arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX, centerY);
context.closePath();
context.fill();
context.stroke();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  centerY );
context.lineTo(centerAxisLineX , centerY);
context.stroke();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX -40*SCALE_FACTOR, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR ).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX1= cabinX-railwallDistancePx-leftWallThicknessPx  - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX1, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX1, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX1 - arrowSize / 2, startY - arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX1 + arrowSize / 2, startY - arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX1, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX1 - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX1 + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX1, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY);
context.lineTo(centerAxisLineX1, startY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY+innerDepthPx);
context.lineTo(centerAxisLineX1, startY+innerDepthPx);
context.stroke();




// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX1 -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR ).toFixed(0)} `,
  0,
  0
);
context.restore();


const centerAxisLineX1EE=   cabinX - railwallDistancePx- leftWallThicknessPx-225 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX1EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerAxisLineX1EE, centerY ); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX1EE - arrowSize / 2, startY - arrowSize + innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX1EE + arrowSize / 2, startY - arrowSize+ innerDepthPx - landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX1EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX1EE - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX1EE + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX1EE, centerY);
context.closePath();
context.fill();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX1EE, cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX1EE -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY-verticalOffset*SCALE_FACTOR) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` EE ${((  startY  + innerDepthPx -centerY -verticalOffset*SCALE_FACTOR-landingDoorHeightPx-doorGapPx) / SCALE_FACTOR ).toFixed(0)} `,
  0,
  0
);
context.restore();





context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -railwallDistancePx -leftWallThicknessPx -50*SCALE_FACTOR, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + rightDistancePx + rightWallThicknessPx+50*SCALE_FACTOR , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx -50*SCALE_FACTOR ); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+50*SCALE_FACTOR ); // Extend to the bottom edge
context.stroke();

// Reset the dash style
context.setLineDash([]);
            break;

        case 'right':
            // Offset cabin entrance by wallOpeningOffset to the left
            cabinX = startX + leftDistancePx ;
            cabinWidthPx = innerWidthPx - leftDistancePx - railwallDistancePx;
            cabinY = startY + rearDistancePx;  // 90 mm from rear wall
            cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
            centerX = cabinX + cabinWidthPx / 2;
            centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2 - verticalOffset*SCALE_FACTOR/2;

            // Constants for arrow size and label font size


// Horizontal Dimension Line for Cabin Width
const cabinWidthLineY1 = cabinY  - rearDistancePx- rearWallThicknessPx- 100 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY1); // Start at left edge of the cabin
context.lineTo(cabinX - cabinWallThicknessPx+ cabinWidthPx, cabinWidthLineY1); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY1 - arrowSize / 2);
context.lineTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY1 + arrowSize / 2);
context.lineTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY1 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY1 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, cabinWidthLineY1);
context.closePath();
context.fill();

// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWallThicknessPx, cabinWidthLineY1);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinWidthLineY1);
context.stroke();
// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY1 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX1 = cabinX  - leftDistancePx- leftWallThicknessPx- 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(cabinDepthLineX1, cabinY+ cabinWallThicknessPx); // Start at top edge of the cabin
context.lineTo(cabinDepthLineX1, cabinY + cabinDepthPx - cabinWallThicknessPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(cabinDepthLineX1 - arrowSize / 2, cabinY + arrowSize + cabinWallThicknessPx);
context.lineTo(cabinDepthLineX1 + arrowSize / 2, cabinY + arrowSize+ cabinWallThicknessPx);
context.lineTo(cabinDepthLineX1, cabinY+ cabinWallThicknessPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(cabinDepthLineX1 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX1 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX1, cabinY + cabinDepthPx - cabinWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY+cabinWallThicknessPx );
context.lineTo(cabinDepthLineX1 , cabinY+cabinWallThicknessPx);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx - cabinWallThicknessPx);
context.lineTo(cabinDepthLineX1  , cabinY+cabinDepthPx- cabinWallThicknessPx);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX1 -40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY1 = cabinY  - rearDistancePx- rearWallThicknessPx- 225 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX, PlatformLineY1); // Start at left edge of the cabin
context.lineTo(cabinX + cabinWidthPx, PlatformLineY1); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize, PlatformLineY1 - arrowSize / 2);
context.lineTo(cabinX + arrowSize, PlatformLineY1 + arrowSize / 2);
context.lineTo(cabinX, PlatformLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY1 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY1 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, PlatformLineY1);
context.closePath();
context.fill();
// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(cabinX , PlatformLineY1);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx , cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx , PlatformLineY1);
context.stroke();

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY1 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX1 = cabinX - leftDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'blackk';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX1, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX1, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx -verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(PlatformLineX1 - arrowSize / 2, cabinY + arrowSize );
context.lineTo(PlatformLineX1 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(PlatformLineX1, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(PlatformLineX1 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx - arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX1 + arrowSize / 2, cabinY + cabinDepthPx + carDoorjambPx+ carDoorHeightPx- arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX1, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(PlatformLineX1 , cabinY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX1  , cabinY+cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX1 -40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR + carDoorjambPx/ SCALE_FACTOR+ carDoorHeightPx/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX1 = cabinX - leftDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR;; // Position left of the cabin
context.beginPath();
context.moveTo(rearDistanceLineX1, startY); // Start from top of the cabin
context.lineTo(rearDistanceLineX1,  startY +rearDistancePx); // End at bottom of the cabin
context.stroke();

// Rear Distance Arrows
// Top arrow
context.beginPath();
context.moveTo(rearDistanceLineX1 - arrowSize / 2, startY+ arrowSize);
context.lineTo(rearDistanceLineX1 + arrowSize / 2, startY + arrowSize);
context.lineTo(rearDistanceLineX1, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(rearDistanceLineX1 - arrowSize / 2, startY + rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX1 + arrowSize / 2, startY +rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX1, startY+ rearDistancePx);
context.closePath();
context.fill();

// Rear Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearDistanceLineX1-40*SCALE_FACTOR, startY+rearDistancePx/2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance

// Right Distance Horizontal Dimension Line
const leftDistanceLineY = startY - rearWallThicknessPx   - 225 * SCALE_FACTOR; // Position below the cabin
context.beginPath();
context.moveTo(cabinX ,leftDistanceLineY); // Start at the right edge of the cabin
context.lineTo(cabinX  -leftDistancePx, leftDistanceLineY); // End at the distance marker
context.stroke();

// Right Distance Arrows
// Left arrow
context.beginPath();
context.moveTo(cabinX  - arrowSize, leftDistanceLineY - arrowSize / 2);
context.lineTo(cabinX  - arrowSize, leftDistanceLineY + arrowSize / 2);
context.lineTo(cabinX , leftDistanceLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX  - leftDistancePx + arrowSize, leftDistanceLineY - arrowSize / 2);
context.lineTo(cabinX - leftDistancePx + arrowSize, leftDistanceLineY + arrowSize / 2);
context.lineTo(cabinX  - leftDistancePx, leftDistanceLineY);
context.closePath();
context.fill();

// Right Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${cabinSettings.leftDistance}`,
  cabinX  - leftDistancePx/2,
  leftDistanceLineY-40*SCALE_FACTOR
);
context.restore();


// Left Wall Thickness
const leftWallThicknessLineY1 = startY - rearWallThicknessPx   - 100 * SCALE_FACTOR; // Below the cabin

context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY1 -perpendicularSize/2);
context.lineTo(cabinX, leftWallThicknessLineY1 + perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1 - perpendicularSize/2);
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1 + perpendicularSize/2);
context.stroke();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  leftWallThicknessLineY1 -40*SCALE_FACTOR
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY1 = startY   - rearWallThicknessPx   - 100 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY1  - perpendicularSize/2);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY1 + perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1  - perpendicularSize/2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1  + perpendicularSize/2);
context.stroke();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY1 -40*SCALE_FACTOR
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX1 = startX- leftWallThicknessPx - 100 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX1, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX1, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX1 - perpendicularSize/ 2, cabinY );
context.lineTo(topWallThicknessLineX1 + perpendicularSize / 2, cabinY );

context.stroke();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX1 - perpendicularSize/ 2, cabinY + cabinWallThicknessPx );
context.lineTo(topWallThicknessLineX1 + perpendicularSize / 2, cabinY + cabinWallThicknessPx );

context.stroke();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX1 -40*SCALE_FACTOR, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line

const centerAxisLineY2 = cabinY -rearDistancePx-rearWallThicknessPx - 350 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX, centerAxisLineY2); // Start at the left edge
context.lineTo(centerX, centerAxisLineY2); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX + arrowSize, centerAxisLineY2 - arrowSize / 2);
context.lineTo(startX + arrowSize, centerAxisLineY2 + arrowSize / 2);
context.lineTo(startX, centerAxisLineY2);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY2 - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY2 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY2);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((centerX - startX) / SCALE_FACTOR).toFixed(0)} `,
  (startX + centerX) / 2,
  centerAxisLineY2 -40*SCALE_FACTOR
);
context.restore();
const carDepthLineX4 = cabinX -leftDistancePx-leftWallThicknessPx- 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX4, cabinY- cabinWallThicknessPx+ cabinDepthPx); // Start at top edge of the cabin
context.lineTo(carDepthLineX4, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX4 - arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+ arrowSize);
context.lineTo(carDepthLineX4 + arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+arrowSize);
context.lineTo(carDepthLineX4, cabinY- cabinWallThicknessPx+ cabinDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX4 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX4 + arrowSize / 2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx- arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX4, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX4 -40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx)/2-verticalOffset*SCALE_FACTOR/2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(   carDoorjamb*SCALE_FACTOR/SCALE_FACTOR + carDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();


const carDepthLineX5 = cabinX -leftDistancePx-leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX5, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX5, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX5 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX5 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX5 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX5 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);

context.stroke();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX5 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX5 -40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx)-doorGapPx/2- verticalOffset*SCALE_FACTOR ); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(  doorGapPx/SCALE_FACTOR ).toFixed(0)} `,0, 0 );
context.restore();

const carDepthLineX6 = cabinX -leftDistancePx-leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX6, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx+ doorGapPx -verticalOffset*SCALE_FACTOR); // Start at top edge of the cabin
context.lineTo(carDepthLineX6, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx + landingDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX6 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX6 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX6 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX6 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);

context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+landingDoorHeightPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX6 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX6 -40*SCALE_FACTOR, cabinY + cabinDepthPx  +( (carDoorjambPx +carDoorHeightPx + doorGapPx)+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR)); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX7 =  startX + innerWidthPx+ rightWallThicknessPx + 225* SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX7, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx -verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX7, cabinY + cabinDepthPx+ frontDistancePx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX7 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX7 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX7 - perpendicularSize/2, cabinY + cabinDepthPx+ frontDistancePx);
context.lineTo(carDepthLineX7 + perpendicularSize/2,cabinY + cabinDepthPx+ frontDistancePx);

context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX7 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx+cabinWallThicknessPx*2 + doorGapPx)/2+ landingDoorHeightPx)); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/ SCALE_FACTOR+ doorGapPx/SCALE_FACTOR+verticalOffset*SCALE_FACTOR/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Center Axis Dimension Line
const centerAxisLineY3 = cabinY - rearDistancePx- rearWallThicknessPx - 350 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY3); // Start at the left edge
context.lineTo(centerX, centerAxisLineY3); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx - arrowSize, centerAxisLineY3 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx - arrowSize, centerAxisLineY3 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY3);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX + arrowSize, centerAxisLineY3- arrowSize / 2);
context.lineTo(centerX + arrowSize, centerAxisLineY3 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY3);
context.closePath();
context.fill();
// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(centerX,startY);
context.lineTo(centerX, centerAxisLineY3);
context.stroke();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY3 -40*SCALE_FACTOR
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX2 = cabinX -leftWallThicknessPx- leftDistancePx  - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX2, startY); // Start at the top edge
context.lineTo(centerAxisLineX2, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX2 - arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX2 + arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX2, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX2 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX2 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX2, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  centerY );
context.lineTo(centerAxisLineX2 , centerY);
context.stroke();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX2 -40*SCALE_FACTOR, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX3= cabinX- leftDistancePx -leftWallThicknessPx - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX3, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX3, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX3 - arrowSize / 2, startY - arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX3 + arrowSize / 2, startY - arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX3, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX3 - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX3 + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX3, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY);
context.lineTo(centerAxisLineX3, startY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY+innerDepthPx);
context.lineTo(centerAxisLineX3, startY+innerDepthPx);
context.stroke();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX3 -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();


const centerAxisLineX2EE= startX + innerWidthPx+rightWallThicknessPx+225 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX2EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerAxisLineX2EE, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX2EE - arrowSize / 2, startY - arrowSize + innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX2EE + arrowSize / 2, startY - arrowSize+ innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX2EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx - verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX2EE - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX2EE + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX2EE, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

context.beginPath();
context.moveTo(cabinX,centerY);
context.lineTo(centerAxisLineX2EE, centerY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX2EE, cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX2EE +40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` EE ${((  startY - centerY + innerDepthPx - landingDoorHeightPx- doorGapPx) / SCALE_FACTOR -verticalOffset*SCALE_FACTOR/SCALE_FACTOR ).toFixed(0)} `,
  0,
  0
);
context.restore();

            // Draw the center axis for width
            

            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -leftDistancePx -leftWallThicknessPx -50*SCALE_FACTOR, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + railwallDistancePx + rightWallThicknessPx +50*SCALE_FACTOR , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx-50*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+50*SCALE_FACTOR); // Extend to the bottom edge
context.stroke();
// Set line style for the center axis




// Reset the dash style
context.setLineDash([]);
            break;

        case 'rear':
            cabinX = startX + leftDistancePx;  // 90 mm from left wall
            cabinWidthPx = innerWidthPx - leftDistancePx - rightDistancePx;
            cabinY = startY + railwallDistancePx;  // 300 mm from rear wall where rails are
            cabinDepthPx = innerDepthPx - railwallDistancePx - frontDistancePx;
            centerX = cabinX + cabinWidthPx / 2;
            centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2+ carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;

            // Draw the center axis for width

            // Horizontal Dimension Line for Cabin Width
const cabinWidthLineY2 = cabinY  - railwallDistancePx- rearWallThicknessPx- 225 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY2); // Start at left edge of the cabin
context.lineTo(cabinX - cabinWallThicknessPx+ cabinWidthPx, cabinWidthLineY2); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY2 - arrowSize / 2);
context.lineTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY2 + arrowSize / 2);
context.lineTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY2);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY2 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY2 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, cabinWidthLineY2);
context.closePath();
context.fill();

// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWallThicknessPx, cabinWidthLineY2);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinWidthLineY2);
context.stroke();

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY2 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX2 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(cabinDepthLineX2, cabinY+ cabinWallThicknessPx); // Start at top edge of the cabin
context.lineTo(cabinDepthLineX2, cabinY + cabinDepthPx - cabinWallThicknessPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(cabinDepthLineX2 - arrowSize / 2, cabinY + arrowSize + cabinWallThicknessPx);
context.lineTo(cabinDepthLineX2 + arrowSize / 2, cabinY + arrowSize+ cabinWallThicknessPx);
context.lineTo(cabinDepthLineX2, cabinY+ cabinWallThicknessPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(cabinDepthLineX2 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX2 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX2, cabinY + cabinDepthPx - cabinWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY+cabinWallThicknessPx );
context.lineTo(cabinDepthLineX2 , cabinY+cabinWallThicknessPx);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx - cabinWallThicknessPx);
context.lineTo(cabinDepthLineX2  , cabinY+cabinDepthPx- cabinWallThicknessPx);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX2 +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY2 = cabinY  - railwallDistancePx- rearWallThicknessPx- 350 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX, PlatformLineY2); // Start at left edge of the cabin
context.lineTo(cabinX + cabinWidthPx, PlatformLineY2); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize, PlatformLineY2 - arrowSize / 2);
context.lineTo(cabinX + arrowSize, PlatformLineY2 + arrowSize / 2);
context.lineTo(cabinX, PlatformLineY2);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY2 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY2 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, PlatformLineY2);
context.closePath();
context.fill();
// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(cabinX , PlatformLineY2);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx , cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx , PlatformLineY2);
context.stroke();

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY2 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX2 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX2, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX2, cabinY + cabinDepthPx + carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(PlatformLineX2 - arrowSize / 2, cabinY + arrowSize );
context.lineTo(PlatformLineX2 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(PlatformLineX2, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(PlatformLineX2 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx - arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX2 + arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx - arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX2, cabinY + cabinDepthPx + carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(PlatformLineX2 , cabinY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX2  , cabinY+cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX2 +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR + carDoorjambPx/ SCALE_FACTOR+ carDoorHeightPx/SCALE_FACTOR  -verticalOffset*SCALE_FACTOR/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();



// Right Distance Horizontal Dimension Line
const rightDistanceLineY1 = startY - rearWallThicknessPx   - 350 * SCALE_FACTOR; // Position below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightDistanceLineY1); // Start at the right edge of the cabin
context.lineTo(cabinX + cabinWidthPx + rightDistancePx, rightDistanceLineY1); // End at the distance marker
context.stroke();

// Right Distance Arrows
// Left arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx + arrowSize, rightDistanceLineY1 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + arrowSize, rightDistanceLineY1 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, rightDistanceLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx + rightDistancePx - arrowSize, rightDistanceLineY1 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + rightDistancePx - arrowSize, rightDistanceLineY1 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx + rightDistancePx, rightDistanceLineY1);
context.closePath();
context.fill();

// Right Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${cabinSettings.rightDistance}`,
  cabinX + cabinWidthPx + rightDistancePx / 2,
  rightDistanceLineY1 -40*SCALE_FACTOR
);
context.restore();
const leftDistanceLineY1 = startY - rearWallThicknessPx   - 350 * SCALE_FACTOR; // Position below the cabin
context.beginPath();
context.moveTo(cabinX ,leftDistanceLineY1); // Start at the right edge of the cabin
context.lineTo(cabinX  -leftDistancePx, leftDistanceLineY1); // End at the distance marker
context.stroke();

// Right Distance Arrows
// Left arrow
context.beginPath();
context.moveTo(cabinX  - arrowSize, leftDistanceLineY1 - arrowSize / 2);
context.lineTo(cabinX  - arrowSize, leftDistanceLineY1 + arrowSize / 2);
context.lineTo(cabinX , leftDistanceLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX  - leftDistancePx + arrowSize, leftDistanceLineY1 - arrowSize / 2);
context.lineTo(cabinX - leftDistancePx + arrowSize, leftDistanceLineY1 + arrowSize / 2);
context.lineTo(cabinX  - leftDistancePx, leftDistanceLineY1);
context.closePath();
context.fill();

// Right Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${cabinSettings.leftDistance}`,
  cabinX  - leftDistancePx / 2,
  leftDistanceLineY1-40*SCALE_FACTOR
);
context.restore();



// Left Wall Thickness
const leftWallThicknessLineY2 = startY - rearWallThicknessPx   - 225 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY2); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY2- perpendicularSize/2);
context.lineTo(cabinX, leftWallThicknessLineY2 + perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2 - perpendicularSize/2);
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2 + perpendicularSize/2);
context.stroke();
// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  leftWallThicknessLineY2 -40*SCALE_FACTOR
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY2 = startY   - rearWallThicknessPx   - 225 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY2); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY2 - perpendicularSize/2);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY2 + perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2 - perpendicularSize/2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2 + perpendicularSize/2);
context.stroke();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY2 -40*SCALE_FACTOR
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX2 = startX+innerWidthPx+ rightWallThicknessPx + 100 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX2, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX2, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX2 -perpendicularSize / 2, cabinY );
context.lineTo(topWallThicknessLineX2 + perpendicularSize / 2, cabinY );
context.stroke();
// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX2 -perpendicularSize / 2, cabinY + cabinWallThicknessPx);
context.lineTo(topWallThicknessLineX2 +perpendicularSize / 2, cabinY + cabinWallThicknessPx);
context.stroke();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX2 +40*SCALE_FACTOR, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();

const carDepthLineX8 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX8, cabinY- cabinWallThicknessPx+ cabinDepthPx); // Start at top edge of the cabin
context.lineTo(carDepthLineX8, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX8 - arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+ arrowSize);
context.lineTo(carDepthLineX8 + arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+arrowSize);
context.lineTo(carDepthLineX8, cabinY- cabinWallThicknessPx+ cabinDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX8 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-arrowSize);
context.lineTo(carDepthLineX8 + arrowSize / 2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx- arrowSize);
context.lineTo(carDepthLineX8, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX8 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx-cabinWallThicknessPx*2)/2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(   carDoorjamb*SCALE_FACTOR/SCALE_FACTOR + carDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();


const carDepthLineX9 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX9, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX9, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX9 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX9 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX9 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX9 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);

context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX9 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX9 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx )- doorGapPx/2 -verticalOffset*SCALE_FACTOR); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(  doorGapPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX10 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX10, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx+ doorGapPx -verticalOffset*SCALE_FACTOR); // Start at top edge of the cabin
context.lineTo(carDepthLineX10, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx + landingDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX10 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX10 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX10 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX10 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);

context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+landingDoorHeightPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX10 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX10 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx + doorGapPx)+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR)); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX11 = cabinX  -leftDistancePx- leftWallThicknessPx- 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX11, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx -verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX11, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx + doorGapPx + landingDoorHeightPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX11 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX11 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx -verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX11 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx);
context.lineTo(carDepthLineX11 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx);

context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX11 -40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx+cabinWallThicknessPx*2 + doorGapPx)/2+ landingDoorHeightPx)); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/ SCALE_FACTOR+ doorGapPx/SCALE_FACTOR + verticalOffset*SCALE_FACTOR/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Center Axis Dimension Line
const centerAxisLineY4 = startY+ innerDepthPx + frontWallThicknessPx + 525 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX, centerAxisLineY4); // Start at the left edge
context.lineTo(centerX, centerAxisLineY4); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX + arrowSize, centerAxisLineY4 - arrowSize / 2);
context.lineTo(startX + arrowSize, centerAxisLineY4 + arrowSize / 2);
context.lineTo(startX, centerAxisLineY4);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY4 - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY4 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY4);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((centerX - startX) / SCALE_FACTOR).toFixed(0)} `,
  (startX + centerX) / 2,
  centerAxisLineY4 -40*SCALE_FACTOR
);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY5 = startY+innerDepthPx+frontWallThicknessPx+525 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY5); // Start at the left edge
context.lineTo(centerX, centerAxisLineY5); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx - arrowSize, centerAxisLineY5 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx - arrowSize, centerAxisLineY5 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY5);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX + arrowSize, centerAxisLineY5 - arrowSize / 2);
context.lineTo(centerX + arrowSize, centerAxisLineY5 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY5);
context.closePath();
context.fill();
// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(centerX,startY+innerDepthPx);
context.lineTo(centerX, centerAxisLineY5);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx,startY+innerDepthPx);
context.lineTo(startX+innerWidthPx, centerAxisLineY5);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX,startY+innerDepthPx);
context.lineTo(startX, centerAxisLineY5);
context.stroke();



// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY5 -40*SCALE_FACTOR
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX4 = cabinX- leftDistancePx -leftWallThicknessPx - 225 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX4, startY); // Start at the top edge
context.lineTo(centerAxisLineX4, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX4 - arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX4+ arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX4, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX4 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX4 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX4, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY);
context.lineTo(centerAxisLineX4, startY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY+innerDepthPx);
context.lineTo(centerAxisLineX4, startY+innerDepthPx);
context.stroke();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX4 -40*SCALE_FACTOR, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX5= cabinX- leftDistancePx -leftWallThicknessPx - 225 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX5, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX5, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX5 - arrowSize / 2, startY - arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX5 + arrowSize / 2, startY - arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX5, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX5 - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX5 + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX5, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  centerY );
context.lineTo(centerAxisLineX5 , centerY);
context.stroke();


// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX5 -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
const centerAxisLineX3EE= cabinX- leftDistancePx-leftWallThicknessPx  - 100 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX3EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerAxisLineX3EE, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX3EE - arrowSize / 2, startY - arrowSize + innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX3EE + arrowSize / 2, startY - arrowSize+ innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX3EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX3EE - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX3EE + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX3EE, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX3EE, cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX3EE -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` EE ${((  startY - centerY + innerDepthPx- landingDoorHeightPx- doorGapPx) / SCALE_FACTOR -(verticalOffset*SCALE_FACTOR/SCALE_FACTOR)).toFixed(0)} `,
  0,
  0
);
context.restore();





            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -leftDistancePx -leftWallThicknessPx -50*SCALE_FACTOR, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + rightDistancePx + rightWallThicknessPx +50*SCALE_FACTOR , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - railwallDistancePx - rearWallThicknessPx -50*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+50*SCALE_FACTOR); // Extend to the bottom edge
context.stroke();
// Set line style for the center axis




// Reset the dash style
context.setLineDash([]);
            break;
            case 'left & right':
              cabinX = startX + railwallDistancePx;  // 90 mm from left wall
              cabinWidthPx = innerWidthPx - railwallDistancePx -railwallDistancePx;
              cabinY = startY + rearDistancePx;  // 300 mm from rear wall where rails are
              cabinDepthPx = innerDepthPx -rearDistancePx - frontDistancePx;
              centerX = cabinX + cabinWidthPx / 2;
            centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2-verticalOffset*SCALE_FACTOR/2;

            // Horizontal Dimension Line for Cabin Width
const cabinWidthLineY3 = cabinY  - rearDistancePx- rearWallThicknessPx- 100 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY3); // Start at left edge of the cabin
context.lineTo(cabinX - cabinWallThicknessPx+ cabinWidthPx, cabinWidthLineY3); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY3 - arrowSize / 2);
context.lineTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY3 + arrowSize / 2);
context.lineTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY3);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY3 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY3 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, cabinWidthLineY3);
context.closePath();
context.fill();

// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWallThicknessPx, cabinWidthLineY3);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx - cabinWallThicknessPx, cabinWidthLineY3);
context.stroke();

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY3 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX3 = cabinX  + cabinWidthPx+ railwallDistancePx +rightWallThicknessPx+ 100* SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(cabinDepthLineX3, cabinY+ cabinWallThicknessPx); // Start at top edge of the cabin
context.lineTo(cabinDepthLineX3, cabinY + cabinDepthPx - cabinWallThicknessPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(cabinDepthLineX3 - arrowSize / 2, cabinY + arrowSize + cabinWallThicknessPx);
context.lineTo(cabinDepthLineX3 + arrowSize / 2, cabinY + arrowSize+ cabinWallThicknessPx);
context.lineTo(cabinDepthLineX3, cabinY+ cabinWallThicknessPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(cabinDepthLineX3 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX3 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize- cabinWallThicknessPx);
context.lineTo(cabinDepthLineX3, cabinY + cabinDepthPx - cabinWallThicknessPx);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY+cabinWallThicknessPx );
context.lineTo(cabinDepthLineX3 , cabinY+cabinWallThicknessPx);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx - cabinWallThicknessPx);
context.lineTo(cabinDepthLineX3  , cabinY+cabinDepthPx- cabinWallThicknessPx);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX3 +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY3 = cabinY  - rearDistancePx- rearWallThicknessPx- 225 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX, PlatformLineY3); // Start at left edge of the cabin
context.lineTo(cabinX + cabinWidthPx, PlatformLineY3); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize, PlatformLineY3 - arrowSize / 2);
context.lineTo(cabinX + arrowSize, PlatformLineY3 + arrowSize / 2);
context.lineTo(cabinX, PlatformLineY3);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY3 - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize, PlatformLineY3 + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx, PlatformLineY3);
context.closePath();
context.fill();

// Use a thinner line for the perpendicular extension lines
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(cabinX , PlatformLineY3);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX + cabinWidthPx , cabinY + cabinWallThicknessPx);
context.lineTo(cabinX + cabinWidthPx , PlatformLineY3);
context.stroke();
// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY3 -40*SCALE_FACTOR);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX3 = cabinX  + cabinWidthPx+ railwallDistancePx+ rightWallThicknessPx +225* SCALE_FACTOR;// To the right of the cabin
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX3, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX3, cabinY + cabinDepthPx + carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(PlatformLineX3 - arrowSize / 2, cabinY + arrowSize );
context.lineTo(PlatformLineX3 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(PlatformLineX3, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(PlatformLineX3 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx - arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX3 + arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx - arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX3, cabinY + cabinDepthPx+ carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY );
context.lineTo(PlatformLineX3 , cabinY);
context.stroke();

// Right perpendicular line
context.beginPath();
context.moveTo(cabinX , cabinY +cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(PlatformLineX3  , cabinY+cabinDepthPx +carDoorjambPx +landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX3 +40*SCALE_FACTOR, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR+ carDoorjambPx/SCALE_FACTOR+ carDoorHeightPx/ SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX2 = cabinX  + cabinWidthPx+ railwallDistancePx+ rightWallThicknessPx +225* SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(rearDistanceLineX2, startY); // Start from top of the cabin
context.lineTo(rearDistanceLineX2,  startY +rearDistancePx); // End at bottom of the cabin
context.stroke();

// Rear Distance Arrows
// Top arrow
context.beginPath();
context.moveTo(rearDistanceLineX2 - arrowSize / 2, startY+ arrowSize);
context.lineTo(rearDistanceLineX2 + arrowSize / 2, startY + arrowSize);
context.lineTo(rearDistanceLineX2, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(rearDistanceLineX2 - arrowSize / 2, startY + rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX2 + arrowSize / 2, startY +rearDistancePx- arrowSize);
context.lineTo(rearDistanceLineX2, startY+ rearDistancePx);
context.closePath();
context.fill();

// Rear Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearDistanceLineX2+40*SCALE_FACTOR, startY+rearDistancePx/2); // Adjust label position
context.rotate(Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance




// Left Wall Thickness
const railwallDistanceLineY1= startY - rearWallThicknessPx   - 100 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX, railwallDistanceLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, railwallDistanceLineY1 - perpendicularSize/2);
context.lineTo(cabinX, railwallDistanceLineY1 + perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1 - perpendicularSize/2);
context.lineTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1 + perpendicularSize/2);
context.stroke();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  railwallDistanceLineY1 -40*SCALE_FACTOR
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY3 = startY   - rearWallThicknessPx   - 100 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY3); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY3 -perpendicularSize/2);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY3 +perpendicularSize/2);
context.stroke();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3 - perpendicularSize/2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3 + perpendicularSize/2);
context.stroke();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY3 -40*SCALE_FACTOR
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX3 = startX+ innerWidthPx+ rightWallThicknessPx + 100 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX3, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX3, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX3 - perpendicularSize/2, cabinY );
context.lineTo(topWallThicknessLineX3 + perpendicularSize/2, cabinY );
context.stroke();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX3 - perpendicularSize/2, cabinY + cabinWallThicknessPx );
context.lineTo(topWallThicknessLineX3 +perpendicularSize/2, cabinY + cabinWallThicknessPx);
context.stroke();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX3 +40*SCALE_FACTOR, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY6 = cabinY - rearDistancePx- rearWallThicknessPx - 350 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX, centerAxisLineY6); // Start at the left edge
context.lineTo(centerX, centerAxisLineY6); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX + arrowSize, centerAxisLineY6 - arrowSize / 2);
context.lineTo(startX + arrowSize, centerAxisLineY6 + arrowSize / 2);
context.lineTo(startX, centerAxisLineY6);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY6 - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY6 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY6);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((centerX - startX) / SCALE_FACTOR).toFixed(0)} `,
  (startX + centerX) / 2,
  centerAxisLineY6 - 10
);
context.restore();
// Horizontal Center Axis Dimension Line


const carDepthLineX12 = cabinX + cabinWidthPx +railwallDistancePx+ rightWallThicknessPx+ 100* SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX12, cabinY- cabinWallThicknessPx+ cabinDepthPx); // Start at top edge of the cabin
context.lineTo(carDepthLineX12, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX12 - arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+ arrowSize);
context.lineTo(carDepthLineX12 + arrowSize / 2, cabinY- cabinWallThicknessPx+ cabinDepthPx+arrowSize);
context.lineTo(carDepthLineX12, cabinY- cabinWallThicknessPx+ cabinDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX12 - arrowSize / 2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX12 + arrowSize / 2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx- arrowSize-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX12, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX12 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx -cabinWallThicknessPx+carDoorHeightPx/2-verticalOffset*SCALE_FACTOR)); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(   carDoorjamb*SCALE_FACTOR/SCALE_FACTOR + carDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();


const carDepthLineX13 = cabinX + cabinWidthPx + railwallDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX13, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx-verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX13, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX13 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX13 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX13 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX13 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);

context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX13 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX13 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( carDoorjambPx +carDoorHeightPx- doorGapPx)-verticalOffset*SCALE_FACTOR); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${(  doorGapPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX14 = cabinX + cabinWidthPx + railwallDistancePx+ rightWallThicknessPx+ 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX14, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR ); // Start at top edge of the cabin
context.lineTo(carDepthLineX14, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx + landingDoorHeightPx-verticalOffset*SCALE_FACTOR); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX14 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX14 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx+ doorGapPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX14 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX14 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);

context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+landingDoorHeightPx-verticalOffset*SCALE_FACTOR );
context.lineTo(carDepthLineX14 , cabinY+cabinDepthPx+carDoorjambPx+carDoorHeightPx+doorGapPx+ landingDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX14 +40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx+ + doorGapPx)+ landingDoorHeightPx/2 -verticalOffset*SCALE_FACTOR)); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

const carDepthLineX15 = cabinX  - railwallDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(carDepthLineX15, cabinY+ cabinDepthPx + carDoorjambPx + carDoorHeightPx  -verticalOffset*SCALE_FACTOR); // Start at top edge of the cabin
context.lineTo(carDepthLineX15, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx + doorGapPx + landingDoorHeightPx); // End at bottom edge of the cabin
context.stroke();

// Arrows for cabin depth
// Top arrow
context.beginPath();
context.moveTo(carDepthLineX15 - perpendicularSize / 2, cabinY+ cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(carDepthLineX15 + perpendicularSize / 2, cabinY+ cabinDepthPx+ carDoorjambPx+carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();



// Bottom arrow
context.beginPath();
context.moveTo(carDepthLineX15 - perpendicularSize/2, cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx);
context.lineTo(carDepthLineX15 + perpendicularSize/2,cabinY + cabinDepthPx+ carDoorjambPx + carDoorHeightPx+ doorGapPx+ landingDoorHeightPx);

context.stroke();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(carDepthLineX15 -40*SCALE_FACTOR, cabinY + cabinDepthPx +( (carDoorjambPx +carDoorHeightPx+cabinWallThicknessPx*2 + doorGapPx)/2+ landingDoorHeightPx)); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`  ${( landingDoorHeightPx/ SCALE_FACTOR+ doorGapPx/SCALE_FACTOR +verticalOffset*SCALE_FACTOR /SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


const centerAxisLineY7 = cabinY  - rearDistancePx- rearWallThicknessPx - 350 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY7); // Start at the left edge
context.lineTo(centerX, centerAxisLineY7); // End at the center
context.stroke();
// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx - arrowSize, centerAxisLineY7 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx - arrowSize, centerAxisLineY7 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY7);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX + arrowSize, centerAxisLineY7- arrowSize / 2);
context.lineTo(centerX + arrowSize, centerAxisLineY7 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY7);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(centerX,startY);
context.lineTo(centerX, centerAxisLineY7);
context.stroke();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY7 -40*SCALE_FACTOR
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX6 = cabinX- railwallDistancePx- leftWallThicknessPx  - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX6, startY); // Start at the top edge
context.lineTo(centerAxisLineX6, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX6 - arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX6 + arrowSize / 2, startY + arrowSize);
context.lineTo(centerAxisLineX6, startY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX6 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX6 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX6, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY);
context.lineTo(centerAxisLineX6, startY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,startY+innerDepthPx);
context.lineTo(centerAxisLineX6, startY+innerDepthPx);
context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;
// Left perpendicular line
context.beginPath();
context.moveTo(cabinX ,  centerY );
context.lineTo(centerAxisLineX6 , centerY);
context.stroke();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX6 -40*SCALE_FACTOR, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX7= cabinX- railwallDistancePx- leftWallThicknessPx  - 350 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX7, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX7, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX7 - arrowSize / 2, startY - arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX7 + arrowSize / 2, startY - arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX7, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX7 - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX7 + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX7, centerY);
context.closePath();
context.fill();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX7 -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
const centerAxisLineX4EE= cabinX- railwallDistancePx - leftWallThicknessPx  - 225 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX4EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerAxisLineX4EE, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX4EE - arrowSize / 2, startY - arrowSize + innerDepthPx - landingDoorHeightPx- doorGapPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX4EE + arrowSize / 2, startY - arrowSize+ innerDepthPx - landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX4EE, startY+ innerDepthPx- landingDoorHeightPx- doorGapPx -verticalOffset*SCALE_FACTOR);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX4EE - arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX4EE + arrowSize / 2, centerY + arrowSize);
context.lineTo(centerAxisLineX4EE, centerY);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(cabinX,cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.lineTo(centerAxisLineX4EE, cabinY+cabinDepthPx+carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR);
context.stroke();


// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX4EE -40*SCALE_FACTOR, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` EE ${((   startY  + innerDepthPx -centerY -verticalOffset*SCALE_FACTOR-landingDoorHeightPx-doorGapPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();

            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -railwallDistancePx -leftWallThicknessPx-50*SCALE_FACTOR, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + railwallDistancePx + rightWallThicknessPx+50*SCALE_FACTOR , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx-50*SCALE_FACTOR); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+50*SCALE_FACTOR); // Extend to the bottom edge
context.stroke();

context.setLineDash([]);
              break;

        default:
            return;  // Exit if no wall is selected
    }

    const innerWidthWithoutWallsPx = cabinWidthPx - 2 * cabinWallThicknessPx;
    const innerDepthWithoutWallsPx = cabinDepthPx - 2 * cabinWallThicknessPx;

    // Draw inner walls with 30 mm thickness
    context.strokeStyle = 'black';
    context.strokeRect(
        cabinX + cabinWallThicknessPx,
        cabinY + cabinWallThicknessPx,
        innerWidthWithoutWallsPx,
        innerDepthWithoutWallsPx
    );
    // Calculate the top of the car door, where the outer walls should stop
    const carDoorTopY = cabinY + cabinDepthPx + carDoorjambPx - verticalOffset * SCALE_FACTOR ;

    // Draw the outer left and right walls, connecting to the top of the car door
    context.strokeStyle = 'black';

    // Left outer wall, extending to the top of the car door
    context.beginPath();
    context.moveTo(cabinX, cabinY);
    context.lineTo(cabinX, carDoorTopY);
    context.stroke();

    // Right outer wall, extending to the top of the car door
    context.beginPath();
    context.moveTo(cabinX + cabinWidthPx, cabinY);
    context.lineTo(cabinX + cabinWidthPx, carDoorTopY);
    context.stroke();

    // Rear outer wall
    context.beginPath();
    context.moveTo(cabinX, cabinY);
    context.lineTo(cabinX + cabinWidthPx, cabinY);
    context.stroke();
    // Rear outer wall
    context.beginPath();
    context.moveTo(cabinX, cabinY + cabinDepthPx + carDoorjambPx - verticalOffset* SCALE_FACTOR);
    context.lineTo(cabinX + cabinWidthPx, cabinY + cabinDepthPx + carDoorjambPx - verticalOffset * SCALE_FACTOR );
    context.stroke();
    

    // Cabin Door dimensions based on main Door dimensions
    const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
    const DoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;

    // Position the cabin Door centered on the cabin's front wall with offset
    const DoorX = cabinX + (cabinWidthPx - DoorWidthPx) / 2 - wallOpeningOffset * SCALE_FACTOR;
    const DoorY = cabinY + cabinDepthPx - DoorHeightPx - verticalOffset *SCALE_FACTOR;


// Adjust the entrance ends dynamically
const leftEntranceEndX = DoorX  ; // Align with the left edge of the door
const rightEntranceEndX = DoorX + DoorWidthPx ; // Align with the right edge of the door

// Draw left side of the cabin entrance
context.beginPath();
context.moveTo(cabinX, cabinY);
context.lineTo(leftEntranceEndX, cabinY ); // Draw to the left edge of the door
context.stroke();

// Draw right side of the cabin entrance
context.beginPath();
context.moveTo(rightEntranceEndX, cabinY); // Start from the right edge of the door
context.lineTo(cabinX + cabinWidthPx, cabinY);
context.stroke();

context.lineWidth = 2;
    context.strokeStyle = 'black';

// Left entrance end vertical line
context.beginPath();
context.moveTo(leftEntranceEndX, carDoorTopY);
context.lineTo(leftEntranceEndX , carDoorTopY -carDoorjambPx  - cabinWallThicknessPx+ verticalOffset*SCALE_FACTOR); // Adjust to desired height
context.stroke();

// Right entrance end vertical line
context.beginPath();
context.moveTo(rightEntranceEndX, carDoorTopY);
context.lineTo(rightEntranceEndX, carDoorTopY - carDoorjambPx - cabinWallThicknessPx+verticalOffset*SCALE_FACTOR ); // Adjust to desired height
context.stroke();



// Set line style for the center axis
context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line



// Reset the dash style
context.setLineDash([]);
const drawDoorWidthDimension = (context, startX, startY, DoorWidthPx) => {
  // Define the y-coordinate for the dimension line
   startY=225;
   const fontSize = 72* SCALE_FACTOR;
   const arrowSize = 32*SCALE_FACTOR; // Size for the perpendicular lines
  const dimensionY =cabinY +cabinDepthPx+ frontDistancePx+frontWallThicknessPx+150*SCALE_FACTOR

  // Draw the main dimension line
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(startX, dimensionY);
  context.lineTo(startX + DoorWidthPx, dimensionY);
  context.stroke();

  // Add arrows for dimension line
  context.beginPath();
  // Left arrow
  context.moveTo(startX+ arrowSize, dimensionY - arrowSize / 2);
  context.lineTo(startX  , dimensionY);
  context.lineTo(startX+ arrowSize, dimensionY + arrowSize / 2);
  context.closePath();
  context.fillStyle = "black";
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(startX- arrowSize + DoorWidthPx, dimensionY - arrowSize / 2);
  context.lineTo(startX + DoorWidthPx , dimensionY);
  context.lineTo(startX -arrowSize+ DoorWidthPx, dimensionY + arrowSize / 2);
  context.closePath();
  context.fill();
  

  // Add label for DoorWidthPx
  context.font = `${fontSize}px Arial`;
  context.fillStyle = "black";
  context.fillText(
    `DW ${(DoorWidthPx / SCALE_FACTOR).toFixed(0)} `, // Convert back to millimeters for the label
    startX + DoorWidthPx / 2 -fontSize ,
    dimensionY - 40*SCALE_FACTOR
  );
};

// Call the function
drawDoorWidthDimension(context, DoorX, DoorY, DoorWidthPx);



const drawDimensionLinesWithLabels = (context, cabinX, cabinWidthPx, leftEntranceEndX, rightEntranceEndX, carDoorTopY, SCALE_FACTOR) => {
  context.strokeStyle = 'black'; // Dimension line color
  context.lineWidth = 1;

  const arrowSize = 18 *SCALE_FACTOR;
  const fontSize = 72*SCALE_FACTOR;

  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'black'; // Label color

  // Left dimension line
  const leftDimLineY = carDoorTopY- carDoorjambPx-cabinWallThicknessPx -50*SCALE_FACTOR; // Slightly above the cabin wall
  context.beginPath();
  context.moveTo(cabinX+ cabinWallThicknessPx, leftDimLineY); // From the left cabin wall
  context.lineTo(leftEntranceEndX, leftDimLineY); // To leftEntranceEndX
  context.stroke();

  // Add arrows for left dimension line
  context.beginPath();
  context.moveTo(cabinX+ cabinWallThicknessPx, leftDimLineY);
  context.lineTo(cabinX+cabinWallThicknessPx + arrowSize, leftDimLineY - arrowSize);
  context.lineTo(cabinX+cabinWallThicknessPx + arrowSize, leftDimLineY + arrowSize);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(leftEntranceEndX, leftDimLineY);
  context.lineTo(leftEntranceEndX - arrowSize, leftDimLineY - arrowSize);
  context.lineTo(leftEntranceEndX - arrowSize, leftDimLineY + arrowSize);
  context.closePath();
  context.fill();

  // Add label for left dimension
  const leftDistance = ((leftEntranceEndX - (cabinX+cabinWallThicknessPx)) / SCALE_FACTOR).toFixed(0); // Convert back to mm
  const leftLabelX = (cabinX+cabinWallThicknessPx + leftEntranceEndX) / 2; // Midpoint
  context.fillText(`${leftDistance} `, leftLabelX , leftDimLineY - 40*SCALE_FACTOR);

  // Right dimension line
  const rightDimLineY = carDoorTopY - carDoorjambPx-cabinWallThicknessPx -50*SCALE_FACTOR; // Slightly above the cabin wall
  context.beginPath();
  context.moveTo(cabinX + cabinWidthPx -cabinWallThicknessPx, rightDimLineY); // From the right cabin wall
  context.lineTo(rightEntranceEndX, rightDimLineY); // To rightEntranceEndX
  context.stroke();

  // Add arrows for right dimension line
  context.beginPath();
  context.moveTo(rightEntranceEndX, rightDimLineY);
  context.lineTo(rightEntranceEndX + arrowSize, rightDimLineY - arrowSize);
  context.lineTo(rightEntranceEndX + arrowSize, rightDimLineY + arrowSize);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(cabinX + cabinWidthPx-cabinWallThicknessPx, rightDimLineY);
  context.lineTo(cabinX + cabinWidthPx-cabinWallThicknessPx - arrowSize, rightDimLineY - arrowSize);
  context.lineTo(cabinX + cabinWidthPx-cabinWallThicknessPx - arrowSize, rightDimLineY + arrowSize);
  context.closePath();
  context.fill();

  // Add label for right dimension
  const rightDistance = (( (cabinX + cabinWidthPx-cabinWallThicknessPx)- rightEntranceEndX) / SCALE_FACTOR).toFixed(0); // Convert back to mm
  const rightLabelX = ((cabinX + cabinWidthPx-cabinWallThicknessPx) + rightEntranceEndX) / 2; // Midpoint
  context.fillText(`${rightDistance} `, rightLabelX , rightDimLineY - 40 *SCALE_FACTOR);
};

// Use in your draw function
drawDimensionLinesWithLabels(
  context, 
  cabinX, 
  cabinWidthPx, 
  leftEntranceEndX, 
  rightEntranceEndX, 
  carDoorTopY, 
  SCALE_FACTOR
);





// Clear the door area for both inner and outer walls on the cabin's front wall



// Clear the door area for both inner and outer walls on the cabin's front wall

// Draw dimension lines for the cabin inner wall dimensions

// Clear the line between entrance ends
context.clearRect(
  leftEntranceEndX,
  cabinY  + cabinDepthPx - cabinWallThicknessPx - 1,
  rightEntranceEndX - leftEntranceEndX,
  2
);
// Draw dimension lines between left inner wall and left wall opening line
const leftInnerWallX = startX; // X position of the left inner wall
const leftOpeningX =  leftEntranceEndX - frameWidthPx; // X position of the left wall opening line
const leftDimensionY = startY+ innerDepthPx+frontWallThicknessPx + 150 *SCALE_FACTOR; // Position above the walls for the dimension line

context.strokeStyle = 'black';
context.lineWidth = 1;

// Draw dimension line
context.beginPath();
context.moveTo(leftInnerWallX, leftDimensionY);
context.lineTo(leftOpeningX, leftDimensionY);
context.stroke();


// Left arrow
context.moveTo(leftInnerWallX, leftDimensionY);
context.lineTo(leftInnerWallX + arrowSize, leftDimensionY - arrowSize/2);
context.lineTo(leftInnerWallX + arrowSize, leftDimensionY + arrowSize/2);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(leftOpeningX, leftDimensionY);
context.lineTo(leftOpeningX - arrowSize, leftDimensionY - arrowSize/2);
context.lineTo(leftOpeningX - arrowSize, leftDimensionY + arrowSize/2);
context.closePath();
context.fill();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX,startY);
context.lineTo(startX, leftDimensionY);
context.stroke();

// Draw text label
 
context.fillStyle = 'black';
context.fillText(
  `${(Math.abs(leftOpeningX - leftInnerWallX) / SCALE_FACTOR).toFixed(0)} `,
  (leftInnerWallX + leftOpeningX) / 2 ,
  leftDimensionY - 40*SCALE_FACTOR
);

// Draw dimension lines between right inner wall and right wall opening line
const rightInnerWallX = startX + innerWidthPx ; // X position of the right inner wall
const rightOpeningX =  rightEntranceEndX + frameWidthPx; // X position of the right wall opening line
const rightDimensionY = startY +innerDepthPx + frontWallThicknessPx+ 150*SCALE_FACTOR; // Position above the walls for the dimension line

context.beginPath();
context.moveTo(rightInnerWallX, rightDimensionY);
context.lineTo(rightOpeningX, rightDimensionY);
context.stroke();

// Draw arrows
context.beginPath();
// Left arrow
context.moveTo(rightInnerWallX, rightDimensionY);
context.lineTo(rightInnerWallX - arrowSize, rightDimensionY - arrowSize/2);
context.lineTo(rightInnerWallX - arrowSize, rightDimensionY + arrowSize/2);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(rightOpeningX, rightDimensionY);
context.lineTo(rightOpeningX + arrowSize, rightDimensionY - arrowSize/2);
context.lineTo(rightOpeningX + arrowSize, rightDimensionY + arrowSize/2);
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo( rightInnerWallX,startY);
context.lineTo( rightInnerWallX, rightDimensionY);
context.stroke();



// Draw text label
context.fillText(
  `${(Math.abs(rightOpeningX - rightInnerWallX) / SCALE_FACTOR).toFixed(0)} ` ,
  (rightInnerWallX + rightOpeningX) / 2 ,
  rightDimensionY - 40*SCALE_FACTOR
);
const dimensionLineY = startY +innerDepthPx - carDoorHeightPx-doorGapPx-landingDoorHeightPx-carDoorjambPx-cabinWallThicknessPx-50*SCALE_FACTOR-verticalOffset*SCALE_FACTOR;
 

    // Draw dimension line for wall opening offset
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(centerX, dimensionLineY);
    context.lineTo(centerX - wallOpeningOffset*SCALE_FACTOR, dimensionLineY);
    context.stroke();

    // Draw arrows
    context.beginPath();
    context.moveTo(centerX - wallOpeningOffset*SCALE_FACTOR + arrowSize/2, dimensionLineY - arrowSize / 2);
    context.lineTo(centerX - wallOpeningOffset*SCALE_FACTOR + arrowSize/2, dimensionLineY + arrowSize / 2);
    context.lineTo(centerX- wallOpeningOffset*SCALE_FACTOR, dimensionLineY);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(centerX - arrowSize/2, dimensionLineY - arrowSize / 2);
    context.lineTo(centerX - arrowSize/2, dimensionLineY + arrowSize / 2);
    context.lineTo(centerX, dimensionLineY);
    context.closePath();
    context.fill();

    // Label for wall opening offset
    context.font = `${labelFontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(` ${wallOpeningOffset} `, centerX-wallOpeningOffset*SCALE_FACTOR/2 , dimensionLineY - 40 * SCALE_FACTOR);
 


};



const drawTShapeWithFrame = (context, startX, startY, innerWidthPx, innerDepthPx ) => {
 
  const { width, height, widthThickness, heightThickness } = tShapeSettings;

  // Convert to pixels
  const tShapeWidthPx = width * SCALE_FACTOR;
  const tShapeHeightPx = height * SCALE_FACTOR;
  const tShapeWidthThicknessPx = widthThickness * SCALE_FACTOR;
  const tShapeHeightThicknessPx = heightThickness * SCALE_FACTOR;
  const offsetXPx = tShapeSettings.offsetX * SCALE_FACTOR;
  const leftOffsetXPx = tShapeSettings.leftOffsetX * SCALE_FACTOR;
  const rightOffsetXPx = tShapeSettings.rightOffsetX * SCALE_FACTOR;
  const verticalOffsetYPx = verticalOffsetY * SCALE_FACTOR;
  const horizontalOffsetXPx = horizontalOffsetX * SCALE_FACTOR;

  const offsetYPx = tShapeSettings.offsetY * SCALE_FACTOR;
  const railDistancePx = tShapeSettings.railDistance * SCALE_FACTOR + tShapeHeightPx*2;
  const bracketWidthPx = bracketsSettings.width * SCALE_FACTOR;
  const bracketHeightPx = bracketsSettings.height * SCALE_FACTOR;
   // Dynamic distances from shaft walls in pixels
   const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;
   const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
   const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
   const railwallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
   const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
   const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
   const doorGapPx = doorGap * SCALE_FACTOR;
   // Wall thickness and inner dimensions
   const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;
  
   const carDoorjambPx = (carDoorjamb * SCALE_FACTOR )- cabinWallThicknessPx + verticalOffset * SCALE_FACTOR ;
   const frontDistancePx = carDoorHeightPx + landingDoorHeightPx + doorGapPx + carDoorjambPx ;
   const rearWallThicknessPx = wallThickness.rear * SCALE_FACTOR;
 const leftWallThicknessPx = wallThickness.left * SCALE_FACTOR;
 const rightWallThicknessPx = wallThickness.right * SCALE_FACTOR;

 context.strokeStyle = 'black';
 context.lineWidth = 2;

  const drawSingleTShape = (tShapeX, tShapeY, isVertical = true, flip = false) => {
    if (isVertical) {
      // Adjust vertical and horizontal segments if flipped
      const verticalSegmentY = flip ? tShapeY - tShapeHeightPx : tShapeY;
      const horizontalSegmentY = flip
        ? verticalSegmentY
        : tShapeY + tShapeHeightPx - tShapeWidthThicknessPx;
  
      // Vertical segment
      context.strokeRect(
        tShapeX,
        verticalSegmentY,
        tShapeHeightThicknessPx,
        tShapeHeightPx
      );
  
      // Horizontal segment
      const horizontalX = tShapeX - (tShapeWidthPx - tShapeHeightThicknessPx) / 2;
      context.strokeRect(
        horizontalX,
        horizontalSegmentY,
        tShapeWidthPx,
        tShapeWidthThicknessPx
      );
    } else {
      // Horizontal orientation (for rear wall)
      const horizontalSegmentX = flip ? tShapeX - tShapeHeightPx : tShapeX;
      const verticalSegmentX = flip
        ? horizontalSegmentX + tShapeHeightPx - tShapeWidthThicknessPx
        : tShapeX;
  
      // Horizontal segment
      context.strokeRect(
        horizontalSegmentX,
        tShapeY,
        tShapeHeightPx,
        tShapeHeightThicknessPx
      );
  
      // Vertical segment
      const verticalY = tShapeY - (tShapeWidthPx - tShapeHeightThicknessPx) / 2;
      context.strokeRect(
        verticalSegmentX,
        verticalY,
        tShapeWidthThicknessPx,
        tShapeWidthPx
      );
    }
  };
  

  let cabinX, cabinY, cabinDepthPx, cabinWidthPx

  switch (tShapeSettings.selectedWall) {
    case 'left': {
      cabinX = startX + railwallDistancePx;
      cabinY = startY + rearDistancePx;
      cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
      cabinWidthPx = innerWidthPx - railwallDistancePx - rightDistancePx; // Add this
  
      const bracketX = startX;
      const centerY = cabinY + cabinDepthPx / 2 + carDoorjambPx/2 + carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;
      const bracketY1 = centerY - railDistancePx / 2 - bracketHeightPx  + verticalOffsetYPx;
      const bracketY2 = centerY + railDistancePx / 2 + offsetYPx+ verticalOffsetYPx;
  
      const railY1 = centerY - railDistancePx / 2 + offsetYPx;
      const railY2 = centerY + railDistancePx / 2 + offsetYPx;
      const railCenterX = cabinX + cabinWidthPx / 2;
  
      // Flip the first T-shape by 180°
      drawSingleTShape(
        bracketX + offsetXPx,
        bracketY1 + tShapeHeightPx + bracketHeightPx  ,
        true,
        true
      );
  
      // Second T-shape (not flipped)
      drawSingleTShape(bracketX + offsetXPx, bracketY2 - tShapeHeightPx);
  
      // Draw brackets on the left wall
      context.fillRect(bracketX, bracketY1, bracketWidthPx, bracketHeightPx);
      context.fillRect(bracketX, bracketY2, bracketWidthPx, bracketHeightPx);
  
      // Draw rail distance vertical dimension
      const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
         const arrowSize = 24*SCALE_FACTOR; // Size of the arrows
        const labelFontSize = 72*SCALE_FACTOR; // Font size for the label
  
        // Adjusted positions to include arrow size
        const adjustedRailY1 = railY1 + verticalOffsetYPx+ tShapeHeightPx ;
        const adjustedRailY2 = railY2 - tShapeHeightPx + verticalOffsetYPx ;
  
        // Draw the vertical dimension line
        context.strokeStyle = 'black'; // Color for the dimension line
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR, adjustedRailY1 +arrowSize ); // Start after the arrow
        context.lineTo(railCenterX- cabinWidthPx/2-railwallDistancePx-leftWallThicknessPx -100*SCALE_FACTOR, adjustedRailY2- arrowSize); // End before the arrow
        context.stroke();
        context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,adjustedRailY1);
context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR, adjustedRailY1);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,adjustedRailY2);
context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR, adjustedRailY2);
context.stroke();

  
       
          // Draw the top arrow
    context.beginPath();
    context.moveTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR - arrowSize, adjustedRailY1+ arrowSize); // Left wing
    context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR + arrowSize, adjustedRailY1+ arrowSize); // Right wing
    context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR, adjustedRailY1 ); // Tip
    context.closePath();
    context.fillStyle = 'black';
    context.fill();

    // Draw the bottom arrow
    context.beginPath();
    context.moveTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR  - arrowSize, adjustedRailY2- arrowSize); // Left wing
    context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR  + arrowSize, adjustedRailY2- arrowSize); // Right wing
    context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR , adjustedRailY2 ); // Tip
    context.closePath();
    context.fill();
    
  
      
      context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate( railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR -40*SCALE_FACTOR,  (railY1 + railY2) / 2 + verticalOffsetY*SCALE_FACTOR ); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  `DBG ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
      }

      
      // Draw dimension lines for T-shaped rail height
const tShapeTopY = railY1+ tShapeSettings.offsetY * SCALE_FACTOR + verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY = tShapeTopY + tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX = startX + tShapeSettings.offsetX * SCALE_FACTOR; // X position of the T-shape
const dimensionLineOffset =  leftWallThicknessPx +100*SCALE_FACTOR + offsetXPx; // Offset for dimension lines
const arrowSize = 24 *SCALE_FACTOR;
context.strokeStyle = 'black';
context.lineWidth = 1;
const tShapeTopY1 = railY2 + tShapeSettings.offsetY * SCALE_FACTOR+ verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY1 = tShapeTopY1 - tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX1 = startX + tShapeSettings.offsetX * SCALE_FACTOR; // X position of the T-shape
const labelFontSize = 72*SCALE_FACTOR;

// Draw vertical dimension line
context.beginPath();
context.moveTo(tShapeX - dimensionLineOffset, tShapeTopY); // Top of T-shape
context.lineTo(tShapeX - dimensionLineOffset, tShapeBottomY); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeTopY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeTopY);
// Perpendicular line at the bottom
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeBottomY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeBottomY);
context.stroke();
// Draw vertical dimension line

context.beginPath();
context.moveTo(tShapeX1 - dimensionLineOffset,tShapeBottomY1); // Top of T-shape
context.lineTo(tShapeX1 - dimensionLineOffset, tShapeTopY1); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeTopY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeTopY1);
// Perpendicular line at the bottom
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeBottomY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeBottomY1);
context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,tShapeTopY);
context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR, tShapeTopY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,tShapeTopY1);
context.lineTo(railCenterX -cabinWidthPx/2- railwallDistancePx-leftWallThicknessPx-100*SCALE_FACTOR,tShapeTopY1);
context.stroke();





// Add text label for height
const tShapeHeight = tShapeSettings.height; // Height in mm
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX - dimensionLineOffset - 40*SCALE_FACTOR,
(tShapeTopY + tShapeBottomY) / 2 -2.5); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX1 - dimensionLineOffset -40*SCALE_FACTOR,
(tShapeTopY1 + tShapeBottomY1) / 2 -2.5); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
// Dimension line from top of T-shaped rail to inner shaft top wall
const railTopY = railY1 + verticalOffsetYPx; // Top Y position of the T-shaped rail
const shaftTopY = startY; // Y position of the inner shaft's top wall
const dimensionLineX = startX - leftWallThicknessPx - 100 * SCALE_FACTOR; // X position for the dimension line

// Draw the first dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX, shaftTopY);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (inner shaft top wall)
context.moveTo(dimensionLineX, shaftTopY);
context.lineTo(dimensionLineX - arrowSize, shaftTopY + arrowSize);
context.lineTo(dimensionLineX + arrowSize, shaftTopY + arrowSize);
context.closePath();
context.fillStyle = 'black';
context.fill();

// Arrow at the bottom (rail top)
context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX - arrowSize, railTopY - arrowSize);
context.lineTo(dimensionLineX + arrowSize, railTopY - arrowSize);
context.closePath();
context.fill();

// Dimension line from the top of the second T-shaped rail to the shaft
const railTopY1 = railY2 + verticalOffsetYPx; // Top Y position of the second T-shaped rail
const shaftTopY1 = startY + innerDepthPx; // Y position of the inner shaft's bottom wall
const dimensionLineX1 = startX - leftWallThicknessPx - 100 * SCALE_FACTOR; // X position for the second dimension line

// Draw the second dimension line
context.beginPath();
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1, shaftTopY1);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (rail top)
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1 - arrowSize, railTopY1 + arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, railTopY1 + arrowSize);
context.closePath();
context.fill();

// Arrow at the bottom (shaft bottom wall)
context.beginPath();
context.moveTo(dimensionLineX1, shaftTopY1);
context.lineTo(dimensionLineX1 - arrowSize, shaftTopY1 - arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, shaftTopY1 - arrowSize);
context.closePath();
context.fill();


// Add vertical text labels for the heights
const drawVerticalHeightLabel = (context, startY, endY, dimensionLineX, scaleFactor) => {
  const distance = Math.abs(startY - endY) / scaleFactor; // Calculate distance in mm
  const midY = (startY + endY) / 2; // Vertical midpoint

  context.save(); // Save the context state
  context.translate(dimensionLineX-40 *SCALE_FACTOR , midY); // Move to the label position
  context.rotate(-Math.PI / 2); // Rotate text vertically
   
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.fillText(`${distance.toFixed(0)} `, 0, 0); // Draw text
  context.restore(); // Restore the original context
};

// Draw labels for the first and second dimensions
drawVerticalHeightLabel(context, shaftTopY, railTopY, dimensionLineX, SCALE_FACTOR);
drawVerticalHeightLabel(context, shaftTopY1, railTopY1, dimensionLineX1, SCALE_FACTOR);

  
      drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
      const dimensionOffsetX = startX-50 *SCALE_FACTOR;
  
     

    // Draw dimension line for wall opening offset
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(dimensionOffsetX , centerY);
    context.lineTo( dimensionOffsetX , centerY +verticalOffsetYPx);
    context.stroke();

    // Draw arrows
    context.beginPath();
    context.moveTo( dimensionOffsetX , centerY +verticalOffsetYPx );
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo( dimensionOffsetX, centerY);
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +arrowSize/2);
    context.closePath();
    context.fill();

    context.save(); // Save the context state
    context.translate(dimensionOffsetX-40 *SCALE_FACTOR , centerY+verticalOffsetYPx/2); // Move to the label position
    context.rotate(-Math.PI / 2); // Rotate text vertically
     
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(`${Math.round(verticalOffsetY)}`, 0, 0);
 // Draw text
    context.restore(); // Restore the original context
  
      
      break;
    }
  
  
  
    case 'right': {
      cabinX = startX + leftDistancePx;
      cabinY = startY + rearDistancePx;
      cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
      const bracketX = startX + innerWidthPx  - bracketWidthPx ;
      const centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2-verticalOffset*SCALE_FACTOR/2;
      const bracketY1 = centerY -railDistancePx/2-bracketHeightPx  + offsetYPx + verticalOffsetYPx;
      const bracketY2 = centerY+ railDistancePx/2 + offsetYPx+ verticalOffsetYPx ;
    
  
      // Flip the first T-shape by 180°
      drawSingleTShape(bracketX + bracketWidthPx + offsetXPx, bracketY1 + tShapeHeightPx  + bracketHeightPx  , true, true);
  
      // Second T-shape (not flipped)
      drawSingleTShape(bracketX + bracketWidthPx + offsetXPx, bracketY2 - tShapeHeightPx  );
     // Draw brackets on the right wall
     context.fillRect(bracketX, bracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(bracketX, bracketY2, bracketWidthPx, bracketHeightPx);

     const railY1 = centerY - railDistancePx / 2 + offsetYPx;
     const railY2 = centerY + railDistancePx / 2 + offsetYPx;
     const railCenterX = startX + innerWidthPx +rightWallThicknessPx+100*SCALE_FACTOR;
 
       const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
         const arrowSize = 24*SCALE_FACTOR; // Size of the arrows
         const labelFontSize = 72*SCALE_FACTOR; // Font size for the label
   
         // Adjusted positions to include arrow size
         const adjustedRailY1 = railY1  + tShapeHeightPx+verticalOffsetYPx;
         const adjustedRailY2 = railY2  - tShapeHeightPx+verticalOffsetYPx ;
   
         // Draw the vertical dimension line
         context.strokeStyle = 'black'; // Color for the dimension line
         context.lineWidth = 1;
         context.beginPath();
         context.moveTo(railCenterX, adjustedRailY1); // Start after the arrow
         context.lineTo(railCenterX, adjustedRailY2); // End before the arrow
         context.stroke();
   
         // Draw the top arrow
         context.beginPath();
         context.moveTo(railCenterX -arrowSize ,adjustedRailY1+ arrowSize); // Left wing
         context.lineTo(railCenterX + arrowSize , adjustedRailY1+ arrowSize); // Right wing
         context.lineTo(railCenterX, adjustedRailY1 ); // Tip
         context.closePath();
         context.fillStyle = 'black';
         context.fill();
   
         // Draw the bottom arrow
         context.beginPath();
         context.moveTo(railCenterX - arrowSize ,adjustedRailY2 - arrowSize); // Left wing
         context.lineTo(railCenterX + arrowSize , adjustedRailY2- arrowSize); // Right wing
         context.lineTo(railCenterX, adjustedRailY2  ); // Tip
         context.closePath();
         context.fill();

         
         context.strokeStyle = 'grey'; // Dimension line color
         context.lineWidth = 0.5;
         
         // Left perpendicular line
         context.beginPath();
         context.moveTo(startX+innerWidthPx+offsetXPx,adjustedRailY1);
         context.lineTo(railCenterX , adjustedRailY1);
         context.stroke();
         // Left perpendicular line
         context.beginPath();
         context.moveTo(startX+innerWidthPx+offsetXPx,adjustedRailY2);
         context.lineTo(railCenterX , adjustedRailY2);
         context.stroke();
         
   
         context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate( railCenterX + 40*SCALE_FACTOR,  (railY1 + railY2) / 2 +verticalOffsetYPx); // Position next to dimension line
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  `DBG ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
      }

      
      // Draw dimension lines for T-shaped rail height
const tShapeTopY = railY1 + tShapeSettings.offsetY * SCALE_FACTOR + verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY = tShapeTopY + tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX = startX+ innerWidthPx + rightWallThicknessPx+100*SCALE_FACTOR+ tShapeSettings.offsetX*SCALE_FACTOR ; // X position of the T-shape
const dimensionLineOffset =  offsetXPx; // Offset for dimension lines
const arrowSize = 24 *SCALE_FACTOR;
context.strokeStyle = 'black';
context.lineWidth = 1;
const labelFontSize=72*SCALE_FACTOR;
const tShapeTopY1 = railY2 + tShapeSettings.offsetY * SCALE_FACTOR+ verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY1 = tShapeTopY1 - tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX1 = startX + innerWidthPx + rightWallThicknessPx+ 100*SCALE_FACTOR+ tShapeSettings.offsetX * SCALE_FACTOR; // X position of the T-shape

// Draw vertical dimension line
context.beginPath();
context.moveTo(tShapeX - dimensionLineOffset, tShapeTopY); // Top of T-shape
context.lineTo(tShapeX - dimensionLineOffset, tShapeBottomY); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeTopY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeTopY);
// Perpendicular line at the bottom
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeBottomY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeBottomY);
context.stroke();
// Draw vertical dimension line

context.beginPath();
context.moveTo(tShapeX1 - dimensionLineOffset,tShapeBottomY1); // Top of T-shape
context.lineTo(tShapeX1 - dimensionLineOffset, tShapeTopY1); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeTopY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeTopY1);
// Perpendicular line at the bottom
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeBottomY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeBottomY1);
context.stroke();

context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx+offsetXPx,tShapeTopY);
context.lineTo(railCenterX , tShapeTopY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx+offsetXPx,tShapeTopY1);
context.lineTo(railCenterX,tShapeTopY1);
context.stroke();



// Add text label for height
const tShapeHeight = tShapeSettings.height; // Height in mm
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX - dimensionLineOffset +40*SCALE_FACTOR,
(tShapeTopY + tShapeBottomY) / 2); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX1 - dimensionLineOffset +40*SCALE_FACTOR,
(tShapeTopY1 + tShapeBottomY1) / 2 ); // Move to label position
context.rotate(Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
// Dimension line from top of T-shaped rail to inner shaft top wall
const railTopY = railY1 + verticalOffsetYPx; // Top Y position of the T-shaped rail
const shaftTopY = startY; // Y position of the inner shaft's top wall
const dimensionLineX = startX+ innerWidthPx + rightWallThicknessPx + 100 * SCALE_FACTOR; // X position for the dimension line

// Draw the first dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX, shaftTopY);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (inner shaft top wall)
context.moveTo(dimensionLineX, shaftTopY);
context.lineTo(dimensionLineX - arrowSize, shaftTopY + arrowSize);
context.lineTo(dimensionLineX + arrowSize, shaftTopY + arrowSize);
context.closePath();
context.fillStyle = 'black';
context.fill();

// Arrow at the bottom (rail top)
context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX - arrowSize, railTopY - arrowSize);
context.lineTo(dimensionLineX + arrowSize, railTopY - arrowSize);
context.closePath();
context.fill();

// Dimension line from the top of the second T-shaped rail to the shaft
const railTopY1 = railY2 + verticalOffsetYPx; // Top Y position of the second T-shaped rail
const shaftTopY1 = startY + innerDepthPx; // Y position of the inner shaft's bottom wall
const dimensionLineX1 = startX + innerWidthPx+ rightWallThicknessPx + 100 * SCALE_FACTOR; // X position for the second dimension line

// Draw the second dimension line
context.beginPath();
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1, shaftTopY1);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (rail top)
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1 - arrowSize, railTopY1 + arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, railTopY1 + arrowSize);
context.closePath();
context.fill();

// Arrow at the bottom (shaft bottom wall)
context.beginPath();
context.moveTo(dimensionLineX1, shaftTopY1);
context.lineTo(dimensionLineX1 - arrowSize, shaftTopY1 - arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, shaftTopY1 - arrowSize);
context.closePath();
context.fill();

// Add vertical text labels for the heights
const drawVerticalHeightLabel = (context, startY, endY, dimensionLineX, scaleFactor,) => {
  const distance = Math.abs(startY - endY) / scaleFactor; // Calculate distance in mm
  const midY = (startY + endY) / 2; // Vertical midpoint

  context.save(); // Save the context state
  context.translate(dimensionLineX + 20*SCALE_FACTOR, midY); // Move to the label position
  context.rotate(Math.PI / 2); // Rotate text vertically
   
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.fillText(`${distance.toFixed(0)} `, 0, 0); // Draw text
  context.restore(); // Restore the original context
};

// Draw labels for the first and second dimensions
drawVerticalHeightLabel(context, shaftTopY, railTopY, dimensionLineX, SCALE_FACTOR);
drawVerticalHeightLabel(context, shaftTopY1, railTopY1, dimensionLineX1, SCALE_FACTOR);

  
      drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
      const dimensionOffsetX = startX+innerWidthPx+50 *SCALE_FACTOR;
  
     

    // Draw dimension line for wall opening offset
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(dimensionOffsetX , centerY);
    context.lineTo( dimensionOffsetX , centerY +verticalOffsetYPx);
    context.stroke();

    // Draw arrows
    context.beginPath();
    context.moveTo( dimensionOffsetX , centerY +verticalOffsetYPx );
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo( dimensionOffsetX, centerY);
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +arrowSize/2);
    context.closePath();
    context.fill();

    context.save(); // Save the context state
    context.translate(dimensionOffsetX+40 *SCALE_FACTOR , centerY+verticalOffsetYPx/2); // Move to the label position
    context.rotate(Math.PI / 2); // Rotate text vertically
     
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(`${Math.round(verticalOffsetY)}`, 0, 0);
 // Draw text
    context.restore(); // Restore the original context
  
      
      
      break;
    }
  
    case 'left & right': {

      cabinX = startX + railwallDistancePx;
      cabinY = startY + rearDistancePx;
      cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
      cabinWidthPx = innerWidthPx - railwallDistancePx - railwallDistancePx;
      const centerY = cabinY + cabinDepthPx / 2  + carDoorjambPx/2 + carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;
  
      // Left wall
      const leftBracketX = startX;
      const leftBracketY1 = centerY - railDistancePx / 2 - bracketHeightPx+ offsetYPx +verticalOffsetYPx;
      const leftBracketY2 = centerY + railDistancePx / 2 + offsetYPx+ verticalOffsetYPx;
      drawSingleTShape(leftBracketX + leftOffsetXPx, leftBracketY1  + tShapeHeightPx + bracketHeightPx, true, true); // Flipped
      drawSingleTShape(leftBracketX + leftOffsetXPx, leftBracketY2 - tShapeHeightPx);
  
      // Right wall
      const rightBracketX = startX + innerWidthPx  - bracketWidthPx  ;
      const rightBracketY1 = centerY - railDistancePx / 2 -bracketHeightPx+ offsetYPx+ verticalOffsetYPx;
      const rightBracketY2 = centerY + railDistancePx / 2 + offsetYPx + verticalOffsetYPx;
      drawSingleTShape(rightBracketX +bracketWidthPx+ rightOffsetXPx, rightBracketY1 + tShapeHeightPx + bracketHeightPx, true, true); // Flipped
      drawSingleTShape(rightBracketX +bracketWidthPx+ rightOffsetXPx, rightBracketY2 - tShapeHeightPx  );
     // Left wall brackets
    
     context.fillRect(leftBracketX, leftBracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(leftBracketX, leftBracketY2, bracketWidthPx, bracketHeightPx);

     // Right wall brackets
    
     context.fillRect(rightBracketX, rightBracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(rightBracketX, rightBracketY2, bracketWidthPx, bracketHeightPx);
    
     const railY1 = centerY - railDistancePx / 2 + offsetYPx;
     const railY2 = centerY + railDistancePx / 2 + offsetYPx;
     const railCenterX = startX -leftWallThicknessPx-100*SCALE_FACTOR;
 
       const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
          const arrowSize = 32*SCALE_FACTOR; // Size of the arrows
         const labelFontSize = 72*SCALE_FACTOR; // Font size for the label
   
         // Adjusted positions to include arrow size
         const adjustedRailY1 = railY1  + tShapeHeightPx+verticalOffsetYPx ;
         const adjustedRailY2 = railY2  - tShapeHeightPx + verticalOffsetYPx;
   
         // Draw the vertical dimension line
         context.strokeStyle = 'black'; // Color for the dimension line
         context.lineWidth = 1;
         context.beginPath();
         context.moveTo(railCenterX, adjustedRailY1 ); // Start after the arrow
         context.lineTo(railCenterX, adjustedRailY2); // End before the arrow
         context.stroke();
   
         // Draw the top arrow
         context.beginPath();
         context.moveTo(railCenterX -arrowSize , adjustedRailY1 + arrowSize); // Left wing
         context.lineTo(railCenterX + arrowSize , adjustedRailY1+arrowSize); // Right wing
         context.lineTo(railCenterX, adjustedRailY1 ); // Tip
         context.closePath();
         context.fillStyle = 'black';
         context.fill();
   
         // Draw the bottom arrow
         context.beginPath();
         context.moveTo(railCenterX - arrowSize , adjustedRailY2 - arrowSize); // Left wing
         context.lineTo(railCenterX + arrowSize , adjustedRailY2- arrowSize); // Right wing
         context.lineTo(railCenterX, adjustedRailY2  ); // Tip
         context.closePath();
         context.fill();
         context.strokeStyle = 'grey'; // Dimension line color
         context.lineWidth = 0.5;
         
         // Left perpendicular line
         context.beginPath();
         context.moveTo(startX+offsetXPx,adjustedRailY1);
         context.lineTo(railCenterX , adjustedRailY1);
         context.stroke();
         // Left perpendicular line
         context.beginPath();
         context.moveTo(startX+offsetXPx,adjustedRailY2);
         context.lineTo(railCenterX , adjustedRailY2);
         context.stroke();
         
   
         context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate( railCenterX -40*SCALE_FACTOR,  (railY1 + railY2) / 2 ); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  `DBG ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
      }

       // Draw dimension lines for T-shaped rail height
const tShapeTopY = railY1 + tShapeSettings.offsetY * SCALE_FACTOR + verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY = tShapeTopY + tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX = startX-leftWallThicknessPx-100*SCALE_FACTOR+ tShapeSettings.offsetX * SCALE_FACTOR;
const dimensionLineOffset =  offsetXPx; // Offset for dimension lines
const arrowSize = 24 *SCALE_FACTOR;
context.strokeStyle = 'black';
context.lineWidth = 1;
const tShapeTopY1 = railY2 + tShapeSettings.offsetY * SCALE_FACTOR+ verticalOffsetYPx; // Top Y position of the T-shape
const tShapeBottomY1 = tShapeTopY1 - tShapeSettings.height * SCALE_FACTOR; // Bottom Y position of the T-shape
const tShapeX1 = startX -leftWallThicknessPx-100*SCALE_FACTOR+ tShapeSettings.offsetX * SCALE_FACTOR; // X position of the T-shape
const labelFontSize = 72*SCALE_FACTOR;

// Draw vertical dimension line
context.beginPath();
context.moveTo(tShapeX - dimensionLineOffset, tShapeTopY); // Top of T-shape
context.lineTo(tShapeX - dimensionLineOffset, tShapeBottomY); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeTopY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeTopY);
// Perpendicular line at the bottom
context.moveTo(tShapeX - dimensionLineOffset- arrowSize, tShapeBottomY);
context.lineTo(tShapeX- dimensionLineOffset + arrowSize, tShapeBottomY);
context.stroke();
// Draw vertical dimension line

context.beginPath();
context.moveTo(tShapeX1 - dimensionLineOffset,tShapeBottomY1); // Top of T-shape
context.lineTo(tShapeX1 - dimensionLineOffset, tShapeTopY1); // Bottom of T-shape
context.stroke();
// Draw perpendicular lines at the ends
context.beginPath();
// Perpendicular line at the top
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeTopY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeTopY1);
// Perpendicular line at the bottom
context.moveTo(tShapeX1 - dimensionLineOffset- arrowSize, tShapeBottomY1);
context.lineTo(tShapeX1- dimensionLineOffset + arrowSize, tShapeBottomY1);
context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,tShapeTopY);
context.lineTo(railCenterX , tShapeTopY);
context.stroke();
// Left perpendicular line
context.beginPath();
context.moveTo(startX+offsetXPx,tShapeTopY1);
context.lineTo(railCenterX ,tShapeTopY1);
context.stroke();




// Add text label for height
const tShapeHeight = tShapeSettings.height; // Height in mm
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX - dimensionLineOffset -40*SCALE_FACTOR,
(tShapeTopY + tShapeBottomY) / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(tShapeX1 - dimensionLineOffset -40*SCALE_FACTOR,
(tShapeTopY1 + tShapeBottomY1) / 2 ); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText( `${(tShapeHeight).toFixed(0)} `, 0, 0);
context.restore();
 
// Dimension line from top of T-shaped rail to inner shaft top wall
const railTopY = railY1 + verticalOffsetYPx; // Top Y position of the T-shaped rail
const shaftTopY = startY; // Y position of the inner shaft's top wall
const dimensionLineX = startX-leftWallThicknessPx-100*SCALE_FACTOR+ tShapeSettings.offsetX * SCALE_FACTOR; // X position for the dimension line

// Draw the first dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX, shaftTopY);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (inner shaft top wall)
context.moveTo(dimensionLineX, shaftTopY);
context.lineTo(dimensionLineX - arrowSize, shaftTopY + arrowSize);
context.lineTo(dimensionLineX + arrowSize, shaftTopY + arrowSize);
context.closePath();
context.fillStyle = 'black';
context.fill();

// Arrow at the bottom (rail top)
context.beginPath();
context.moveTo(dimensionLineX, railTopY);
context.lineTo(dimensionLineX - arrowSize, railTopY - arrowSize);
context.lineTo(dimensionLineX + arrowSize, railTopY - arrowSize);
context.closePath();
context.fill();

// Dimension line from the top of the second T-shaped rail to the shaft
const railTopY1 = railY2 + verticalOffsetYPx; // Top Y position of the second T-shaped rail
const shaftTopY1 = startY + innerDepthPx; // Y position of the inner shaft's bottom wall
const dimensionLineX1 = startX -leftWallThicknessPx-100*SCALE_FACTOR+ tShapeSettings.offsetX * SCALE_FACTOR; // X position for the second dimension line

// Draw the second dimension line
context.beginPath();
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1, shaftTopY1);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (rail top)
context.moveTo(dimensionLineX1, railTopY1);
context.lineTo(dimensionLineX1 - arrowSize, railTopY1 + arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, railTopY1 + arrowSize);
context.closePath();
context.fill();

// Arrow at the bottom (shaft bottom wall)
context.beginPath();
context.moveTo(dimensionLineX1, shaftTopY1);
context.lineTo(dimensionLineX1 - arrowSize, shaftTopY1 - arrowSize);
context.lineTo(dimensionLineX1 + arrowSize, shaftTopY1 - arrowSize);
context.closePath();
context.fill();

// Add vertical text labels for the heights
const drawVerticalHeightLabel = (context, startY, endY, dimensionLineX, scaleFactor) => {
  const distance = Math.abs(startY - endY) / scaleFactor; // Calculate distance in mm
  const midY = (startY + endY) / 2; // Vertical midpoint

  context.save(); // Save the context state
  context.translate(dimensionLineX +20*SCALE_FACTOR, midY); // Move to the label position
  context.rotate(-Math.PI / 2); // Rotate text vertically
   
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.fillText(`${distance.toFixed(0)} `, 0, -40*SCALE_FACTOR); // Draw text
  context.restore(); // Restore the original context
};

// Draw labels for the first and second dimensions
drawVerticalHeightLabel(context, shaftTopY, railTopY, dimensionLineX, SCALE_FACTOR);
drawVerticalHeightLabel(context, shaftTopY1, railTopY1, dimensionLineX1, SCALE_FACTOR);

  
      drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
      const dimensionOffsetX = startX-50 *SCALE_FACTOR;
     
  
     

    // Draw dimension line for wall opening offset
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(dimensionOffsetX , centerY);
    context.lineTo( dimensionOffsetX , centerY +verticalOffsetYPx);
    context.stroke();

    // Draw arrows
    context.beginPath();
    context.moveTo( dimensionOffsetX , centerY +verticalOffsetYPx );
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +verticalOffsetYPx - arrowSize/2);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo( dimensionOffsetX, centerY);
    context.lineTo(dimensionOffsetX - arrowSize / 2 , centerY +arrowSize/2);
    context.lineTo(dimensionOffsetX + arrowSize / 2 , centerY +arrowSize/2);
    context.closePath();
    context.fill();

    context.save(); // Save the context state
    context.translate(dimensionOffsetX-40 *SCALE_FACTOR , centerY+verticalOffsetYPx/2); // Move to the label position
    context.rotate(-Math.PI / 2); // Rotate text vertically
     
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(`${Math.round(verticalOffsetY)}`, 0, 0);
 // Draw text
    context.restore(); // Restore the original context
  
      
      


      
  
       break;
    }
  
    case 'rear': {
      cabinX = startX + leftDistancePx;
      cabinY = startY + railwallDistancePx;
      cabinWidthPx = innerWidthPx - leftDistancePx - rightDistancePx;
      const centerX = cabinX + cabinWidthPx / 2  ;
      const railX1 = centerX - railDistancePx / 2 + offsetXPx+ horizontalOffsetXPx;
      const railX2 = centerX + railDistancePx / 2 + offsetXPx + horizontalOffsetXPx;
      const centerY = cabinY + cabinWidthPx / 2; 
      const bracketY = startY   ;
      const railCenterY = centerY;

      
      const bracketX1 = centerX - railDistancePx / 2 -bracketHeightPx  + horizontalOffsetXPx;
      const bracketX2 = centerX + railDistancePx / 2   + horizontalOffsetXPx;
  
        // Draw the first T-shape without flipping (neutral orientation)
  drawSingleTShape(railX1   , bracketY + offsetYPx, false, false);

  // Draw the second T-shape without flipping (neutral orientation)
  drawSingleTShape(railX2 , bracketY+ offsetYPx, false, true);
  // Draw brackets on the rear wall
  context.fillRect(bracketX1, bracketY, bracketHeightPx, bracketWidthPx);
  context.fillRect(bracketX2, bracketY, bracketHeightPx, bracketWidthPx);

  const drawRailDistanceDimension = (context, railX1, railX2, railCenterY) => {
     const arrowSize = 32*SCALE_FACTOR; // Size of the arrows
    const labelFontSize = 72*SCALE_FACTOR; // Font size for the label

    // Calculate the adjusted rail positions to include arrows
    const adjustedRailX1 = railX1  + tShapeHeightPx  ;
    const adjustedRailX2 = railX2 -tShapeHeightPx ;
    const dimLineY = startY - rearWallThicknessPx-100*SCALE_FACTOR;
    // Draw the dimension line
    context.strokeStyle = 'black'; // Color for the dimension line
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(adjustedRailX1 , dimLineY); // Start after the arrow
    context.lineTo(adjustedRailX2, dimLineY); // End before the arrow
    context.stroke();

   // Draw the left arrow
   context.beginPath();
   context.moveTo(adjustedRailX1, dimLineY); // Arrow tip
   context.lineTo(adjustedRailX1 + arrowSize, dimLineY - arrowSize / 2); // Left wing
   context.lineTo(adjustedRailX1 + arrowSize, dimLineY + arrowSize / 2); // Right wing
   context.closePath();
   context.fill();

   // Draw the right arrow
   context.beginPath();
   context.moveTo(adjustedRailX2, dimLineY); // Arrow tip
   context.lineTo(adjustedRailX2 - arrowSize, dimLineY - arrowSize / 2); // Left wing
   context.lineTo(adjustedRailX2 - arrowSize, dimLineY + arrowSize / 2); // Right wing
   context.closePath();
   context.fill();
   context.strokeStyle = 'grey'; // Dimension line color
   context.lineWidth = 0.5;
   
   // Left perpendicular line
   context.beginPath();
   context.moveTo(adjustedRailX1,startY+offsetYPx);
   context.lineTo(adjustedRailX1 ,dimLineY);
   context.stroke();
   // Left perpendicular line
   context.beginPath();
   context.moveTo(adjustedRailX2,startY+offsetYPx);
   context.lineTo(adjustedRailX2, dimLineY);
   context.stroke();
   

    // Draw the label
    context.save();
    context.font = `${labelFontSize}px Arial`;
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
        `DBG ${((railX2 - railX1) / SCALE_FACTOR- tShapeHeightPx*2/SCALE_FACTOR).toFixed(0)} ` ,
        (railX1 + railX2) / 2 ,
        startY- rearWallThicknessPx-100*SCALE_FACTOR-40*SCALE_FACTOR// Position above the dimension line
    );
    context.restore();
};
// Horizontal Dimension for T-shaped Rail Height
const tRailHeightLineY = startY - rearWallThicknessPx - 100 * SCALE_FACTOR; // Above the rear wall
const railX1Adjusted = railX1 ; // Left rail start position
const railX2Adjusted = railX2; // Right rail start position
const perpendicularSize = 32 *SCALE_FACTOR;
 const arrowSize = 32*SCALE_FACTOR;

// Dimension line for the left T-shaped rail height
context.strokeStyle = 'black';;
context.lineWidth = 1;
context.beginPath();
context.moveTo(railX1Adjusted, tRailHeightLineY); // Start at the rail base
context.lineTo(railX1Adjusted + tShapeHeightPx, tRailHeightLineY); // End at the top of the T-shape
context.stroke();

// Arrows for the left rail
context.beginPath();
// Bottom arrow (rail base)
context.moveTo(railX1Adjusted, tRailHeightLineY - perpendicularSize / 2);
context.lineTo(railX1Adjusted, tRailHeightLineY + perpendicularSize / 2);
context.stroke();
// Top arrow (rail height)
context.moveTo(railX1Adjusted + tShapeHeightPx, tRailHeightLineY - perpendicularSize / 2);
context.lineTo(railX1Adjusted + tShapeHeightPx, tRailHeightLineY + perpendicularSize / 2);
context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(railX1Adjusted,startY+offsetYPx);
context.lineTo(railX1Adjusted ,tRailHeightLineY);
context.stroke();


// Label for the left T-shaped rail height
context.save();
context.textAlign = 'center';
context.fillText(
  `${tShapeSettings.height.toFixed(0)}`,
  railX1Adjusted + tShapeHeightPx / 2,
  tRailHeightLineY -20*SCALE_FACTOR
);
context.restore();

// Dimension line for the right T-shaped rail height
context.beginPath();
context.moveTo(railX2Adjusted, tRailHeightLineY); // Start at the rail base
context.lineTo(railX2Adjusted - tShapeHeightPx, tRailHeightLineY); // End at the top of the T-shape
context.stroke();

// Arrows for the right rail
context.beginPath();
// Bottom arrow (rail base)
context.moveTo(railX2Adjusted, tRailHeightLineY - perpendicularSize / 2);
context.lineTo(railX2Adjusted, tRailHeightLineY + perpendicularSize / 2);
context.stroke();
// Top arrow (rail height)
context.moveTo(railX2Adjusted - tShapeHeightPx, tRailHeightLineY - perpendicularSize / 2);
context.lineTo(railX2Adjusted - tShapeHeightPx, tRailHeightLineY + perpendicularSize / 2);
context.stroke();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(railX2Adjusted,startY+offsetYPx);
context.lineTo(railX2Adjusted ,tRailHeightLineY);
context.stroke();

// Label for the right T-shaped rail height
context.save();
context.textAlign = 'center';
context.fillText(
  `${tShapeSettings.height.toFixed(0)}`,
  railX2Adjusted - tShapeHeightPx / 2,
  tRailHeightLineY -20*SCALE_FACTOR
);
context.restore();

// Dimension line from top of T-shaped rail to inner shaft top wall
const railLeftX = railX1 ; // Top Y position of the T-shaped rail
const shaftLeftY = startX; // Y position of the inner shaft's top wall
const dimensionLineY = startY-rearWallThicknessPx-100*SCALE_FACTOR; // X position for the dimension line

// Draw the first dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(shaftLeftY,dimensionLineY );
context.lineTo( railLeftX ,dimensionLineY);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (inner shaft top wall)
context.moveTo(shaftLeftY + arrowSize ,dimensionLineY + arrowSize/2);
context.lineTo(shaftLeftY + arrowSize,dimensionLineY - arrowSize/2);
context.lineTo(shaftLeftY  ,dimensionLineY  );
context.closePath();
context.fillStyle = 'black';
context.fill();

// Arrow at the bottom (rail top)
context.beginPath();
context.moveTo(railLeftX - arrowSize ,dimensionLineY + arrowSize/2);
context.lineTo(railLeftX - arrowSize,dimensionLineY - arrowSize/2);
context.lineTo(railLeftX  ,dimensionLineY  );
context.closePath();
context.fill();

// Dimension line from the top of the second T-shaped rail to the shaft
// Dimension line from top of T-shaped rail to inner shaft top wall
const railLeftX1 = railX2 ; // Top Y position of the T-shaped rail
const shaftLeftY1 = startX + innerWidthPx; // Y position of the inner shaft's top wall
const dimensionLineY1 = startY-rearWallThicknessPx-100*SCALE_FACTOR ; // X position for the dimension line

// Draw the first dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;

context.beginPath();
context.moveTo(shaftLeftY1,dimensionLineY1 );
context.lineTo( railLeftX1 ,dimensionLineY1);
context.stroke();

// Draw arrowheads at both ends
context.beginPath();
// Arrow at the top (inner shaft top wall)
context.moveTo(shaftLeftY1 - arrowSize ,dimensionLineY1 + arrowSize/2);
context.lineTo(shaftLeftY1 - arrowSize,dimensionLineY1 - arrowSize/2);
context.lineTo(shaftLeftY1  ,dimensionLineY1  );
context.closePath();
context.fillStyle = 'black';
context.fill();

// Arrow at the bottom (rail top)
context.beginPath();
context.moveTo(railLeftX1 + arrowSize ,dimensionLineY1 + arrowSize/2);
context.lineTo(railLeftX1 + arrowSize,dimensionLineY1 - arrowSize/2);
context.lineTo(railLeftX1  ,dimensionLineY1  );
context.closePath();
context.fill();


// Add vertical text labels for the heights
const drawVerticalHeightLabel = (context, startX, endX, dimensionLineY1, scaleFactor, offsetX = 20*SCALE_FACTOR) => {
  const distance = Math.abs(startX - endX) / scaleFactor; // Calculate distance in mm
  const midX = (startX + endX) / 2; // Vertical midpoint

  context.save(); // Save the context state
  context.translate(midX, dimensionLineY1 + offsetX); // Move to the label position
  
   
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.fillText(`${distance.toFixed(0)} `, 0, -40*SCALE_FACTOR); // Draw text
  context.restore(); // Restore the original context
};

// Draw labels for the first and second dimensions
drawVerticalHeightLabel(context, railLeftX ,  shaftLeftY, dimensionLineY, SCALE_FACTOR);
drawVerticalHeightLabel(context, railLeftX1 ,  shaftLeftY1, dimensionLineY1, SCALE_FACTOR);

  
    

  
  
      drawRailDistanceDimension(context, railX1, railX2, railCenterY);
      const dimensionOffsetY = startY -50*SCALE_FACTOR-verticalOffset*SCALE_FACTOR;
  
      const labelFontSize = 54 * SCALE_FACTOR;

    // Draw dimension line for wall opening offset
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(centerX, dimensionOffsetY);
    context.lineTo(centerX + horizontalOffsetXPx, dimensionOffsetY);
    context.stroke();

    // Draw arrows
    context.beginPath();
    context.moveTo(centerX +horizontalOffsetXPx - arrowSize/2, dimensionOffsetY - arrowSize / 2);
    context.lineTo(centerX + horizontalOffsetXPx - arrowSize/2, dimensionOffsetY+ arrowSize / 2);
    context.lineTo(centerX+ horizontalOffsetXPx, dimensionOffsetY);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(centerX + arrowSize/2, dimensionOffsetY - arrowSize / 2);
    context.lineTo(centerX + arrowSize/2, dimensionOffsetY + arrowSize / 2);
    context.lineTo(centerX, dimensionOffsetY);
    context.closePath();
    context.fill();

    // Label for wall opening offset
    context.font = `${labelFontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(` ${horizontalOffsetX} `, centerX+horizontalOffsetXPx/2 , dimensionOffsetY - 40 * SCALE_FACTOR);
 
  
       break;
}
  
    default:
      console.warn('Unsupported wall type:', tShapeSettings.selectedWall);
      break;
  }
  // Function to draw the piston
const drawPiston = (context, centerX, centerY) => {
  const outerRadius = 100 * SCALE_FACTOR; // Adjust size as needed
  const innerRadius = 25 * SCALE_FACTOR; // Adjust size as needed

  // Draw outer circle
  context.beginPath();
  context.arc(centerX, centerY- carDoorjambPx/2 - carDoorHeightPx/2, outerRadius, 0, 2 * Math.PI);
  context.strokeStyle = 'purple';
  context.lineWidth = 2;
  context.stroke();

  // Draw inner circle
  context.beginPath();
  context.arc(centerX, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
  context.strokeStyle = 'purple';
  context.lineWidth = 2;
  context.stroke(); 
  context.strokeStyle = 'red';
context.lineWidth = 1;
context.setLineDash([5, 3]);  // Dash pattern for axis lines

// Vertical axis through the piston center
context.beginPath();
context.moveTo(centerX, frameY - tShapeHeightPx -bracketHeightPx-20);  // Top of piston frame
context.lineTo(centerX, frameY + frameHeight+ tShapeHeightPx+bracketHeightPx+20);  // Bottom of piston frame
context.stroke();

// Horizontal axis through the piston center
context.beginPath();
context.moveTo(frameX1 - tShapeHeightPx- bracketHeightPx-20, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
context.lineTo(frameX2+ tShapeHeightPx+ bracketHeightPx+20, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
context.stroke();

// Reset line dash for further drawing
context.setLineDash([]);

 
};
const drawCenterAxisLines = (context, centerX, centerY, frameLeftX, frameRightX,  frameY, frameHeight) => {
  const innerRadius = 25 * SCALE_FACTOR; // Adjust size as needed
  context.strokeStyle = 'red';  // Color for center axis lines
  context.lineWidth = 1;
  context.setLineDash([5, 3]);  // Dashed pattern

  // Vertical axis for piston center
  context.beginPath();
  context.moveTo(centerX, frameY- frameHeight);  // Top of frame
  context.lineTo(centerX, frameY +frameHeight*1.75);  // Bottom of frame
  context.stroke();

  // Horizontal axis for piston center
  context.beginPath();
  context.moveTo(frameLeftX, centerY -carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);  // Start at left side of frame
  context.lineTo(frameRightX, centerY -carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);// Extend to the right side
  context.stroke();

  // Reset line dash for further drawing
  context.setLineDash([]);
};
const drawPistonForLeftAndRightCase = (context, startX, startY, innerWidthPx, innerDepthPx) => {
  const frameWidth = 150 * SCALE_FACTOR;
  const railDistancePx = tShapeSettings.railDistance * SCALE_FACTOR;
   const shoeHeight = 75* SCALE_FACTOR;

  // Calculate frame dimensions for left and right cases
  const centerY = cabinY + cabinDepthPx / 2 + carDoorjambPx+ carDoorHeightPx-verticalOffset*SCALE_FACTOR/2;
  const leftRailX = startX + tShapeSettings.leftOffsetX * SCALE_FACTOR;
  const bottomLeftY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight /2+ (verticalOffsetY * SCALE_FACTOR);
  const bottomLeftY2 = centerY + railDistancePx / 2 - tShapeHeightPx  - shoeHeight/2+ (verticalOffsetY * SCALE_FACTOR);

  const frameLeftX1 = leftRailX + frameWidth/2 + tShapeHeightThicknessPx/2;
  const frameLeftX2 = frameLeftX1 - frameWidth;
  const frameLeftY = bottomLeftY1;
  const frameLeftHeight = bottomLeftY2 - bottomLeftY1;
  

  const rightRailX = startX + innerWidthPx +frameWidth/2 + tShapeSettings.rightOffsetX * SCALE_FACTOR;
  const bottomRightY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight/2  + (verticalOffsetY * SCALE_FACTOR);
  const bottomRightY2 = centerY + railDistancePx / 2 - tShapeHeightPx - shoeHeight /2 + (verticalOffsetY * SCALE_FACTOR);

  const frameRightX1 = rightRailX + tShapeHeightThicknessPx/2 ;
  const frameRightX2 = frameRightX1 - frameWidth;
  const frameRightY = bottomRightY1;
  const frameRightHeight = bottomRightY2 - bottomRightY1;


   // Calculate centers
   const frameCenterXLeft = (frameLeftX1 + frameLeftX2) / 2;
   const frameCenterYLeft = frameLeftY + frameLeftHeight / 2;
   const frameCenterXRight = (frameRightX1 + frameRightX2) / 2;
   const frameCenterYRight = frameRightY + frameRightHeight / 2;
 

 
   drawPiston(context, frameCenterXLeft, frameCenterYLeft);
   drawPiston(context, frameCenterXRight, frameCenterYRight);
 
   // Draw center axis lines
   drawCenterAxisLines(context, frameCenterXLeft, frameCenterYLeft, frameLeftX1, frameLeftX2, frameLeftY, frameLeftHeight);
   drawCenterAxisLines(context, frameCenterXRight, frameCenterYRight, frameRightX1, frameRightX2, frameRightY, frameRightHeight);

  
};




  

 
  
  let frameX1, frameX2, frameY, frameHeight , frameWidth;

  switch (tShapeSettings.selectedWall) {
    case 'left': {
      
      const railX = startX + tShapeSettings.offsetX * SCALE_FACTOR;
      const centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2-verticalOffset*SCALE_FACTOR/2;
      const shoeHeight = 60 * SCALE_FACTOR;
      
  
      const bottomY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight /2+ (verticalOffsetY * SCALE_FACTOR);
      const bottomY2 = centerY + railDistancePx / 2 - tShapeHeightPx - shoeHeight/2 + (verticalOffsetY * SCALE_FACTOR);
      frameWidth = 150 * SCALE_FACTOR
      frameY = bottomY1 ;
      frameHeight = bottomY2 - bottomY1;
      frameX1 = railX + frameWidth /2 ;
      frameX2 = frameX1 - frameWidth  + tShapeHeightThicknessPx;
   
  
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.strokeRect(frameX1, frameY, frameX2 - frameX1, frameHeight);
  
      const innerFrameWidth = (frameX2 - frameX1) / 2;
      const innerFrameHeight = frameHeight / 2;
      const innerFrameX = frameX1 + innerFrameWidth / 2;
      const innerFrameY = frameY + innerFrameHeight / 2;
  
      context.strokeRect(innerFrameX, innerFrameY, innerFrameWidth, innerFrameHeight);

      
       // Calculate the center of the car frame
       const frameCenterX = (frameX1 + frameX2) / 2;
       const frameCenterY = frameY + frameHeight / 2 + carDoorjambPx/2 + carDoorHeightPx/2;
        
   
       // Draw the piston at the center of the car frame
       drawPiston(context, frameCenterX, frameCenterY);
      // Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 72*SCALE_FACTOR; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(innerWallX, dimensionLineY);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(innerWallX + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(innerWallX + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(innerWallX, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(pistonAxisX - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.closePath();
  context.fill();
  context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(pistonAxisX, startY+innerDepthPx/2);
context.lineTo(pistonAxisX, dimensionLineY);
context.stroke();

  // Add label
  const dimensionLength = ((pistonAxisX - innerWallX) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `${labelFontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (innerWallX + pistonAxisX) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX = startX + offsetXPx; // Center of the shaft
drawDimensionToPiston(context, startX, pistonAxisX, startY, innerDepthPx);
// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston1 = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 72*SCALE_FACTOR; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(cabinX, dimensionLineY);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(pistonAxisX1 + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX1 + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX1, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(cabinX - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(cabinX - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(cabinX, dimensionLineY);
  context.closePath();
  context.fill();

  // Add label
  const dimensionLength = ((cabinX- pistonAxisX1) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `${labelFontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (cabinX + pistonAxisX1) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX1 = startX + offsetXPx; // Center of the shaft
drawDimensionToPiston1(context, startX, pistonAxisX, startY, innerDepthPx);
      
     
      break;
    }
  
    case 'right': {
      
      frameWidth = 150 * SCALE_FACTOR
      const railX = startX + innerWidthPx - frameWidth/2 + tShapeSettings.offsetX*SCALE_FACTOR ;
      const centerY = cabinY + cabinDepthPx / 2 + carDoorjambPx/2 + carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;
      const shoeHeight = 60 * SCALE_FACTOR;
  
      const bottomY1 = centerY - railDistancePx / 2 + tShapeHeightPx +shoeHeight/2 + (verticalOffsetY * SCALE_FACTOR);
      const bottomY2 = centerY + railDistancePx / 2 - tShapeHeightPx -  shoeHeight/2 + (verticalOffsetY * SCALE_FACTOR);
      
      
      frameX1 = railX  + tShapeHeightThicknessPx/2 ;
      frameX2 = frameX1 + frameWidth   ;
      frameY = bottomY1;
      frameHeight = bottomY2 - bottomY1;
  
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.strokeRect(frameX1, frameY, frameX2 - frameX1, frameHeight);
  
      const innerFrameWidth = (frameX2 - frameX1) / 2;
      const innerFrameHeight = frameHeight / 2;
      const innerFrameX = frameX1 + innerFrameWidth / 2;
      const innerFrameY = frameY + innerFrameHeight / 2;
  
      context.strokeRect(innerFrameX, innerFrameY, innerFrameWidth, innerFrameHeight);
      // Calculate the center of the car frame
    const frameCenterX = (frameX1 + frameX2) / 2;
    const frameCenterY = frameY + frameHeight / 2 + carDoorjambPx/2 + carDoorHeightPx/2;
     

    // Draw the piston at the center of the car frame
    drawPiston(context, frameCenterX, frameCenterY);
    // Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 72*SCALE_FACTOR; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(innerWallX + innerWidthPx, dimensionLineY);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(innerWallX+ innerWidthPx  - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(innerWallX+ innerWidthPx - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(innerWallX+ innerWidthPx, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(pistonAxisX + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.closePath();
  context.fill();
  context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(pistonAxisX, startY+innerDepthPx/2);
context.lineTo(pistonAxisX, dimensionLineY);
context.stroke();

  // Add label
  const dimensionLength = (-(- innerWallX -innerWidthPx +pistonAxisX) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `${labelFontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (innerWallX + innerWidthPx+ pistonAxisX) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX = startX + innerWidthPx+ offsetXPx; // Center of the shaft
drawDimensionToPiston(context, startX, pistonAxisX, startY, innerDepthPx);
// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston1 = (context, innerWallX1, pistonAxisX1, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 72*SCALE_FACTOR; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(pistonAxisX1, dimensionLineY);
  context.lineTo(innerWallX1+ innerWidthPx- railwallDistancePx, dimensionLineY); // Corrected to full shaft width
  context.stroke();

  // Left arrow (piston axis)
  context.beginPath();
  context.moveTo(pistonAxisX1 - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX1 - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX1, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow (shaft inner wall)
  context.beginPath();
  context.moveTo(innerWallX1 + innerWidthPx - railwallDistancePx+ arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(innerWallX1 + innerWidthPx - railwallDistancePx+ arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(innerWallX1 + innerWidthPx- railwallDistancePx, dimensionLineY);
  context.closePath();
  context.fill();

  // Add label
  const dimensionLength = (-(innerWallX1 + innerWidthPx- railwallDistancePx - pistonAxisX1) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `${labelFontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (pistonAxisX1 + innerWallX1 + innerWidthPx- railwallDistancePx) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Corrected Example Usage in drawShaft
const pistonAxisX1 = startX + innerWidthPx + offsetXPx; // Adjusted center of the shaft
drawDimensionToPiston1(context, startX, pistonAxisX1, startY, innerDepthPx);
 
     
      break;
    }
  
    case 'rear': {
      const centerX = cabinX + cabinWidthPx / 2;
       const shoeHeight = 60*SCALE_FACTOR;
      const railX1 = centerX - railDistancePx / 2  + tShapeHeightPx + shoeHeight/2 + tShapeSettings.offsetX * SCALE_FACTOR +(horizontalOffsetX * SCALE_FACTOR);
      const railX2 = centerX + railDistancePx / 2 - tShapeHeightPx - shoeHeight/2+ tShapeSettings.offsetX * SCALE_FACTOR +(horizontalOffsetX * SCALE_FACTOR);
      
      frameHeight = 150 * SCALE_FACTOR;
      frameX1 = railX1;
      frameX2 = railX2 ;
      frameY = startY - frameHeight /2 + tShapeHeightThicknessPx/2+ tShapeSettings.offsetY * SCALE_FACTOR ;
      const centerY = cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2 +verticalOffset*SCALE_FACTOR/2;
  
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.strokeRect(frameX1, frameY, frameX2 - frameX1, frameHeight);
  
      const innerFrameWidth = (frameX2 - frameX1) / 2;
      const innerFrameHeight = frameHeight / 2;
      const innerFrameX = frameX1 + innerFrameWidth / 2;
      const innerFrameY = frameY + innerFrameHeight / 2;
  
      context.strokeRect(innerFrameX, innerFrameY, innerFrameWidth, innerFrameHeight);

      const outerRadius = 100 * SCALE_FACTOR; // Adjust size as needed
  const innerRadius = 25 * SCALE_FACTOR; // Adjust size as needed

  // Draw outer circle
  context.beginPath();
  context.arc(centerX, centerY- carDoorjambPx/2 - carDoorHeightPx/2, outerRadius, 0, 2 * Math.PI);
  context.strokeStyle = 'purple';
  context.lineWidth = 2;
  context.stroke();

  // Draw inner circle
  context.beginPath();
  context.arc(centerX, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
  context.strokeStyle = 'purple';
  context.lineWidth = 2;
  context.stroke(); 
  context.strokeStyle = 'red';
context.lineWidth = 1;
context.setLineDash([5, 3]);  // Dash pattern for axis lines

// Vertical axis through the piston center
context
.beginPath();
context.moveTo(centerX, frameY - tShapeHeightPx -bracketHeightPx-20);  // Top of piston frame
context.lineTo(centerX, frameY + frameHeight+ tShapeHeightPx+bracketHeightPx+20);  // Bottom of piston frame
context.stroke();

// Horizontal axis through the piston center
context.beginPath();
context.moveTo(frameX1 - tShapeHeightPx- bracketHeightPx-20, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
context.lineTo(frameX2+ tShapeHeightPx+ bracketHeightPx+20, centerY- carDoorjambPx/2 - carDoorHeightPx/2, innerRadius, 0, 2 * Math.PI);
context.stroke();

// Reset line dash for further drawing
context.setLineDash([]);

const frameCenterX = (frameX1 + frameX2) / 2;
const frameCenterY = frameY + frameHeight / 2 + carDoorjambPx/2 + carDoorHeightPx/2;
 

// Draw the piston at the center of the car frame
drawPiston(context, frameCenterX, frameCenterY);

// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston = (context, innerWallY, pistonAxisY, startY, innerDepthPx) => {
 const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
const labelFontSize = 72*SCALE_FACTOR; // Label font size

// Position for the dimension line
const dimensionLineX = startX +innerWidthPx + rightWallThicknessPx+ 225 * SCALE_FACTOR; // Below the shaft for clarity

// Draw the horizontal dimension line
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo( dimensionLineX ,innerWallY );
context.lineTo(dimensionLineX ,pistonAxisY);
context.stroke();

// Draw arrows
// Left arrow
context.beginPath();
context.moveTo( dimensionLineX - arrowSize / 2 ,innerWallY  + arrowSize);
context.lineTo(dimensionLineX + arrowSize / 2 ,innerWallY  + arrowSize);
context.lineTo( dimensionLineX ,innerWallY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo( dimensionLineX - arrowSize / 2,pistonAxisY - arrowSize);
context.lineTo(dimensionLineX + arrowSize / 2,pistonAxisY - arrowSize);
context.lineTo(dimensionLineX ,pistonAxisY );
context.closePath();
context.fill();
context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(startX+innerWidthPx/2, pistonAxisY);
context.lineTo(dimensionLineX, pistonAxisY);
context.stroke();


const dimensionLength = ((-innerWallY + pistonAxisY) / SCALE_FACTOR).toFixed(0); // Convert to mm

context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillStyle = 'black';

// Corrected midpoint calculation
const textX = dimensionLineX +40*SCALE_FACTOR; // Adjusted X position
const textY = (innerWallY + pistonAxisY) / 2; // Adjusted Y position

// Move to the label position before rotating
context.translate(textX, textY);

// Rotate 180 degrees (flip text upside down)
context.rotate(Math.PI/2);

// Draw the rotated text
context.fillText(` ${dimensionLength} `, 0, 0);

context.restore(); // Restore original orientation
}

// Example usage in drawShaft
const pistonAxisY = startY + offsetYPx; // Center of the shaft
drawDimensionToPiston(context, startY, pistonAxisY, startY, innerDepthPx);
// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston1 = (context, innerWallY1, pistonAxisY1, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 72*SCALE_FACTOR; // Label font size

  // Position for the dimension line
  const dimensionLineX = startX + innerWidthPx+  rightWallThicknessPx+ 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo( dimensionLineX ,innerWallY1  + railwallDistancePx);
  context.lineTo( dimensionLineX ,pistonAxisY1);
  context.stroke();

  // Left arrow (piston axis)
  context.beginPath();
  context.moveTo(dimensionLineX - arrowSize / 2 ,pistonAxisY1 + arrowSize);
  context.lineTo(dimensionLineX + arrowSize / 2 ,pistonAxisY1 + arrowSize);
  context.lineTo( dimensionLineX , pistonAxisY1);
  context.closePath();
  context.fill();

  // Right arrow (shaft inner wall minus railwallDistancePx)
  context.beginPath();
  context.moveTo( dimensionLineX - arrowSize / 2 , innerWallY1  + railwallDistancePx - arrowSize);
  context.lineTo( dimensionLineX + arrowSize / 2,innerWallY1  + railwallDistancePx - arrowSize);
  context.lineTo( dimensionLineX , innerWallY1  + railwallDistancePx);
  context.closePath();
  context.fill();

// Compute the label text
const dimensionLength = ((-pistonAxisY1 + innerWallY1 + railwallDistancePx) / SCALE_FACTOR).toFixed(0); // Convert to mm

context.save();
context.font = `${labelFontSize}px Arial`; 
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillStyle = 'black';

// Corrected midpoint calculation
const textX = dimensionLineX +40*SCALE_FACTOR; // Keep text near the dimension line
const textY = (pistonAxisY1 + innerWallY1) / 2 + railwallDistancePx / 2; // Adjusted midpoint

// Move to label position before rotating
context.translate(textX, textY);

// Rotate 180 degrees (flip text)
context.rotate(Math.PI/2);

// Draw the rotated text
context.fillText(` ${dimensionLength} `, 0, 0);

context.restore(); // Restore original orientation

};

// Corrected Example Usage in drawShaft
const pistonAxisY1 = startY  + offsetYPx; // Adjusted center of the shaft
drawDimensionToPiston1(context, startY, pistonAxisY1, startY, innerDepthPx);



      
      
      break;
    }
  
    case 'left & right': {
      const centerY = cabinY + cabinDepthPx / 2 + carDoorjambPx/2 + carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;
      const shoeHeight = 60*SCALE_FACTOR;
    
      // Left rail logic
      const leftRailX = startX + tShapeSettings.leftOffsetX * SCALE_FACTOR;
      const bottomLeftY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight /2+ (verticalOffsetY * SCALE_FACTOR);
      const bottomLeftY2 = centerY + railDistancePx / 2 - tShapeHeightPx  - shoeHeight/2+ (verticalOffsetY * SCALE_FACTOR);
    const frameWidth = 150 * SCALE_FACTOR
      const frameLeftX1 = leftRailX + frameWidth/2 + tShapeHeightThicknessPx/2;
      const frameLeftX2 = frameLeftX1 - frameWidth;
      const frameLeftY = bottomLeftY1;
      const frameLeftHeight = bottomLeftY2 - bottomLeftY1;
      
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      // Draw outer frame for the left rail
      context.strokeRect(frameLeftX1, frameLeftY, frameLeftX2 - frameLeftX1, frameLeftHeight);
    
      // Calculate and draw inner frame for the left rail
      const innerFrameLeftWidth = (frameLeftX2 - frameLeftX1) / 2;
      const innerFrameLeftHeight = frameLeftHeight / 2;
      const innerFrameLeftX = frameLeftX1 + innerFrameLeftWidth / 2;
      const innerFrameLeftY = frameLeftY + innerFrameLeftHeight / 2;
    
      context.strokeRect(innerFrameLeftX, innerFrameLeftY, innerFrameLeftWidth, innerFrameLeftHeight);
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      // Right rail logic
      const rightRailX = startX + innerWidthPx +frameWidth/2 + tShapeSettings.rightOffsetX * SCALE_FACTOR;
      const bottomRightY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight/2  + (verticalOffsetY * SCALE_FACTOR);
      const bottomRightY2 = centerY + railDistancePx / 2 - tShapeHeightPx - shoeHeight /2 + (verticalOffsetY * SCALE_FACTOR);
    
      const frameRightX1 = rightRailX + tShapeHeightThicknessPx/2 ;
      const frameRightX2 = frameRightX1 - frameWidth;
      const frameRightY = bottomRightY1;
      const frameRightHeight = bottomRightY2 - bottomRightY1;
    
      // Draw outer frame for the right rail
      context.strokeRect(frameRightX1, frameRightY, frameRightX2 - frameRightX1, frameRightHeight);
    
      // Calculate and draw inner frame for the right rail
      const innerFrameRightWidth = (frameRightX2 - frameRightX1) / 2;
      const innerFrameRightHeight = frameRightHeight / 2;
      const innerFrameRightX = frameRightX1 + innerFrameRightWidth / 2;
      const innerFrameRightY = frameRightY + innerFrameRightHeight / 2;
    
      context.strokeRect(innerFrameRightX, innerFrameRightY, innerFrameRightWidth, innerFrameRightHeight);
    
      drawPistonForLeftAndRightCase(context, startX, startY, innerWidthPx, innerDepthPx);
      // Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 13; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(innerWallX, dimensionLineY);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(innerWallX + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(innerWallX + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(innerWallX, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(pistonAxisX - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.closePath();
  context.fill();

  // Add label
  const dimensionLength = ((pistonAxisX - innerWallX) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `$12px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (innerWallX + pistonAxisX) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX = startX + leftOffsetXPx; // Center of the shaft
drawDimensionToPiston(context, startX, pistonAxisX, startY, innerDepthPx);
// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston1 = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 13; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(cabinX, dimensionLineY);
  context.lineTo(pistonAxisX, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(pistonAxisX1 + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX1 + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX1, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(cabinX - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(cabinX - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(cabinX, dimensionLineY);
  context.closePath();
  context.fill();

  // Add label
  const dimensionLength = ((cabinX- pistonAxisX1) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `$12px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (cabinX + pistonAxisX1) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX1 = startX + leftOffsetXPx; // Center of the shaft
drawDimensionToPiston1(context, startX, pistonAxisX, startY, innerDepthPx);


const drawDimensionToPiston2 = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(innerWallX + innerWidthPx- railwallDistancePx, dimensionLineY);
  context.lineTo(pistonAxisX2, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(innerWallX + innerWidthPx- railwallDistancePx+ arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(innerWallX + innerWidthPx- railwallDistancePx + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(innerWallX + innerWidthPx- railwallDistancePx, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(pistonAxisX2 - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX2 - arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX2, dimensionLineY);
  context.closePath();
  context.fill();
  context.strokeStyle = 'grey'; // Dimension line color
  context.lineWidth = 0.5;
  
  // Left perpendicular line
  context.beginPath();
  context.moveTo(startX+leftOffsetXPx,centerY);
  context.lineTo(startX+leftOffsetXPx, dimensionLineY);
  context.stroke();
  

  // Add label
  const dimensionLength = (-( innerWallX + innerWidthPx- railwallDistancePx - pistonAxisX2) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `$12px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (innerWallX+ innerWidthPx- railwallDistancePx + pistonAxisX2) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX2 = startX+ innerWidthPx +rightOffsetXPx; // Center of the shaft
drawDimensionToPiston2(context, startX, pistonAxisX, startY, innerDepthPx);


// Drawing dimension line from the inner wall of the shaft to the piston axis
const drawDimensionToPiston3 = (context, innerWallX, pistonAxisX, startY, innerDepthPx) => {
   const arrowSize = 32*SCALE_FACTOR; // Arrowhead size
  const labelFontSize = 13; // Label font size

  // Position for the dimension line
  const dimensionLineY = startY - rearWallThicknessPx  - 225 * SCALE_FACTOR; // Below the shaft for clarity

  // Draw the horizontal dimension line
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(startX+innerWidthPx, dimensionLineY);
  context.lineTo(pistonAxisX3, dimensionLineY);
  context.stroke();

  // Draw arrows
  // Left arrow
  context.beginPath();
  context.moveTo(pistonAxisX3 + arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(pistonAxisX3 + arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(pistonAxisX3, dimensionLineY);
  context.closePath();
  context.fill();

  // Right arrow
  context.beginPath();
  context.moveTo(startX+innerWidthPx - arrowSize, dimensionLineY - arrowSize / 2);
  context.lineTo(startX+innerWidthPx- arrowSize, dimensionLineY + arrowSize / 2);
  context.lineTo(startX+innerWidthPx, dimensionLineY);
  context.closePath();
  context.fill();
  context.strokeStyle = 'grey'; // Dimension line color
context.lineWidth = 0.5;

// Left perpendicular line
context.beginPath();
context.moveTo(pistonAxisX3,centerY);
context.lineTo(pistonAxisX3, dimensionLineY);
context.stroke();

  // Add label
  const dimensionLength = ((startX+innerWidthPx- pistonAxisX3) / SCALE_FACTOR).toFixed(0); // Convert to mm
  context.save();
  context.font = `$12px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(` ${dimensionLength} `, (startX+innerWidthPx + pistonAxisX3) / 2, dimensionLineY -40*SCALE_FACTOR);
  context.restore();
};

// Example usage in drawShaft
const pistonAxisX3 = startX + innerWidthPx+ rightOffsetXPx; // Center of the shaft
drawDimensionToPiston3(context, startX, pistonAxisX, startY, innerDepthPx);




      break;
    }

    default:
      break;
  }
 

  
 


  
   // Function to draw U-shaped structures
   const drawUShoe = (x, y, shoeWidth, shoeHeight, isFlipped = false, isHorizontal = false, rotation = 0) => {
    const shoeThickness = 10 * SCALE_FACTOR; // Thickness of the U-shape
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.save(); // Save the current context state
    context.translate(x, y); // Move the origin to the shoe's position
    context.rotate((rotation * Math.PI) / 180); // Apply rotation in degrees

    if (isHorizontal) {
        // Horizontal U-shape
        if (isFlipped) {
            context.strokeRect(0, 0, shoeThickness, shoeHeight); // Left bar
            context.strokeRect(shoeThickness, 0, shoeWidth - shoeThickness * 2, shoeThickness); // Top bar
            context.strokeRect(shoeWidth - shoeThickness, 0, shoeThickness, shoeHeight); // Right bar
        } else {
            context.strokeRect(0, shoeHeight - shoeThickness, shoeThickness, shoeHeight); // Left bar
            context.strokeRect(shoeThickness, shoeHeight - shoeThickness, shoeWidth - shoeThickness * 2, shoeThickness); // Bottom bar
            context.strokeRect(shoeWidth - shoeThickness, shoeHeight - shoeThickness, shoeThickness, shoeHeight); // Right bar
        }
    } else {
        // Vertical U-shape
        if (isFlipped) {
            context.strokeRect(0, 0, shoeWidth, shoeThickness); // Bottom bar
            context.strokeRect(0, -shoeHeight + shoeThickness, shoeThickness, shoeHeight); // Left bar
            context.strokeRect(shoeWidth - shoeThickness, -shoeHeight + shoeThickness, shoeThickness, shoeHeight); // Right bar
        } else {
            context.strokeRect(0, 0, shoeWidth, shoeThickness); // Top bar
            context.strokeRect(0, 0, shoeThickness, shoeHeight); // Left bar
            context.strokeRect(shoeWidth - shoeThickness, 0, shoeThickness, shoeHeight); // Right bar
        }
    }

    context.restore(); // Restore the context state
};

  // Logic for placing U-shaped shoes based on the selected wall
switch (tShapeSettings.selectedWall) {
  case 'left': {
    // For left wall: U-shaped shoes at top and bottom
    const shoeWidth = 74 * SCALE_FACTOR;
    const shoeHeight = 60 * SCALE_FACTOR;
    const shoeThickness = 10 * SCALE_FACTOR;

    const topShoeX = (frameX1 + frameX2) / 2 - shoeWidth / 2;
    const topShoeY = frameY - shoeThickness;
    drawUShoe(topShoeX, topShoeY, shoeWidth, shoeHeight, true); // Flipped for top

    const bottomShoeX = topShoeX;
    const bottomShoeY = frameY + frameHeight ;
    drawUShoe(bottomShoeX, bottomShoeY, shoeWidth, shoeHeight); // Normal for bottom
    break;
  }

  case 'right': {
    // For right wall: U-shaped shoes at top and bottom
    const shoeWidth = 74 * SCALE_FACTOR;
    const shoeHeight = 60 * SCALE_FACTOR;
    const shoeThickness = 10 * SCALE_FACTOR;

    const topShoeX = (frameX1 + frameX2) / 2 - shoeWidth / 2;
    const topShoeY = frameY -shoeThickness;
    drawUShoe(topShoeX, topShoeY, shoeWidth, shoeHeight, true); // Flipped for top

    const bottomShoeX = topShoeX;
    const bottomShoeY = frameY + frameHeight ;
    drawUShoe(bottomShoeX, bottomShoeY, shoeWidth, shoeHeight); // Normal for bottom
    break;
  }

  case 'rear': {
    // For rear wall: U-shaped shoes centered vertically
    const shoeWidth = 75 * SCALE_FACTOR;
    const shoeHeight = 60 * SCALE_FACTOR;
    const shoeThickness = 10 * SCALE_FACTOR;
    const frameWidth = 150* SCALE_FACTOR;

    const shoeY = frameY + (frameWidth ) / 2  - shoeWidth/2 ;

    const leftShoeX = frameX1 ; // Left rail
    drawUShoe(leftShoeX, shoeY, shoeWidth, shoeHeight, false, false, 90); // Rotate 90° clockwise

    const rightShoeX = frameX2 + shoeThickness; // Right rail
    drawUShoe(rightShoeX, shoeY, shoeWidth, shoeHeight, true, false, -270); // Rotate and flip 180°
    break;
  }
  case 'left & right': {
    // Common dimensions

    const centerY =cabinY + cabinDepthPx / 2+ carDoorjambPx/2 + carDoorHeightPx/2 -verticalOffset*SCALE_FACTOR/2;
    const shoeWidth = 74 * SCALE_FACTOR;
    const shoeHeight = 60 * SCALE_FACTOR;
    const shoeThickness = 10 * SCALE_FACTOR;
    const frameWidth = 150* SCALE_FACTOR;
  
    // Compute Left Frame Dimensions
    const leftRailX = startX + tShapeSettings.leftOffsetX * SCALE_FACTOR;
    const leftBottomY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight/2 - shoeThickness + (verticalOffsetY * SCALE_FACTOR);
    const leftBottomY2 = centerY + railDistancePx / 2 - tShapeHeightPx - shoeHeight/2 -shoeThickness+ (verticalOffsetY * SCALE_FACTOR) ;
    const frameLeftX1 = leftRailX+ frameWidth/2  + tShapeHeightThicknessPx/2;
    const frameLeftX2 = frameLeftX1 - frameWidth;
    const frameLeftY = leftBottomY1;
    const frameLeftHeight = leftBottomY2 - leftBottomY1;
  
    // Compute Right Frame Dimensions
    const rightRailX = startX + innerWidthPx + frameWidth/2 + tShapeSettings.rightOffsetX * SCALE_FACTOR;
    const rightBottomY1 = centerY - railDistancePx / 2 + tShapeHeightPx + shoeHeight/2 -shoeThickness+(verticalOffsetY * SCALE_FACTOR);
    const rightBottomY2 = centerY + railDistancePx / 2 - tShapeHeightPx - shoeHeight/2 -shoeThickness+ (verticalOffsetY * SCALE_FACTOR) ;
    const frameRightX1 = rightRailX + tShapeHeightThicknessPx/2;
    const frameRightX2 = frameRightX1 - frameWidth ;
    const frameRightY = rightBottomY1;
    const frameRightHeight = rightBottomY2 - rightBottomY1;
  
    // Left Wall Shoes
    const leftTopShoeX = frameLeftX1 + (frameLeftX2 - frameLeftX1) / 2 - shoeWidth / 2;
    const leftTopShoeY = frameLeftY ;
    const leftBottomShoeX = leftTopShoeX ;
    const leftBottomShoeY = frameLeftY + frameLeftHeight + shoeThickness;
  
    // Right Wall Shoes
    const rightTopShoeX = frameRightX1 + (frameRightX2 - frameRightX1) / 2 - shoeWidth / 2 ;
    const rightTopShoeY = frameRightY ;
    const rightBottomShoeX = rightTopShoeX ;
    const rightBottomShoeY = frameRightY + frameRightHeight +shoeThickness;
  
    // Draw Left Shoes
    drawUShoe(leftTopShoeX, leftTopShoeY, shoeWidth, shoeHeight, true); // Flipped for top
    drawUShoe(leftBottomShoeX, leftBottomShoeY, shoeWidth, shoeHeight); // Normal for bottom
  
    // Draw Right Shoes
    drawUShoe(rightTopShoeX, rightTopShoeY, shoeWidth, shoeHeight, true); // Flipped for top
    drawUShoe(rightBottomShoeX, rightBottomShoeY, shoeWidth, shoeHeight); // Normal for bottom
  
    break;
  }
  
  default:
    break;
}
 

};








    const drawDoorsS2C = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx ,) => {
      // Convert dimensions and offsets to pixels
      const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
      const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
      const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
      const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
      const doorGapPx = doorGap * SCALE_FACTOR;
      const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
      const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
      const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;
  
    
      // Cabin settings in pixels
      const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
      const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
      const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;
   
    
      let landingDoorX, carDoorX , frameX1 , frameX2;
    
      switch (tShapeSettings.selectedWall) {
        case 'left':
          carDoorX= startX + railWallDistancePx  + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2 -wallOpeningOffset * SCALE_FACTOR;
          landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
          frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2; // Left frame
          frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
          

          break;
        case 'right':
          carDoorX = startX + leftDistancePx  + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 -wallOpeningOffset * SCALE_FACTOR;
          landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 ;
          frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 ; // Left frame
          frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx  ; // Right frame
          break;
        case 'rear':
          carDoorX = startX + leftDistancePx + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2 -wallOpeningOffset * SCALE_FACTOR;
          landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
          frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2; // Left frame
          frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
          break;
        case 'left & right':
          carDoorX = startX + railWallDistancePx + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2 -wallOpeningOffset * SCALE_FACTOR;
          landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
          frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 -wallOpeningOffset * SCALE_FACTOR; // Left frame
          frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
          break;
        default:
          console.warn('Unsupported wall selection for S2C doors alignment.');
          return;
      }
    
      const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset * SCALE_FACTOR;
      let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
      let frameY1 = startY + cabinDepthPx;


      // Draw Landing Door
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      context.lineWidth = 1;
      context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
      context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
    
      // Align car door directly above the landing door
      frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
      const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx;
    
  // Draw the Car Door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Color for the car door
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

  // Calculate positions for the vertical lines with offset
  const distanceBetweenLinesPx = DoorWidthPx;
  const landingLineX1 = landingDoorX + (landingDoorWidthPx - distanceBetweenLinesPx) / 2;
  const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
  const landingMiddleLineX = (landingLineX1 + landingLineX2) / 2; // Middle line
  const carLineX1 = carDoorX + (carDoorWidthPx - distanceBetweenLinesPx) / 2;
  const carLineX2 = carLineX1 + distanceBetweenLinesPx;
  const carMiddleLineX = (carLineX1 + carLineX2) / 2; // Middle line
  

  // Draw vertical lines for landing door
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(landingLineX1, landingDoorY); // Left line
  context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
  context.moveTo(landingLineX2, landingDoorY); // Right line
  context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
  context.moveTo(landingMiddleLineX, landingDoorY); // Middle line
  context.lineTo(landingMiddleLineX, landingDoorY + landingDoorHeightPx);
  context.stroke();

  // Draw vertical lines for car door
  context.beginPath();
  context.moveTo(carLineX1, carDoorY); // Left line
  context.lineTo(carLineX1, carDoorY + carDoorHeightPx  );
  context.moveTo(carLineX2, carDoorY); // Right line
  context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
  context.moveTo(carMiddleLineX, carDoorY); // Middle line
  context.lineTo(carMiddleLineX, carDoorY + carDoorHeightPx);
  context.stroke();
  

  // Draw horizontal lines for landing door
  context.strokeStyle = 'black';
  context.lineWidth = 1
  const numberOfHorizontalLines = 2;
  const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1);
  for (let i = 1; i <= numberOfHorizontalLines; i++) {
      const horizontalY = landingDoorY + i * landingLineSpacingY;
      context.beginPath();
      context.moveTo(landingLineX1, horizontalY);
      context.lineTo(landingLineX2, horizontalY);
      context.stroke();
  }

  // Draw horizontal lines for car door
  const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1);
  for (let i = 1; i <= numberOfHorizontalLines; i++) {
      const horizontalY = carDoorY + i * carLineSpacingY;
      context.beginPath();
      context.moveTo(carLineX1, horizontalY);
      context.lineTo(carLineX2, horizontalY);
      context.stroke();
  }

  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 1;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 24*SCALE_FACTOR;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();
 context.strokeStyle = 'black'; // Dimension line color
 context.lineWidth = 0.3;
 // Perpendicular lines at the ends
 context.beginPath();

 context.moveTo(landingDoorX,landingDoorY); // Left side vertical line
 context.lineTo(landingDoorX, landingDimensionY);
 context.stroke();

 context.beginPath();
 context.moveTo(landingDoorX + landingDoorWidthPx,landingDoorY); // Right side vertical line
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY);
 context.stroke();


 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY -40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();
 context.strokeStyle = 'black'; // Dimension line color
 context.lineWidth = 0.3;
 // Perpendicular lines at the ends
 context.beginPath();

 context.moveTo(carDoorX,carDoorY); // Left side vertical line
 context.lineTo(carDoorX, carDimensionY);
 context.stroke();

 context.beginPath();
 context.moveTo(carDoorX + carDoorWidthPx,carDoorY); // Right side vertical line
 context.lineTo(carDoorX + carDoorWidthPx,carDimensionY);
 context.stroke();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
       // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX , widthDimY -40*SCALE_FACTOR);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 , widthDimY1 -40*SCALE_FACTOR);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1 ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.moveTo(heightDimX, frameY);

      context.stroke();
  
      context.beginPath();
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.moveTo(heightDimX, frameY + frameHeightPx);

      context.stroke();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} `, heightDimX -40*SCALE_FACTOR ,heightLabelY -verticalOffset*SCALE_FACTOR);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  


    
     





  
  
};
const drawDoorsS1L = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx  - DoorWidthPx/2 + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2  + 12.5*SCALE_FACTOR - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  + 25 * SCALE_FACTOR  ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx - frameWidthPx - 120 * SCALE_FACTOR ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx - DoorWidthPx/2 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2+12.5*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 + 25 *SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx - 120*SCALE_FACTOR ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx - DoorWidthPx/2 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2+12.5*SCALE_FACTOR - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 +25*SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx - 120*SCALE_FACTOR ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx - DoorWidthPx/2  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2+12.5*SCALE_FACTOR - wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 +25 *SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx - 120*SCALE_FACTOR ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }

  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset*SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;


  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
 
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx ; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

 // Calculate positions for the vertical lines with offset
 const distanceBetweenLinesPx = DoorWidthPx;
 const landingLineX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -120 *SCALE_FACTOR;
 const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
 const landingMiddleLineX = (landingLineX1 + landingLineX2) / 2; // Middle line
 const carLineX1 = carDoorX +carDoorWidthPx - DoorWidthPx - 25 * SCALE_FACTOR;
 const carLineX2 = carLineX1 + distanceBetweenLinesPx;
 const carMiddleLineX = (carLineX1 + carLineX2) / 2; // Middle line

 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingMiddleLineX, landingDoorY); // Middle line
 context.lineTo(landingMiddleLineX, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY); // Left line
 context.lineTo(carLineX1, carDoorY + carDoorHeightPx  );
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
 context.moveTo(carMiddleLineX, carDoorY); // Middle line
 context.lineTo(carMiddleLineX, carDoorY + carDoorHeightPx);
 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 6;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1);
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX1, horizontalY);
     context.lineTo(landingLineX2, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1);
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 0.5;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 4;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY - 40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
      const labelOffset = -5; // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1  ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(heightDimX, frameY);
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(heightDimX, frameY + frameHeightPx);
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
      context.closePath();
      context.fill();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  


    
     





  
  
};

const drawDoorsS1R =  (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1, frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx + DoorWidthPx/2  + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2  - 12.5*SCALE_FACTOR - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 - 25 *SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx + DoorWidthPx/2 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2-12.5*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 - 25*SCALE_FACTOR ;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx + DoorWidthPx/2 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2-12.5*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 - 25*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx + DoorWidthPx/2  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2-12.5*SCALE_FACTOR - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  -25*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }
   
  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset* SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;

  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
 
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

 // Calculate positions for the vertical lines with offset
 const distanceBetweenLinesPx = DoorWidthPx;
 const landingLineX1 = landingDoorX   +120 *SCALE_FACTOR;
 const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
 const landingMiddleLineX = (landingLineX1 + landingLineX2) / 2; // Middle line
 const carLineX1 = carDoorX  + 25 * SCALE_FACTOR;
 const carLineX2 = carLineX1 + distanceBetweenLinesPx;
 const carMiddleLineX = (carLineX1 + carLineX2) / 2; // Middle line

 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingMiddleLineX, landingDoorY); // Middle line
 context.lineTo(landingMiddleLineX, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY); // Left line
 context.lineTo(carLineX1, carDoorY + carDoorHeightPx  );
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
 context.moveTo(carMiddleLineX, carDoorY); // Middle line
 context.lineTo(carMiddleLineX, carDoorY + carDoorHeightPx);
 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 6;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1);
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX1, horizontalY);
     context.lineTo(landingLineX2, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1);
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 0.5;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 4;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY -40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
      const labelOffset = -5; // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1  ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(heightDimX, frameY);
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(heightDimX, frameY + frameHeightPx);
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
      context.closePath();
      context.fill();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  


    
     





  
  
};
const drawDoorsS2L = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx  - DoorWidthPx/4 + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2  - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  + 35*SCALE_FACTOR;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx - frameWidthPx  - 120 *SCALE_FACTOR; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx - DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 + 35 *SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx - 120 *SCALE_FACTOR; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx - DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 + 35 *SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx  -  120 *SCALE_FACTOR; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx - DoorWidthPx/4  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2- wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 +35 *SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx - 120 *SCALE_FACTOR; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }

  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset * SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;


  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
 
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

  // Calculate positions for the vertical lines with offset
    const distanceBetweenLinesPx = DoorWidthPx /2;
    const landingLineX1 = landingDoorX + landingDoorWidthPx - distanceBetweenLinesPx - 120 *SCALE_FACTOR;
    const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
    const landingLineX3 = landingLineX2 - distanceBetweenLinesPx * 2 ;
 
    const carLineX1 = carDoorX + carDoorWidthPx - distanceBetweenLinesPx - 25 * SCALE_FACTOR;
    const carLineX2 = carLineX1 + distanceBetweenLinesPx ;
    const  carLineX3 = carLineX2 - distanceBetweenLinesPx *2 ;
   


 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX3, landingDoorY); // Right line
 context.lineTo(landingLineX3, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY); // Left line
 context.lineTo(carLineX1, carDoorY +carDoorHeightPx );
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
 context.moveTo(carLineX3, carDoorY); // Right line
 context.lineTo(carLineX3, carDoorY + carDoorHeightPx);


 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 4;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1) /2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX1, horizontalY);
     context.lineTo(landingLineX2, horizontalY);
     context.stroke();
 }
 
 const landingLineSpacingY1  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/2 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY1 + landingDoorHeightPx;
     context.beginPath();
     context.moveTo(landingLineX1, horizontalY);
     context.lineTo(landingLineX3, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX3, horizontalY);
     context.stroke();
 }
 const carLineSpacingY1 = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY1 + carDoorHeightPx;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 0.5;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 4;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY -40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
      const labelOffset = -5; // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1  ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(heightDimX, frameY);
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(heightDimX, frameY + frameHeightPx);
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
      context.closePath();
      context.fill();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  



};
const drawDoorsS2R = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;

  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx + DoorWidthPx/4 + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2   - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 - 35 *SCALE_FACTOR ;
       frameX1= landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx + DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 - 35*SCALE_FACTOR ;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx + DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2-35*SCALE_FACTOR ;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx + DoorWidthPx/4  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2 - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2-35*SCALE_FACTOR ;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }

  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset * SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;


  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
  
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

  // Calculate positions for the vertical lines with offset
    const distanceBetweenLinesPx = DoorWidthPx /2;
    const landingLineX1 = landingDoorX   + DoorWidthPx + 120 *SCALE_FACTOR;
    const landingLineX2 = landingLineX1 - distanceBetweenLinesPx;
    const landingLineX3 = landingLineX1 - distanceBetweenLinesPx * 2 ;
 
    const carLineX1 = carDoorX +DoorWidthPx +25 *SCALE_FACTOR ;
    const carLineX2 = carLineX1 - distanceBetweenLinesPx ;
    const  carLineX3 = carLineX1 - distanceBetweenLinesPx *2  ;
   


 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX3, landingDoorY); // Right line
 context.lineTo(landingLineX3, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY); // Left line
 context.lineTo(carLineX1, carDoorY +carDoorHeightPx );
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
 context.moveTo(carLineX3, carDoorY); // Right line
 context.lineTo(carLineX3, carDoorY + carDoorHeightPx);


 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 4;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1) /2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX2, horizontalY);
     context.lineTo(landingLineX3, horizontalY);
     context.stroke();
 }
 
 const landingLineSpacingY1  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/2 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY1 + landingDoorHeightPx;
     context.beginPath();
     context.moveTo(landingLineX1, horizontalY);
     context.lineTo(landingLineX2, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
 const carLineSpacingY1 = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY1 + carDoorHeightPx;
     context.beginPath();
     context.moveTo(carLineX3, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 0.5;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 4;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY -40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
      const labelOffset = -5; // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1  ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(heightDimX, frameY);
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(heightDimX, frameY + frameHeightPx);
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
      context.closePath();
      context.fill();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  


    
     





  
  
};

const drawDoorsS3R = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = 
doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx + DoorWidthPx/6 + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2 + 2.5 * SCALE_FACTOR - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  - 45 * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx + DoorWidthPx/6 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 +2.5*SCALE_FACTOR- wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  - 45 * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx + DoorWidthPx/6 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2+2.5*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 -45 * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx + DoorWidthPx/6  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2 +2.5*SCALE_FACTOR- wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2  -45 * SCALE_FACTOR;
      frameX1 = landingDoorX - frameWidthPx+ 120* SCALE_FACTOR ;
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }



  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx - verticalOffset * SCALE_FACTOR; // Align to bottom
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;


  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
  
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

  // Calculate positions for the vertical lines with offset
    const distanceBetweenLinesPx = DoorWidthPx /3;
    const landingLineX1 = landingDoorX + DoorWidthPx +120 * SCALE_FACTOR ;
    const landingLineX2 = landingLineX1 - distanceBetweenLinesPx;
    const landingLineX3 = landingLineX1 - distanceBetweenLinesPx * 2 ;
    const landingLineX4 = landingLineX3 - distanceBetweenLinesPx   ;
 
    const carLineX1 = carDoorX  + DoorWidthPx +15 *SCALE_FACTOR ;
    const carLineX2 = carLineX1 - distanceBetweenLinesPx ;
    const  carLineX3 = carLineX1 - distanceBetweenLinesPx *2  ;
    const  carLineX4 = carLineX3 - distanceBetweenLinesPx   ;


 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX3, landingDoorY); // Right line
 context.lineTo(landingLineX3, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX4, landingDoorY); // Right line
 context.lineTo(landingLineX4, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY); // Left line
 context.lineTo(carLineX1, carDoorY +carDoorHeightPx );
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + carDoorHeightPx );
 context.moveTo(carLineX3, carDoorY); // Right line
 context.lineTo(carLineX3, carDoorY + carDoorHeightPx);
 context.moveTo(carLineX4, carDoorY); // Right line
 context.lineTo(carLineX4, carDoorY + carDoorHeightPx);



 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 3;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1) /3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX3, horizontalY);
     context.lineTo(landingLineX4, horizontalY);
     context.stroke();
 }
 
 const landingLineSpacingY1  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/3 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY1 + landingDoorHeightPx /1.5;
     context.beginPath();
     context.moveTo(landingLineX3, horizontalY);
     context.lineTo(landingLineX2, horizontalY);
     context.stroke();
 }
 const landingLineSpacingY2  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/3 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY2 + landingDoorHeightPx;
     context.beginPath();
     context.moveTo(landingLineX2, horizontalY);
     context.lineTo(landingLineX1, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
 const carLineSpacingY1 = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY1 + carDoorHeightPx/ 1.5;
     context.beginPath();
     context.moveTo(carLineX3, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
 const carLineSpacingY2 = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY2 + carDoorHeightPx;
     context.beginPath();
     context.moveTo(carLineX3, horizontalY);
     context.lineTo(carLineX4, horizontalY);
     context.stroke();
 }
  // Draw left and right door frames
  context.fillStyle = 'gray';
  context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Optional: Draw outlines for better visibility
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
  context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

  // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



 // Draw dimension lines for landing door width
 const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
 context.strokeStyle = "Black";
 context.lineWidth = 0.5;

 // Draw line for landing door width
 context.beginPath();
 context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
 context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
 context.stroke();

 // Draw arrows for landing door width
 const arrowSize = 4;
 context.beginPath();
 // Left arrow
 context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX , landingDimensionY);
 context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
 context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
 context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
 context.closePath();
 context.fill();

 context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
     `LandingDoor  ${landingDoorDimensions.width} `,
     landingDoorX + landingDoorWidthPx / 2 ,
     landingDimensionY -40*SCALE_FACTOR )
     context.restore();


 // Draw dimension lines for car door width
 const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
 context.beginPath();
 context.moveTo(carDoorX, carDimensionY);
 context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
 context.stroke();

 // Draw arrows for car door width
 context.beginPath();
 // Left arrow
 context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
 context.lineTo(carDoorX , carDimensionY);
 context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Right arrow
 context.beginPath();
 context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
 context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
 context.closePath();
 context.fill();

 // Add label for car door width
 

 context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
     `CarDoor ${carDoorDimensions.width} `,
     carDoorX + carDoorWidthPx / 2 ,
     carDimensionY -40*SCALE_FACTOR )
     context.restore();


     const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
      const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
      const labelOffset = -5; // Distance from the dimension line to the label
      const fontSize = 72*SCALE_FACTOR;
  
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'black'; // Label color
  
      // **Doorframe Width Dimension**
      const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.beginPath();
      context.moveTo(frameX1, widthDimY); // From the left side of the frame
      context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
      context.stroke();

      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the ends
      context.beginPath();
     
      context.moveTo(frameX1, frameY); // Left side vertical line
      context.lineTo(frameX1, widthDimY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx, widthDimY);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1, widthDimY);
      context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx, widthDimY);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
      context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
      context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
  

      const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
      context.strokeStyle = 'black'; // Dimension line color
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.strokeStyle = 'grey'; // Dimension line color
      context.lineWidth = 0.3;
      // Perpendicular lines at the e
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
      context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
      context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
      context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
      context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
      context.closePath();
      context.fill();
  
      // Label for width
      const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
      context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

      // **Doorframe Height Dimension**
      const heightDimX = frameX1  ; // To the left of the doorframe
      context.beginPath();
      context.moveTo(heightDimX , frameY); // From the top of the frame
      context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
      context.stroke();
  
      // Perpendicular lines at the ends
      context.beginPath();
      context.moveTo(frameX1, frameY); // Top horizontal line
      context.lineTo(heightDimX, frameY);
      context.stroke();
  
      context.beginPath();
      context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
      context.lineTo(heightDimX, frameY + frameHeightPx);
      context.stroke();
  
      // Add arrows
      context.beginPath();
      context.moveTo(heightDimX, frameY);
      context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
      context.closePath();
      context.fill();
  
      context.beginPath();
      context.moveTo(heightDimX, frameY + frameHeightPx);
      context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
      context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
      context.closePath();
      context.fill();
  
      // Label for height
      const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
      const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
      context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
  };
  
  // Usage Example
  drawDoorFrameDimensions(
      context,
      frameX1,
      frameY,
      frameWidthPx,
      frameHeightPx,
      SCALE_FACTOR
  );
  


    
     





  
  
};

const drawDoorsS3L  = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx  - DoorWidthPx/4 + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2 + 52.5*SCALE_FACTOR  - wallOpeningOffset *SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 + 42.5* SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx  -  120 *SCALE_FACTOR;  // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx - DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 + 52.5*SCALE_FACTOR- wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2 +42.5*SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx  -  120 *SCALE_FACTOR;  // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx - DoorWidthPx/4 + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2+ 52.5*SCALE_FACTOR - wallOpeningOffset * SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2+42.5*SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx  -  120 *SCALE_FACTOR;  // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx - DoorWidthPx/4  + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2  + 52.5*SCALE_FACTOR- wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2+42.5*SCALE_FACTOR ;
      frameX1 = landingDoorX + landingDoorWidthPx -DoorWidthPx -frameWidthPx  -  120 *SCALE_FACTOR;  // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }

  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx- verticalOffset* SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;



  // Draw the landing door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Landing door border color
  context.lineWidth = 1;
  context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);

  // Position the car door
 
  const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door

  // Draw the car door
  context.fillStyle = 'white';
  context.strokeStyle = 'black'; // Car door border color
  context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);

  // Calculate positions for the vertical lines with offset
    const distanceBetweenLinesPx = DoorWidthPx /3;
    const landingLineX1 = landingDoorX + landingDoorWidthPx - distanceBetweenLinesPx - 120 *SCALE_FACTOR;
    const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
    const landingLineX3 = landingLineX2 - distanceBetweenLinesPx * 2 ;
    const landingLineX4 = landingLineX3 - distanceBetweenLinesPx;
 
    const carLineX1 = carDoorX + carDoorWidthPx - distanceBetweenLinesPx - 15 * SCALE_FACTOR;
    const carLineX2 = carLineX1 + distanceBetweenLinesPx ;
    const  carLineX3 = carLineX2 - distanceBetweenLinesPx *2 ;
    const carLineX4 = carLineX3 - distanceBetweenLinesPx;


 // Draw vertical lines for landing door
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.beginPath();
 context.moveTo(landingLineX1, landingDoorY); // Left line
 context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx/3);
 context.moveTo(landingLineX2, landingDoorY); // Right line
 context.lineTo(landingLineX2, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX3, landingDoorY); // Right line
 context.lineTo(landingLineX3, landingDoorY + landingDoorHeightPx);
 context.moveTo(landingLineX4, landingDoorY); // Right line
 context.lineTo(landingLineX4, landingDoorY + landingDoorHeightPx);
 context.stroke();

 // Draw vertical lines for car door
 context.beginPath();
 context.moveTo(carLineX1, carDoorY ); // Left line
 context.lineTo(carLineX1, carDoorY  + carDoorHeightPx);
 context.moveTo(carLineX2, carDoorY); // Right line
 context.lineTo(carLineX2, carDoorY + landingDoorHeightPx);
 context.moveTo(carLineX3, carDoorY); // Right line
 context.lineTo(carLineX3, carDoorY + landingDoorHeightPx);
 context.moveTo(carLineX4, carDoorY); // Right line
 context.lineTo(carLineX4, carDoorY + landingDoorHeightPx);



 context.stroke();
 

 // Draw horizontal lines for landing door
 const numberOfHorizontalLines = 4;
 const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1) /3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY + i * landingLineSpacingY;
     context.beginPath();
     context.moveTo(landingLineX2, horizontalY);
     context.lineTo(landingLineX1, horizontalY);
     context.stroke();
 }
 
 const landingLineSpacingY1  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/3 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY1 + landingDoorHeightPx/1.5;
     context.beginPath();
     context.moveTo(landingLineX3, horizontalY);
     context.lineTo(landingLineX1, horizontalY);
     context.stroke();
 }
 const landingLineSpacingY2  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/3 ;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = landingDoorY - i * landingLineSpacingY2 + landingDoorHeightPx ;
     context.beginPath();
     context.moveTo(landingLineX3, horizontalY);
     context.lineTo(landingLineX4, horizontalY);
     context.stroke();
 }

 // Draw horizontal lines for car door
 const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY + i * carLineSpacingY;
     context.beginPath();
     context.moveTo(carLineX3, horizontalY);
     context.lineTo(carLineX4, horizontalY);
     context.stroke();
 }
 const carLineSpacingY1 = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY1 + carDoorHeightPx /1.5;
     context.beginPath();
     context.moveTo(carLineX3, horizontalY);
     context.lineTo(carLineX1, horizontalY);
     context.stroke();
 }
 const carLineSpacingY2 = carDoorHeightPx / (numberOfHorizontalLines + 1)/3;
 for (let i = 1; i <= numberOfHorizontalLines; i++) {
     const horizontalY = carDoorY - i * carLineSpacingY2 + carDoorHeightPx;
     context.beginPath();
     context.moveTo(carLineX1, horizontalY);
     context.lineTo(carLineX2, horizontalY);
     context.stroke();
 }
 // Draw left and right door frames
 context.fillStyle = 'gray';
 context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
 context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);

 // Optional: Draw outlines for better visibility
 context.strokeStyle = 'black';
 context.lineWidth = 1;
 context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
 context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);

 // Wall openings beside the door frames
context.strokeStyle = 'black'; // Choose a color for the wall openings
context.lineWidth = 2;

// Left wall opening beside frameX1
context.beginPath();
context.moveTo(frameX1, frameY1);
context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
context.stroke();

// Right wall opening beside frameX2
context.beginPath();
context.moveTo(frameX2 + frameWidthPx , frameY1);
context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
context.stroke();
// Draw dimension lines for left and right wall openings



// Draw dimension lines for landing door width
const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
context.strokeStyle = "Black";
context.lineWidth = 0.5;

// Draw line for landing door width
context.beginPath();
context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
context.stroke();

// Draw arrows for landing door width
const arrowSize = 4;
context.beginPath();
// Left arrow
context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
context.lineTo(landingDoorX , landingDimensionY);
context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
context.closePath();
context.fill();

context.save();
 context.fillStyle = 'black';
 context.textAlign = 'center';
 context.textBaseline = 'middle';
 context.fillText(
    `LandingDoor  ${landingDoorDimensions.width} `,
    landingDoorX + landingDoorWidthPx / 2 ,
    landingDimensionY -40*SCALE_FACTOR )
    context.restore();


// Draw dimension lines for car door width
const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
context.beginPath();
context.moveTo(carDoorX, carDimensionY);
context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
context.stroke();

// Draw arrows for car door width
context.beginPath();
// Left arrow
context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
context.lineTo(carDoorX , carDimensionY);
context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
context.closePath();
context.fill();

// Add label for car door width


context.save();
context.fillStyle = 'black';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
    `CarDoor ${carDoorDimensions.width} `,
    carDoorX + carDoorWidthPx / 2 ,
    carDimensionY -40*SCALE_FACTOR )
    context.restore();


    const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
     const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
     const labelOffset = -5; // Distance from the dimension line to the label
     const fontSize = 72*SCALE_FACTOR;
 
     context.strokeStyle = 'black'; // Dimension line color
     context.lineWidth = 1;
     context.font = `${fontSize}px Arial`;
     context.fillStyle = 'black'; // Label color
 
     // **Doorframe Width Dimension**
     const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
     context.beginPath();
     context.moveTo(frameX1, widthDimY); // From the left side of the frame
     context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
     context.stroke();

     context.strokeStyle = 'grey'; // Dimension line color
     context.lineWidth = 0.3;
     // Perpendicular lines at the ends
     context.beginPath();
    
     context.moveTo(frameX1, frameY); // Left side vertical line
     context.lineTo(frameX1, widthDimY);
     context.stroke();
 
     context.beginPath();
     context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
     context.lineTo(frameX1 + frameWidthPx, widthDimY);
     context.stroke();
 
     // Add arrows
     context.beginPath();
     context.moveTo(frameX1, widthDimY);
     context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
     context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
     context.closePath();
     context.fill();
 
     context.beginPath();
     context.moveTo(frameX1 + frameWidthPx, widthDimY);
     context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
     context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
     context.closePath();
     context.fill();
 
     // Label for width
     const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
     const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
     context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
 

     const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
     context.strokeStyle = 'black'; // Dimension line color
     context.lineWidth = 1;
     context.beginPath();
     context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
     context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
     context.stroke();
 
     // Perpendicular lines at the ends
     context.strokeStyle = 'grey'; // Dimension line color
     context.lineWidth = 0.3;
     // Perpendicular lines at the e
     context.beginPath();
     context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
     context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
     context.stroke();
 
     context.beginPath();
     context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
     context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
     context.stroke();
 
     // Add arrows
     context.beginPath();
     context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
     context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
     context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
     context.closePath();
     context.fill();
 
     context.beginPath();
     context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
     context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
     context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
     context.closePath();
     context.fill();
 
     // Label for width
     const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
     const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
     context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);

     // **Doorframe Height Dimension**
     const heightDimX = frameX1  ; // To the left of the doorframe
     context.beginPath();
     context.moveTo(heightDimX , frameY); // From the top of the frame
     context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
     context.stroke();
 
     // Perpendicular lines at the ends
     context.beginPath();
     context.moveTo(frameX1, frameY); // Top horizontal line
     context.lineTo(heightDimX, frameY);
     context.stroke();
 
     context.beginPath();
     context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
     context.lineTo(heightDimX, frameY + frameHeightPx);
     context.stroke();
 
     // Add arrows
     context.beginPath();
     context.moveTo(heightDimX, frameY);
     context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
     context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
     context.closePath();
     context.fill();
 
     context.beginPath();
     context.moveTo(heightDimX, frameY + frameHeightPx);
     context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
     context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
     context.closePath();
     context.fill();
 
     // Label for height
     const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
     const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
     context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
 };
 
 // Usage Example
 drawDoorFrameDimensions(
     context,
     frameX1,
     frameY,
     frameWidthPx,
     frameHeightPx,
     SCALE_FACTOR
 );
 


   
    





 
 
};
const drawDoorsS4C  = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
  // Convert dimensions and offsets to pixels
  const landingDoorWidthPx = landingDoorDimensions.width * SCALE_FACTOR;
  const landingDoorHeightPx = landingDoorDimensions.height * SCALE_FACTOR;
  const carDoorWidthPx = carDoorDimensions.width * SCALE_FACTOR;
  const carDoorHeightPx = carDoorDimensions.height * SCALE_FACTOR;
  const doorGapPx = doorGap * SCALE_FACTOR;
  const DoorWidthPx = DoorDimensions.width * SCALE_FACTOR;
  const frameWidthPx = doorFrameSettings.width * SCALE_FACTOR;
  const frameHeightPx = doorFrameSettings.height * SCALE_FACTOR;

  // Cabin settings in pixels
  const railWallDistancePx = cabinSettings.railDistance * SCALE_FACTOR;
  const rightDistancePx = cabinSettings.rightDistance * SCALE_FACTOR;
  const leftDistancePx = cabinSettings.leftDistance * SCALE_FACTOR;


  let landingDoorX, carDoorX , frameX1 , frameX2;

  switch (tShapeSettings.selectedWall) {
    case 'left':
      carDoorX= startX + railWallDistancePx  + (cabinWidthPx - railWallDistancePx - rightDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
      frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx  ; // Right frame
      
      break;
    case 'right':
      carDoorX = startX + leftDistancePx  + (cabinWidthPx - leftDistancePx - railWallDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
      frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx  ; // Right frame
      break;
    case 'rear':
      carDoorX = startX + leftDistancePx + (cabinWidthPx - leftDistancePx - rightDistancePx - carDoorWidthPx) / 2 - wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
      frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx  ; // Right frame
      break;
    case 'left & right':
      carDoorX = startX + railWallDistancePx + (cabinWidthPx - railWallDistancePx * 2 - carDoorWidthPx) / 2 - wallOpeningOffset* SCALE_FACTOR;
      landingDoorX = carDoorX - (landingDoorWidthPx - carDoorWidthPx) / 2;
      frameX1 = landingDoorX + landingDoorWidthPx/2 - frameWidthPx- DoorWidthPx/2 ; // Left frame
      frameX2 = frameX1 + frameWidthPx  +  DoorWidthPx  ; // Right frame
      break;
    default:
      console.warn('Unsupported wall selection for S2C doors alignment.');
      return;
  }

  const landingDoorY = startY + cabinDepthPx - landingDoorHeightPx- verticalOffset* SCALE_FACTOR;
  let frameY = startY + cabinDepthPx - verticalOffset * SCALE_FACTOR;
  let frameY1 = startY + cabinDepthPx;

    // Draw the landing door
    context.fillStyle = 'white';
    context.strokeStyle = 'black'; // Landing door border color
    context.lineWidth = 1;
    context.fillRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
    context.strokeRect(landingDoorX, landingDoorY, landingDoorWidthPx, landingDoorHeightPx);
  
    // Position the car door
  
    const carDoorY = landingDoorY - doorGapPx - carDoorHeightPx; // Place above landing door
  
    // Draw the car door
    context.fillStyle = 'white';
    context.strokeStyle = 'black'; // Car door border color
    context.fillRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
    context.strokeRect(carDoorX, carDoorY, carDoorWidthPx, carDoorHeightPx);
  
    // Calculate positions for the vertical lines with offset
      const distanceBetweenLinesPx = DoorWidthPx /4;
      const landingLineX1 = landingDoorX + landingDoorWidthPx /2 + distanceBetweenLinesPx ;
      const landingLineX2 = landingLineX1 + distanceBetweenLinesPx;
      const landingLineX3 = landingLineX2 - distanceBetweenLinesPx * 2 ;
      const landingLineX4 = landingLineX3 - distanceBetweenLinesPx;
      const landingLineX5 = landingLineX4 - distanceBetweenLinesPx;
      
   
      const carLineX1 = carDoorX + carDoorWidthPx/2 +distanceBetweenLinesPx;
      const carLineX2 = carLineX1 + distanceBetweenLinesPx ;
      const  carLineX3 = carLineX2 - distanceBetweenLinesPx *2 ;
      const carLineX4 = carLineX3 - distanceBetweenLinesPx;
      const carLineX5 = carLineX4 - distanceBetweenLinesPx;
  
  
   // Draw vertical lines for landing door
   context.strokeStyle = 'black';
   context.lineWidth = 1;
   context.beginPath();
   context.moveTo(landingLineX1, landingDoorY); // Left line
   context.lineTo(landingLineX1, landingDoorY + landingDoorHeightPx);
   context.moveTo(landingLineX2, landingDoorY); // Right line
   context.lineTo(landingLineX2, landingDoorY+ landingDoorHeightPx );
   context.moveTo(landingLineX3, landingDoorY); // Right line
   context.lineTo(landingLineX3, landingDoorY + landingDoorHeightPx);
   context.moveTo(landingLineX4, landingDoorY); // Right line
   context.lineTo(landingLineX4, landingDoorY + landingDoorHeightPx);
   context.moveTo(landingLineX5, landingDoorY); // Right line
   context.lineTo(landingLineX5, landingDoorY + landingDoorHeightPx);
   context.stroke();
   context.stroke();
  
   // Draw vertical lines for car door
   context.beginPath();
   context.moveTo(carLineX1, carDoorY ); // Left line
   context.lineTo(carLineX1, carDoorY + carDoorHeightPx );
   context.moveTo(carLineX2, carDoorY); // Right line
   context.lineTo(carLineX2, carDoorY+ carDoorHeightPx );
   context.moveTo(carLineX3, carDoorY); // Right line
   context.lineTo(carLineX3, carDoorY+ carDoorHeightPx );
   context.moveTo(carLineX4, carDoorY); // Right line
   context.lineTo(carLineX4, carDoorY+ carDoorHeightPx );
   context.moveTo(carLineX5, carDoorY); // Right line
   context.lineTo(carLineX5, carDoorY + carDoorHeightPx);
   
  
  
  
   context.stroke();
   
  
   // Draw horizontal lines for landing door
   const numberOfHorizontalLines = 4;
   const landingLineSpacingY = landingDoorHeightPx / (numberOfHorizontalLines + 1) /2;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = landingDoorY + i * landingLineSpacingY+ landingDoorHeightPx/2 ;
       context.beginPath();
       context.moveTo(landingLineX2, horizontalY);
       context.lineTo(landingLineX1, horizontalY);
       context.stroke();
   }
   
   const landingLineSpacingY1  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/2 ;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = landingDoorY - i * landingLineSpacingY1 + landingDoorHeightPx/2;
       context.beginPath();
       context.moveTo(landingLineX3, horizontalY);
       context.lineTo(landingLineX1, horizontalY);
       context.stroke();
   }
   const landingLineSpacingY2  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/2 ;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = landingDoorY - i * landingLineSpacingY2 + landingDoorHeightPx/2 ;
       context.beginPath();
       context.moveTo(landingLineX3, horizontalY);
       context.lineTo(landingLineX4, horizontalY);
       context.stroke();
   }
   const landingLineSpacingY3  = (landingDoorHeightPx) / (numberOfHorizontalLines + 1)/2 ;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = landingDoorY - i * landingLineSpacingY3 + landingDoorHeightPx ;
       context.beginPath();
       context.moveTo(landingLineX5, horizontalY);
       context.lineTo(landingLineX4, horizontalY);
       context.stroke();
   }
  
   // Draw horizontal lines for car door
   const carLineSpacingY = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = carDoorY + i * carLineSpacingY  ;
       context.beginPath();
       context.moveTo(carLineX4, horizontalY);
       context.lineTo(carLineX5, horizontalY);
       context.stroke();
   }
   const carLineSpacingY1 = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = carDoorY - i * carLineSpacingY1 + carDoorHeightPx ;
       context.beginPath();
       context.moveTo(carLineX3, horizontalY);
       context.lineTo(carLineX1, horizontalY);
       context.stroke();
   }
   const carLineSpacingY2 = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = carDoorY - i * carLineSpacingY2 + carDoorHeightPx/2;
       context.beginPath();
       context.moveTo(carLineX1, horizontalY);
       context.lineTo(carLineX2, horizontalY);
       context.stroke();
   }
   const carLineSpacingY3 = carDoorHeightPx / (numberOfHorizontalLines + 1)/2;
   for (let i = 1; i <= numberOfHorizontalLines; i++) {
       const horizontalY = carDoorY - i * carLineSpacingY3 + carDoorHeightPx;
       context.beginPath();
       context.moveTo(carLineX3, horizontalY);
       context.lineTo(carLineX4, horizontalY);
       context.stroke();
   }
   // Draw left and right door frames
   context.fillStyle = 'gray';
   context.fillRect(frameX1, frameY, frameWidthPx, frameHeightPx);
   context.fillRect(frameX2, frameY, frameWidthPx, frameHeightPx);
 
   // Optional: Draw outlines for better visibility
   context.strokeStyle = 'black';
   context.lineWidth = 1;
   context.strokeRect(frameX1, frameY, frameWidthPx, frameHeightPx);
   context.strokeRect(frameX2, frameY, frameWidthPx, frameHeightPx);
 
   // Wall openings beside the door frames
 context.strokeStyle = 'black'; // Choose a color for the wall openings
 context.lineWidth = 2;
 
 // Left wall opening beside frameX1
 context.beginPath();
 context.moveTo(frameX1, frameY1);
 context.lineTo(frameX1 , frameY1 + wallThickness.front *SCALE_FACTOR);
 context.stroke();
 
 // Right wall opening beside frameX2
 context.beginPath();
 context.moveTo(frameX2 + frameWidthPx , frameY1);
 context.lineTo(frameX2+ frameWidthPx , frameY1 +  wallThickness.front *SCALE_FACTOR);
 context.stroke();
 // Draw dimension lines for left and right wall openings
 
 
 
  // Draw dimension lines for landing door width
  const landingDimensionY = landingDoorY + landingDoorHeightPx + wallThickness.front* SCALE_FACTOR +400* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the landing door
  context.strokeStyle = "Black";
  context.lineWidth = 0.5;
 
  // Draw line for landing door width
  context.beginPath();
  context.moveTo(landingDoorX, landingDimensionY); // Start from the left edge
  context.lineTo(landingDoorX + landingDoorWidthPx, landingDimensionY); // End at the right edge
  context.stroke();
 
  // Draw arrows for landing door width
  const arrowSize = 4;
  context.beginPath();
  // Left arrow
  context.moveTo(landingDoorX+ arrowSize, landingDimensionY - arrowSize);
  context.lineTo(landingDoorX , landingDimensionY);
  context.lineTo(landingDoorX+arrowSize, landingDimensionY + arrowSize);
  context.closePath();
  context.fill();
 
  // Right arrow
  context.beginPath();
  context.moveTo(landingDoorX - arrowSize + landingDoorWidthPx, landingDimensionY - arrowSize);
  context.lineTo(landingDoorX -arrowSize+ landingDoorWidthPx + arrowSize, landingDimensionY);
  context.lineTo(landingDoorX-arrowSize + landingDoorWidthPx, landingDimensionY + arrowSize);
  context.closePath();
  context.fill();
 
  context.save();
   context.fillStyle = 'black';
   context.textAlign = 'center';
   context.textBaseline = 'middle';
   context.fillText(
      `LandingDoor  ${landingDoorDimensions.width} `,
      landingDoorX + landingDoorWidthPx / 2 ,
      landingDimensionY -40*SCALE_FACTOR )
      context.restore();
 
 
  // Draw dimension lines for car door width
  const carDimensionY = carDoorY + carDoorHeightPx + doorGapPx+ landingDoorHeightPx + wallThickness.front *SCALE_FACTOR + 275* SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Above the car door
  context.beginPath();
  context.moveTo(carDoorX, carDimensionY);
  context.lineTo(carDoorX + carDoorWidthPx, carDimensionY);
  context.stroke();
 
  // Draw arrows for car door width
  context.beginPath();
  // Left arrow
  context.moveTo(carDoorX+arrowSize, carDimensionY - arrowSize);
  context.lineTo(carDoorX , carDimensionY);
  context.lineTo(carDoorX+ arrowSize, carDimensionY + arrowSize);
  context.closePath();
  context.fill();
 
  // Right arrow
  context.beginPath();
  context.moveTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY - arrowSize);
  context.lineTo(carDoorX -arrowSize+ carDoorWidthPx + arrowSize, carDimensionY);
  context.lineTo(carDoorX -arrowSize+ carDoorWidthPx, carDimensionY + arrowSize);
  context.closePath();
  context.fill();
 
  // Add label for car door width
  
 
  context.save();
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
      `CarDoor ${carDoorDimensions.width} `,
      carDoorX + carDoorWidthPx / 2 ,
      carDimensionY -40*SCALE_FACTOR )
      context.restore();
 
 
      const drawDoorFrameDimensions = (context, frameX1, frameY, frameWidthPx, frameHeightPx, SCALE_FACTOR) => {
       const arrowSize = 18 *SCALE_FACTOR;// Size of the arrowheads
       const labelOffset = -5; // Distance from the dimension line to the label
       const fontSize = 72*SCALE_FACTOR;
   
       context.strokeStyle = 'black'; // Dimension line color
       context.lineWidth = 1;
       context.font = `${fontSize}px Arial`;
       context.fillStyle = 'black'; // Label color
   
       // **Doorframe Width Dimension**
       const widthDimY = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
       context.beginPath();
       context.moveTo(frameX1, widthDimY); // From the left side of the frame
       context.lineTo(frameX1 + frameWidthPx, widthDimY); // To the right side of the frame
       context.stroke();
 
       context.strokeStyle = 'grey'; // Dimension line color
       context.lineWidth = 0.3;
       // Perpendicular lines at the ends
       context.beginPath();
      
       context.moveTo(frameX1, frameY); // Left side vertical line
       context.lineTo(frameX1, widthDimY);
       context.stroke();
   
       context.beginPath();
       context.moveTo(frameX1 + frameWidthPx, frameY); // Right side vertical line
       context.lineTo(frameX1 + frameWidthPx, widthDimY);
       context.stroke();
   
       // Add arrows
       context.beginPath();
       context.moveTo(frameX1, widthDimY);
       context.lineTo(frameX1 + arrowSize, widthDimY - arrowSize);
       context.lineTo(frameX1 + arrowSize, widthDimY + arrowSize);
       context.closePath();
       context.fill();
   
       context.beginPath();
       context.moveTo(frameX1 + frameWidthPx, widthDimY);
       context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY - arrowSize);
       context.lineTo(frameX1 + frameWidthPx - arrowSize, widthDimY + arrowSize);
       context.closePath();
       context.fill();
   
       // Label for width
       const frameWidth = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
       const widthLabelX = frameX1 + frameWidthPx / 2; // Midpoint of the width
       context.fillText(`${frameWidth} `, widthLabelX - fontSize, widthDimY + labelOffset);
   
 
       const widthDimY1 = frameY + wallThickness.front*SCALE_FACTOR + 150*SCALE_FACTOR + verticalOffset*SCALE_FACTOR; // Below the doorframe
       context.strokeStyle = 'black'; // Dimension line color
       context.lineWidth = 1;
       context.beginPath();
       context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1); // From the left side of the frame
       context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx *2, widthDimY1); // To the right side of the frame
       context.stroke();
   
       // Perpendicular lines at the ends
       context.strokeStyle = 'grey'; // Dimension line color
       context.lineWidth = 0.3;
       // Perpendicular lines at the e
       context.beginPath();
       context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, frameY); // Left side vertical line
       context.lineTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY1);
       context.stroke();
   
       context.beginPath();
       context.moveTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, frameY); // Right side vertical line
       context.lineTo(frameX1 + frameWidthPx+ DoorWidthPx+ frameWidthPx, widthDimY1);
       context.stroke();
   
       // Add arrows
       context.beginPath();
       context.moveTo(frameX1+ DoorWidthPx+ frameWidthPx, widthDimY);
       context.lineTo(frameX1+ DoorWidthPx + frameWidthPx+ arrowSize, widthDimY1 - arrowSize);
       context.lineTo(frameX1 + DoorWidthPx+ frameWidthPx+ arrowSize, widthDimY1 + arrowSize);
       context.closePath();
       context.fill();
   
       context.beginPath();
       context.moveTo(frameX1 + frameWidthPx+ frameWidthPx+ DoorWidthPx, widthDimY1);
       context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 - arrowSize);
       context.lineTo(frameX1 + frameWidthPx + frameWidthPx+ DoorWidthPx- arrowSize, widthDimY1 + arrowSize);
       context.closePath();
       context.fill();
   
       // Label for width
       const frameWidth1 = (frameWidthPx / SCALE_FACTOR).toFixed(0); // Convert to mm
       const widthLabelX2 = frameX1  + frameWidthPx / 2 + DoorWidthPx + frameWidthPx; // Midpoint of the width
       context.fillText(`${frameWidth1} `, widthLabelX2 - fontSize, widthDimY1 + labelOffset);
 
       // **Doorframe Height Dimension**
       const heightDimX = frameX1  ; // To the left of the doorframe
       context.beginPath();
       context.moveTo(heightDimX , frameY); // From the top of the frame
       context.lineTo(heightDimX, frameY + frameHeightPx); // To the bottom of the frame
       context.stroke();
   
       // Perpendicular lines at the ends
       context.beginPath();
       context.moveTo(frameX1, frameY); // Top horizontal line
       context.lineTo(heightDimX, frameY);
       context.stroke();
   
       context.beginPath();
       context.moveTo(frameX1, frameY + frameHeightPx); // Bottom horizontal line
       context.lineTo(heightDimX, frameY + frameHeightPx);
       context.stroke();
   
       // Add arrows
       context.beginPath();
       context.moveTo(heightDimX, frameY);
       context.lineTo(heightDimX - arrowSize, frameY + arrowSize);
       context.lineTo(heightDimX + arrowSize, frameY + arrowSize);
       context.closePath();
       context.fill();
   
       context.beginPath();
       context.moveTo(heightDimX, frameY + frameHeightPx);
       context.lineTo(heightDimX - arrowSize, frameY + frameHeightPx - arrowSize);
       context.lineTo(heightDimX + arrowSize, frameY + frameHeightPx - arrowSize);
       context.closePath();
       context.fill();
   
       // Label for height
       const frameHeight = (frameHeightPx / SCALE_FACTOR).toFixed(0); // Convert to mm
       const heightLabelY = frameY + frameHeightPx / 2; // Midpoint of the height
       context.fillText(`${frameHeight} mm`, heightDimX - 3 * fontSize, heightLabelY + fontSize / 2);
   };
   
   // Usage Example
   drawDoorFrameDimensions(
       context,
       frameX1,
       frameY,
       frameWidthPx,
       frameHeightPx,
       SCALE_FACTOR
   );
   
 

     
      
 
 
 
 
 
   
   
 };


 const handleShaftChange = (e) => {
  const { name, value } = e.target;
    setShaftDimensions((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };
   // Update scale when the user changes it
   const handleScaleChange = (event) => {
    setSelectedScale(parseFloat(event.target.value));
  };
  const handleWidthChange = (event) => {
    const newWidth = parseInt(event.target.value, 10);
    setDoorDimensions((prev) => ({
      ...prev,
      width: newWidth,
    }));
  };
  const handleTShapeSetting = () => {
    setTShapeSettings((prevSettings) => ({
      ...prevSettings,
      selectedWall: ['left & right'] // Add both walls for T-shape
    }));
  };
  const handleClick = (event) => {
    console.log(`Input clicked: ${event.target.name}`);
    // Add other actions here
};
  const handleDoorFrameChange = (e) => {
    const { name, value } = e.target;
    setDoorFrameSettings((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };
  const handleWallThicknessChange = (e) => {
    const { name, value } = e.target;
    setWallThickness((prev) => ({
        ...prev,
        [name]: parseFloat(value),  // Update the thickness for the specific wall
    }));
  };
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom * 1.2, 5)); // Limit max zoom
  };
  
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom / 1.2, 0.5)); // Limit min zoom
  };
  
  

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) {
    drawShaft(context);
    context.restore(); 
    }
  
  }, [canvasRef,drawShaft, tShapeSettings, bracketsSettings ,zoomLevel , cabinSettings ]);
  

  useEffect(() => {
    if (!tShapeSettings.selectedWall) {
      console.warn('No wall selected! Defaulting to "left".');
      setTShapeSettings((prev) => ({ ...prev, selectedWall: 'left' })); // Default to left wall
    }
  }, []);
  

useEffect(() => {
  const dimensions = doorDimensionsLibrary[selectedDoorType]?.[DoorDimensions.width];

  if (dimensions) {
    setLandingDoorDimensions({
      width: dimensions.landingDoorWidth,
      height: dimensions.landingDoorHeight,
    });

    setCarDoorDimensions({
      width: dimensions.carDoorWidth,
      height: dimensions.carDoorHeight,
    });
  }
}, [selectedDoorType, DoorDimensions.width]);
 

  return (
    <div>
      <h1>Shaft Design</h1>
   
    <canvas ref={canvasRef} width={800} height={800} style={{ border: '1px solid black' }} />
    <div>

    </div>
  <label htmlFor="scale-select">Select Scale:</label>
<select id="scale-select" value={selectedScale} onChange={handleScaleChange}>
  <option value={1 / 10}>1:10</option>
  <option value={1 / 15}>1:15</option>
  <option value={1 / 20}>1:20</option>
  <option value={1 / 25}>1:25</option>
  <option value={1 / 30}>1:30</option>
  <option value={1 / 40}>1:40</option>
  <option value={1 / 50}>1:50</option>
</select>

  <button onClick={handleZoomIn} >Zoom In</button>
  <button onClick={handleZoomOut} >Zoom Out</button>

  {/* PDF Download Button */}
<button onClick={downloadPDF}>Download PDF</button>









  
<div>
        


  <h3> Shaft Settings</h3>
  <label>
Inner Shaft Width:
<input
type="number"
name="innerWidth"
value={shaftDimensions.innerWidth}
onChange={handleShaftChange}
/>
</label>
  <label>
Inner Shaft Depth:
<input
type="number"
name="innerDepth"
value={shaftDimensions.innerDepth}
onChange={handleShaftChange}
/>
</label>

<div>
    <label>
        Rear Wall Thickness:
        <input
            type="number"
            name="rear"
            value={wallThickness.rear}
            onChange={handleWallThicknessChange}
        />
    </label>
    <label>
        Front Wall Thickness:
        <input
            type="number"
            name="front"
            value={wallThickness.front}
            onChange={handleWallThicknessChange}
        />
    </label>
    <label>
        Left Wall Thickness:
        <input
            type="number"
            name="left"
            value={wallThickness.left}
            onChange={handleWallThicknessChange}
        />
    </label>
    <label>
        Right Wall Thickness:
        <input
            type="number"
            name="right"
            value={wallThickness.right}
            onChange={handleWallThicknessChange}
        />
    </label>
</div>

<h3>Door Settings</h3>
<label htmlFor="doorType">Select Door Type:</label>
<select
id="doorType"
value={selectedDoorType}
onChange={(e) => setSelectedDoorType(e.target.value)}
>
<option value="S1L">S1L</option>
<option value="S1R">S1R</option>
<option value="S2C">S2C </option>
<option value="S2L">S2L</option>
<option value="S2R">S2R</option>
<option value="S3L">S3L</option>
<option value="S3R">S3R</option>
<option value="S4C">S4C</option>
</select>



      <label htmlFor="doorWidth">Select Door Width:</label>
      <select
    name="selectedDoorWidth"
    value={DoorDimensions.width}
    onClick={handleClick}
    onChange={(e) => setDoorDimensions({ ...DoorDimensions, width: parseInt(e.target.value, 10) })}
>
    {doorWidths.map((width) => (
        <option key={width} value={width}>
            {width} 
        </option>
    ))}
</select>
    
  
<label>
  Gap Between Doors :
  <input
    type="number"
    name="doorGap"
    value={doorGap}
    onChange={(e) => setDoorGap(parseInt(e.target.value, 10))}
  />
</label>
<label>
  Car Door Jamb :
  <input
    type="number"
    name="carDoorJamb"
    value={carDoorjamb}
    onChange={(e) => setCarDoorJamb(parseInt(e.target.value, 10))}
  />
</label>
<label>
    Wall Opening Offset :
    <input
        type="text"
        name="wallOpeningOffset"
        value={wallOpeningOffset}
        onChange={(e) => {
            const value = e.target.value.trim();
            if (/^[-+]?\d*$/.test(value)) { 
                setWallOpeningOffset(value);
            }
        }}
        onBlur={() => {
            if (wallOpeningOffset === "+" || wallOpeningOffset === "-") {
                setWallOpeningOffset(""); // Reset if only sign is entered
            } else if (!isNaN(parseInt(wallOpeningOffset, 10))) {
                setWallOpeningOffset(parseInt(wallOpeningOffset, 10)); // Convert to number on blur
            }
        }}
    />
</label>




<h3>Cabin Settings</h3>

<div>
    {/* Only show Left Wall Distance if the rails are not on the left */}
    {tShapeSettings.selectedWall !== 'left' && (
        <label>
            Left Wall Distance:
            <input
                type="number"
                name="leftDistance"
                value={cabinSettings.leftDistance}
                onChange={(e) => setCabinSettings((prev) => ({ ...prev, leftDistance: parseFloat(e.target.value) }))}
            />
        </label>
    )}

    {/* Only show Right Wall Distance if the rails are not on the right */}
    {tShapeSettings.selectedWall !== 'right' && (
        <label>
            Right Wall Distance:
            <input
                type="number"
                name="rightDistance"
                value={cabinSettings.rightDistance}
                onChange={(e) => setCabinSettings((prev) => ({ ...prev, rightDistance: parseFloat(e.target.value) }))}
            />
        </label>
    )}

    {/* Only show Rear Wall Distance if the rails are not on the rear */}
    {tShapeSettings.selectedWall !== 'rear' && (
        <label>
            Rear Wall Distance:
            <input
                type="number"
                name="rearDistance"
                value={cabinSettings.rearDistance}
                onChange={(e) => setCabinSettings((prev) => ({ ...prev, rearDistance: parseFloat(e.target.value) }))}
            />
        </label>
    )}

    {/* Rail Wall Distance - always shown since it's the primary distance setting */}
    <label>
        Rail Wall Distance:
        <input
            type="number"
            name="railDistance"
            value={cabinSettings.railDistance}
            onChange={(e) => setCabinSettings((prev) => ({ ...prev, railDistance: parseFloat(e.target.value) }))}
        />
    </label>
</div>
<h3>Door frame Settings</h3>


  <label>Door Frame Width:</label>
  <input
    type="number"
    value={doorFrameSettings.width}
    onChange={(e) =>
      setDoorFrameSettings((prev) => ({ ...prev, width: parseFloat(e.target.value) }))
    }
  />
  
  <label>Door Frame Height:</label>
  <input
    type="number"
    value={doorFrameSettings.height}
    onChange={(e) =>
      setDoorFrameSettings((prev) => ({ ...prev, height: parseFloat(e.target.value) }))
    }
  />

<label>Vertical Offset (mm):
  <input
    type="text"
    value={verticalOffset}
    onChange={(e) => {
      const value = e.target.value.trim();
      if (/^[-+]?\d*$/.test(value)) { 
        setVerticalOffset(value);
      }
    }}
    onBlur={() => {
      if (verticalOffset === "+" || verticalOffset === "-") {
        setVerticalOffset(""); // Reset if only sign is entered
      } else if (!isNaN(parseInt(verticalOffset, 10))) {
        setVerticalOffset(parseInt(verticalOffset, 10)); // Convert to number on blur
      }
    }}
  />
</label>

<h3>Bracket Settings</h3>
<label>
  Bracket Height:
  <input
    type="number"
    name="width"
    value={bracketsSettings.width}
    onChange={(e) => setBracketsSettings({ ...bracketsSettings, width: parseInt(e.target.value, 10) })}
  />
</label>


  

   
{/* Show Horizontal Offset only when rear wall is selected */}
{tShapeSettings.selectedWall === 'rear' && (
  <label>
    Horizontal Offset:
    <input
      type="text"
      value={horizontalOffsetX } // Prevents NaN
      onChange={(e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
          setHorizontalOffsetX(value) ;
        }
      }}
      onBlur={() => {
        if (horizontalOffsetX === "+" || horizontalOffsetX === "-") {
          setHorizontalOffsetX(""); // Reset if only sign is entered
        } else if (!isNaN(parseInt(horizontalOffsetX, 10))) {
          setHorizontalOffsetX(parseInt(horizontalOffsetX, 10)); // Convert to number on blur
        }
      }}
      
    />
  </label>
)}

{/* Show Vertical Offset when left, right, or left & right wall is selected */}
{['left', 'right', 'left & right'].includes(tShapeSettings.selectedWall) && (
  <label>
    Vertical Offset:
    <input
      type="text"
      value={verticalOffsetY } // Prevents NaN
      onChange={(e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
          setVerticalOffsetY(value);
        }
      }}
      onBlur={() => {
        if (verticalOffsetY === "+" || verticalOffsetY === "-") {
          setVerticalOffsetY(""); // Reset if only sign is entered
        } else if (!isNaN(parseInt(verticalOffsetY, 10))) {
          setVerticalOffsetY(parseInt(verticalOffsetY, 10)); // Convert to number on blur
        }
      }}
    />
  </label>
)}


         <h3>Guide Rail Settings</h3>
         <label htmlFor="rail-type">Select T-Shaped Rail:</label>
<select
  id="rail-type"
  value={selectedRailType}
  onChange={(e) => setSelectedRailType(e.target.value)}
>
  {Object.keys(T_SHAPE_RAIL_OPTIONS).map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>

          <label>
  Rail Distance :
  <input
    type="number"
    name="railDistance"
    value={tShapeSettings.railDistance}
    onChange={(e) =>
      setTShapeSettings((prev) => ({ ...prev, railDistance: parseInt(e.target.value, 10) }))
    }
  />
</label>

<label>
  Wall:
  <select
    name="selectedWall"
    value={tShapeSettings.selectedWall}
    onChange={(e) => {
      const selectedWall = e.target.value;

      setTShapeSettings((prev) => ({
        ...prev,
        selectedWall,
        offsetX:
          selectedWall === 'left' ? 150 :
          selectedWall === 'right' ? -150 : 0,
        offsetY: selectedWall === 'rear' ? 150 : 0,
        leftOffsetX: selectedWall === 'left & right' ? 150 : 0,
        rightOffsetX: selectedWall === 'left & right' ? -150 : 0,
      }));

      setBracketsSettings((prev) => ({
        ...prev,
        selectedWall,
      }));
    }}
  >
    <option value="left">Left</option>
    <option value="right">Right</option>
    <option value="rear">Rear</option>
    <option value="left & right">Left & Right</option>
  </select>
</label>

{/* Horizontal Offset for Left/Right Walls */}
{(tShapeSettings.selectedWall === 'left' || tShapeSettings.selectedWall === 'right') && (
  <label>
    Horizontal Offset:
    <input
      type="number"
      name="offsetX"
      value={Math.abs(tShapeSettings.offsetX)} // Display absolute value
      onChange={(e) => {
        const newValue = parseInt(e.target.value, 10) || 0; // Default to 0 if NaN
        setTShapeSettings((prev) => ({
          ...prev,
          offsetX: prev.selectedWall === 'right' ? -newValue : newValue, // Negative for 'right'
        }));
      }}
    />
  </label>
)}

{/* Horizontal Offsets for Left & Right Walls */}
{tShapeSettings.selectedWall === 'left & right' && (
  <div>
    <label>
      Left Horizontal Offset:
      <input
        type="number"
        name="leftOffsetX"
        value={Math.abs(tShapeSettings.leftOffsetX)} // Display absolute value
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10) || 0; // Default to 0 if NaN
          setTShapeSettings((prev) => ({
            ...prev,
            leftOffsetX: newValue,
          }));
        }}
      />
    </label>
    <label>
      Right Horizontal Offset:
      <input
        type="number"
        name="rightOffsetX"
        value={Math.abs(tShapeSettings.rightOffsetX)} // Display absolute value
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10) || 0; // Default to 0 if NaN
          setTShapeSettings((prev) => ({
            ...prev,
            rightOffsetX: -newValue, // Negative for 'right'
          }));
        }}
      />
    </label>
  </div>
)}

{/* Vertical Offset for Rear Wall */}
{tShapeSettings.selectedWall === 'rear' && (
  <label>
    Vertical Offset:
    <input
      type="number"
      name="offsetY"
      value={tShapeSettings.offsetY}
      onChange={(e) => {
        const newValue = parseInt(e.target.value, 10) || 0; // Default to 0 if NaN
        setTShapeSettings((prev) => ({
          ...prev,
          offsetY: newValue,
          offsetX: 0, // Reset horizontal offset for rear wall
        }));
      }}
    />
  </label>
)}

</div> 
      </div> 
  );
};
export default Hydraulic;
