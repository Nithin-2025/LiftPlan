
import React, { useEffect, useRef, useCallback, useState } from 'react';
import doorDimensionsLibrary from './doorDimensionsLibrary';

const T_SHAPE_RAIL_OPTIONS = {
  "standard 9mm": { width: 65, height: 70, widthThickness: 9, heightThickness: 9 },
  "standard 16mm": { width: 70, height: 75, widthThickness: 16, heightThickness: 16 },
  "Monteferro 9mm": { width: 60, height: 65, widthThickness: 9, heightThickness: 9 },
  "Monteferro 16mm": { width: 89.5, height: 62, widthThickness: 9, heightThickness: 16 },
  "Marazzi 9mm": { width: 62, height: 67, widthThickness: 9, heightThickness: 9 },
  "Marazzi 16mm": { width: 68, height: 72, widthThickness: 16, heightThickness: 16 },
};

const MRL = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const SCALE = 1 / 5; // Scale 1:25
  const PIXELS_PER_MM =1; // Conversion factor for actual size
  const SCALE_FACTOR = PIXELS_PER_MM * SCALE; // Pixels per mm at 1:25 scale
  
   const [shaftDimensions, setShaftDimensions] = useState({
    innerWidth: 1590, // Inner shaft width in mm
    innerDepth:1528, // Inner shaft depth in mm
    frameHeight: 2250, // Door frame height in mm (default)
    selectedWall: ['left' , 'right ']
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
    offsetX: 130,
    offsetY: 130,
    leftOffsetX :130,
    rightOffsetX: 130,
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
    railDistance: 330, 
    frontDistance: 60,      // Default distance for rail wall
});
const[ carDoorjamb , setCarDoorJamb] = useState(60);

  const [doorGap, setDoorGap] = useState(30);  // Gap between the landing door and car door in mm
  
  const [doorFrameSettings, setDoorFrameSettings] = useState({
    width: 120, // Default width in mm
    height: 60, // Default height in mm
  });

  const drawShaft = useCallback((context) => {
    // Function logic here...
  
  const startX = 225; 
  const startY = 225;

  // Inner shaft dimensions
  const innerWidthPx = shaftDimensions.innerWidth * SCALE_FACTOR;
  const innerDepthPx = shaftDimensions.innerDepth * SCALE_FACTOR;

  // Clear previous drawings
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw the shaft, walls, doors, etc.
    context.strokeStyle = 'black';
    context.strokeRect(startX, startY, innerWidthPx, innerDepthPx); // Draw inner shaft



  // Convert wall thickness for each wall to pixels
  const rearWallThicknessPx = wallThickness.rear * SCALE_FACTOR;
  const frontWallThicknessPx = wallThickness.front * SCALE_FACTOR;
  const leftWallThicknessPx = wallThickness.left * SCALE_FACTOR;
  const rightWallThicknessPx = wallThickness.right * SCALE_FACTOR;

  // Starting points for the outer shaft walls
  const outerStartX = 225 - leftWallThicknessPx;
  const outerStartY = 225 - rearWallThicknessPx;

  // Calculate outer shaft dimensions
  const outerWidthPx = innerWidthPx + leftWallThicknessPx + rightWallThicknessPx;  // Add left and right wall thickness
  const outerDepthPx = innerDepthPx + frontWallThicknessPx + rearWallThicknessPx;  // Add front and rear wall thickness

 
  // Draw the outer shaft walls
  context.strokeStyle = 'black';
  context.lineWidth = 2;

  // Draw the outer shaft rectangle (with varying wall thickness)
  context.strokeRect(outerStartX, outerStartY, outerWidthPx, outerDepthPx);
  // Add axis lines at mouse position
  if (mousePosition) {
    context.strokeStyle = 'black';
    context.lineWidth = 1;


    // Vertical axis
    context.beginPath();
    context.moveTo(mousePosition.x, 0);
    context.lineTo(mousePosition.x, context.canvas.height);
    context.stroke();

    // Horizontal axis
    context.beginPath();
    context.moveTo(0, mousePosition.y);
    context.lineTo(context.canvas.width, mousePosition.y);
    context.stroke();

    context.setLineDash([]); // Reset dash
  }


    // Dimension lines for inner width
    const arrowSize = 6;
    const labelFontSize = 14;
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    context.lineWidth = 1;

    // Horizontal dimension line (inner width)
    const widthLineY = outerStartY + innerDepthPx + rearWallThicknessPx + frontWallThicknessPx + 400* SCALE_FACTOR ; // Below the inner shaft
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

    // Label for inner width (horizontal text)
context.save();
context.font = `${labelFontSize}px Arial`; // Set font size and style
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`SW ${shaftDimensions.innerWidth} `, startX + innerWidthPx / 2, widthLineY + 20); // Adjusted Y for readability
context.restore();

    // Vertical dimension line (inner depth)
    const depthLineX =outerStartX + innerWidthPx + leftWallThicknessPx+ rightWallThicknessPx + 400 *SCALE_FACTOR; // To the right of the inner shaft
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

    // Label for inner depth (rotated vertical text)
context.save();
context.font = `${labelFontSize}px Arial`; // Set font size and style
context.translate(depthLineX + 20, startY + innerDepthPx / 2); // Move context to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`SD ${shaftDimensions.innerDepth} `, 0, 0);
context.restore();


// Rear wall thickness (vertical dimension line)
const rearWallLineX = outerStartX + innerWidthPx+ leftWallThicknessPx+ rightWallThicknessPx + 400 * SCALE_FACTOR;
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

// Rear wall label (rotated vertically)
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearWallLineX +20, outerStartY + rearWallThicknessPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`${wallThickness.rear} `, 0, 0);
context.restore();

// Front wall thickness (vertical dimension line)
const frontWallLineX = outerStartX + outerWidthPx + 400 * SCALE_FACTOR; // Position for front wall dimension line


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

// Front wall label (rotated vertically)
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(frontWallLineX + 20, outerStartY + outerDepthPx - frontWallThicknessPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(`${wallThickness.front} `, 0, 0);
context.restore();



// Left wall thickness (horizontal dimension line)
const leftWallLineY = outerStartY  + outerDepthPx + 400 * SCALE_FACTOR;
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

// Left wall label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`${wallThickness.left} `, outerStartX + leftWallThicknessPx / 2, leftWallLineY + 20);
context.restore();

// Right wall thickness (horizontal dimension line)
const rightWallLineY = outerStartY + outerDepthPx + 400 * SCALE_FACTOR;
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

// Right wall label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(`${wallThickness.right} `, outerStartX + outerWidthPx - rightWallThicknessPx / 2, rightWallLineY + 20);
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
   
    const carDoorjambPx = (carDoorjamb * SCALE_FACTOR )- cabinWallThicknessPx + verticalOffset*SCALE_FACTOR ;
    const frontDistancePx = carDoorHeightPx + landingDoorHeightPx + doorGapPx + carDoorjambPx ;
    const rearWallThicknessPx = wallThickness.rear * SCALE_FACTOR;
  const frontWallThicknessPx = wallThickness.front * SCALE_FACTOR;
  const leftWallThicknessPx = wallThickness.left * SCALE_FACTOR;
  const rightWallThicknessPx = wallThickness.right * SCALE_FACTOR;
  const arrowSize = 5;
const labelFontSize = 13;

    let cabinX, cabinY, cabinWidthPx, cabinDepthPx , centerX , centerY ;

    switch (selectedWall) {
        case 'left':
            // Offset cabin entrance by wallOpeningOffset to the right
            cabinX = startX + railwallDistancePx ;
            cabinWidthPx = innerWidthPx - railwallDistancePx - rightDistancePx;
            cabinY = startY + rearDistancePx;  // 90 mm from rear wall
            cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
            centerX = cabinX + cabinWidthPx / 2;
            centerY = cabinY + cabinDepthPx / 2;

            // Draw the center axis for width

            
// Constants for arrow size and label font size


// Horizontal Dimension Line for Cabin Width
const cabinWidthLineY = cabinY  - rearDistancePx- rearWallThicknessPx- 150 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin width
context.beginPath();
context.moveTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY); // Start at left edge of the cabin
context.lineTo(cabinX - cabinWallThicknessPx+ cabinWidthPx, cabinWidthLineY); // End at right edge of the cabin
context.stroke();

// Arrows for cabin width
// Left arrow
context.beginPath();
context.moveTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY - arrowSize / 2);
context.lineTo(cabinX + arrowSize+ cabinWallThicknessPx, cabinWidthLineY + arrowSize / 2);
context.lineTo(cabinX+ cabinWallThicknessPx, cabinWidthLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY - arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx - arrowSize- cabinWallThicknessPx, cabinWidthLineY + arrowSize / 2);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, cabinWidthLineY);
context.closePath();
context.fill();

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 150 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

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

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY = cabinY  - rearDistancePx- rearWallThicknessPx- 275 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 275 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX, cabinY + cabinDepthPx ); // End at bottom edge of the cabin
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
context.moveTo(PlatformLineX - arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX + arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX, cabinY + cabinDepthPx);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX = startY+ innerWidthPx+rearWallThicknessPx  + 275 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(rearDistanceLineX, startY); // Start from top of the cabin
context.lineTo(rearDistanceLineX,  startY +rearDistancePx); // End at bottom of the cabin
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

// Rear Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(rearDistanceLineX - 10, startY+rearDistancePx/2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance

// Right Distance Horizontal Dimension Line
const rightDistanceLineY = startY - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Position below the cabin
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
  rightDistanceLineY - 10
);
context.restore();


// Left Wall Thickness
const leftWallThicknessLineY = startY - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY - arrowSize);
context.lineTo(cabinX + arrowSize, leftWallThicknessLineY);
context.lineTo(cabinX, leftWallThicknessLineY + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY - arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY + arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx - arrowSize, leftWallThicknessLineY);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  leftWallThicknessLineY - 10
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY = startY   - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY - arrowSize);
context.lineTo(cabinX+ cabinWidthPx + arrowSize, rightWallThicknessLineY);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY - arrowSize);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY + arrowSize);
context.lineTo(cabinX+ cabinWidthPx - cabinWallThicknessPx - arrowSize, rightWallThicknessLineY);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY - 10
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX = startX+innerWidthPx+ rightWallThicknessPx + 150 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX - arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX + arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX - arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX + arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX, cabinY +cabinWallThicknessPx);
context.closePath();
context.fill();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX - 10, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
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
  centerAxisLineY - 10
);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY1 = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY1); // Start at the left edge
context.lineTo(centerX, centerAxisLineY1); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx + arrowSize, centerAxisLineY1 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx + arrowSize, centerAxisLineY1 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY1);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY1 - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY1 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY1);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY1 - 10
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX = centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 275 * SCALE_FACTOR; // Position right of the center axis
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

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX - 10, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX1= centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 275 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX1, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX1, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX1 - arrowSize / 2, startY + arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX1 + arrowSize / 2, startY + arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX1, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX1 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX1 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX1, centerY);
context.closePath();
context.fill();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX1 - 10, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();







context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -railwallDistancePx -leftWallThicknessPx -50, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + rightDistancePx + rightWallThicknessPx+10 , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx -20); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+20); // Extend to the bottom edge
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
            centerY = cabinY + cabinDepthPx / 2;

            // Constants for arrow size and label font size


// Horizontal Dimension Line for Cabin Width
const cabinWidthLineY1 = cabinY  - rearDistancePx- rearWallThicknessPx- 150 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY1 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX1 = cabinX  - leftDistancePx- leftWallThicknessPx- 100 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
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

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX1 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY1 = cabinY  - rearDistancePx- rearWallThicknessPx- 275 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY1 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX1 = cabinX - leftDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX1, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX1, cabinY + cabinDepthPx ); // End at bottom edge of the cabin
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
context.moveTo(PlatformLineX1 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX1 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX1, cabinY + cabinDepthPx);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX1 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX1 = startY -leftWallThicknessPx- 225 * SCALE_FACTOR; // Position left of the cabin
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
context.translate(rearDistanceLineX1- 10, startY+rearDistancePx/2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance

// Right Distance Horizontal Dimension Line
const leftDistanceLineY = startY - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Position below the cabin
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
context.moveTo(cabinX  - leftDistancePx - arrowSize, leftDistanceLineY - arrowSize / 2);
context.lineTo(cabinX - leftDistancePx - arrowSize, leftDistanceLineY + arrowSize / 2);
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
  cabinX  + leftDistancePx / 2,
  leftDistanceLineY- 10
);
context.restore();


// Left Wall Thickness
const leftWallThicknessLineY1 = startY - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY1 - arrowSize);
context.lineTo(cabinX + arrowSize, leftWallThicknessLineY1);
context.lineTo(cabinX, leftWallThicknessLineY1 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1 - arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY1 + arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx - arrowSize, leftWallThicknessLineY1);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  leftWallThicknessLineY1 - 10
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY1 = startY   - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY1 - arrowSize);
context.lineTo(cabinX+ cabinWidthPx + arrowSize, rightWallThicknessLineY1);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY1 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1 - arrowSize);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY1 + arrowSize);
context.lineTo(cabinX+ cabinWidthPx - cabinWallThicknessPx - arrowSize, rightWallThicknessLineY1);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY1 - 10
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
context.moveTo(topWallThicknessLineX1 - arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX1 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX1, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX1 - arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX1 + arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX1, cabinY + cabinWallThicknessPx);
context.closePath();
context.fill();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX1 - 10, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY2 = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
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
  centerAxisLineY2 - 10
);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY3 = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY3); // Start at the left edge
context.lineTo(centerX, centerAxisLineY3); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx + arrowSize, centerAxisLineY3 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx + arrowSize, centerAxisLineY3 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY3);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY3- arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY3 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY3);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY3 - 10
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX2 = centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 275 * SCALE_FACTOR; // Position right of the center axis
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

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX2 - 10, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX3= centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 275 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX3, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX3, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX3 - arrowSize / 2, startY + arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX3 + arrowSize / 2, startY + arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX3, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX3 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX3 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX3, centerY);
context.closePath();
context.fill();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX3 - 10, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();


            // Draw the center axis for width
            

            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -leftDistancePx -leftWallThicknessPx -20, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + railwallDistancePx + rightWallThicknessPx +20 , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx-20); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+20); // Extend to the bottom edge
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
            centerY = cabinY + cabinDepthPx / 2;

            // Draw the center axis for width

            // Horizontal Dimension Line for Cabin Width
const cabinWidthLineY2 = cabinY  - railwallDistancePx- rearWallThicknessPx- 150 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY2 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX2 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 150 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
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

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX2 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY2 = cabinY  - railwallDistancePx- rearWallThicknessPx- 275 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY2 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX2 = cabinX + cabinWidthPx + rightDistancePx+ rightWallThicknessPx+ 275 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX2, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX2, cabinY + cabinDepthPx ); // End at bottom edge of the cabin
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
context.moveTo(PlatformLineX2 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX2 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX2, cabinY + cabinDepthPx);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX2 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();



// Right Distance Horizontal Dimension Line
const rightDistanceLineY1 = startY - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Position below the cabin
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
  rightDistanceLineY1 - 10
);
context.restore();
const leftDistanceLineY1 = startY - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Position below the cabin
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
context.moveTo(cabinX  - leftDistancePx - arrowSize, leftDistanceLineY1 - arrowSize / 2);
context.lineTo(cabinX - leftDistancePx - arrowSize, leftDistanceLineY1 + arrowSize / 2);
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
  cabinX  + leftDistancePx / 2,
  leftDistanceLineY1- 10
);
context.restore();



// Left Wall Thickness
const leftWallThicknessLineY2 = startY - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY2); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, leftWallThicknessLineY2- arrowSize);
context.lineTo(cabinX + arrowSize, leftWallThicknessLineY2);
context.lineTo(cabinX, leftWallThicknessLineY2 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2 - arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx, leftWallThicknessLineY2 + arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx - arrowSize, leftWallThicknessLineY2);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  leftWallThicknessLineY2 - 10
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY2 = startY   - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY2); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY2 - arrowSize);
context.lineTo(cabinX+ cabinWidthPx + arrowSize, rightWallThicknessLineY2);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY2 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2 - arrowSize);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY2 + arrowSize);
context.lineTo(cabinX+ cabinWidthPx - cabinWallThicknessPx - arrowSize, rightWallThicknessLineY2);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY2 - 10
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX2 = startX+innerWidthPx+ rightWallThicknessPx + 150 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX2, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX2, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX2 - arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX2 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX2, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX2 - arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX2 + arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX2, cabinY + cabinWallThicknessPx);
context.closePath();
context.fill();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX2 - 10, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY4 = centerY - cabinDepthPx/2  -railwallDistancePx- rearWallThicknessPx - 400 * SCALE_FACTOR; // Position below the center axis
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
  centerAxisLineY4 - 10
);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY5 = centerY - cabinDepthPx/2  - rearWallThicknessPx- railwallDistancePx - 400 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY5); // Start at the left edge
context.lineTo(centerX, centerAxisLineY5); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx + arrowSize, centerAxisLineY5 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx + arrowSize, centerAxisLineY5 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY5);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY5 - arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY5 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY5);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY5 - 10
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX4 = centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 100 * SCALE_FACTOR; // Position right of the center axis
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

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX4 - 10, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX5= centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 100 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX5, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX5, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX5 - arrowSize / 2, startY + arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX5 + arrowSize / 2, startY + arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX5, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX5 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX5 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX5, centerY);
context.closePath();
context.fill();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX5 - 10, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();





            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -leftDistancePx -leftWallThicknessPx -20, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + rightDistancePx + rightWallThicknessPx +20 , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - railwallDistancePx - rearWallThicknessPx -20); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+20); // Extend to the bottom edge
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
            centerY = cabinY + cabinDepthPx / 2;

            // Horizontal Dimension Line for Cabin Width
const cabinWidthLineY3 = cabinY  - rearDistancePx- rearWallThicknessPx- 150 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` CW ${(cabinWidthPx/ SCALE_FACTOR - cabinWallThicknessPx*2/SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, cabinWidthLineY3 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const cabinDepthLineX3 = cabinX  - railwallDistancePx- leftWallThicknessPx- 275 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
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

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(cabinDepthLineX3 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` CD ${(cabinDepthPx  /SCALE_FACTOR  - cabinWallThicknessPx*2/SCALE_FACTOR).toFixed(0)} `, 0, 0);
context.restore();


// Horizontal Dimension Line for Cabin Width
const PlatformLineY3 = cabinY  - rearDistancePx- rearWallThicknessPx- 275 * SCALE_FACTOR; // Below the cabin
context.strokeStyle = 'green';
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

// Label for cabin width
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(` PLW ${(cabinWidthPx / SCALE_FACTOR ).toFixed(0)} `, cabinX + cabinWidthPx / 2, PlatformLineY3 - 10);
context.restore();

// Vertical Dimension Line for Cabin Depth
const PlatformLineX3 = cabinX - leftDistancePx- leftWallThicknessPx- 225 * SCALE_FACTOR; // To the right of the cabin
context.strokeStyle = 'green';
context.fillStyle = 'black';
context.lineWidth = 1;

// Dimension line for cabin depth
context.beginPath();
context.moveTo(PlatformLineX3, cabinY); // Start at top edge of the cabin
context.lineTo(PlatformLineX3, cabinY + cabinDepthPx ); // End at bottom edge of the cabin
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
context.moveTo(PlatformLineX3 - arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX3 + arrowSize / 2, cabinY + cabinDepthPx - arrowSize);
context.lineTo(PlatformLineX3, cabinY + cabinDepthPx);
context.closePath();
context.fill();

// Label for cabin depth
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(PlatformLineX3 -10, cabinY + cabinDepthPx / 2); // Move to label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` PLD ${(cabinDepthPx / SCALE_FACTOR ).toFixed(0)} `, 0, 0);
context.restore();

// Rear Distance
const rearDistanceLineX2 = startY -leftWallThicknessPx- 225 * SCALE_FACTOR; // Position left of the cabin
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
context.translate(rearDistanceLineX2- 10, startY+rearDistancePx/2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical orientation
context.fillText(` ${cabinSettings.rearDistance}`, 0, 0);
context.restore();
// Rear Distance

// Right Distance Horizontal Dimension Line
const railwallDistanceLineY = startY - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Position below the cabin
context.beginPath();
context.moveTo(cabinX ,railwallDistanceLineY); // Start at the right edge of the cabin
context.lineTo(cabinX  -leftDistancePx, railwallDistanceLineY); // End at the distance marker
context.stroke();

// Right Distance Arrows
// Left arrow
context.beginPath();
context.moveTo(cabinX  - arrowSize, railwallDistanceLineY- arrowSize / 2);
context.lineTo(cabinX  - arrowSize, railwallDistanceLineY+ arrowSize / 2);
context.lineTo(cabinX , railwallDistanceLineY);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(cabinX  - leftDistancePx - arrowSize, railwallDistanceLineY- arrowSize / 2);
context.lineTo(cabinX - leftDistancePx - arrowSize, railwallDistanceLineY + arrowSize / 2);
context.lineTo(cabinX  - leftDistancePx, railwallDistanceLineY);
context.closePath();
context.fill();

// Right Distance Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${cabinSettings.leftDistance}`,
  cabinX  + leftDistancePx / 2,
  railwallDistanceLineY- 10
);
context.restore();


// Left Wall Thickness
const railwallDistanceLineY1= startY - rearWallThicknessPx   - 150 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX, railwallDistanceLineY1); // Start at the bottom-left edge of the wall
context.lineTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX, railwallDistanceLineY1 - arrowSize);
context.lineTo(cabinX + arrowSize, railwallDistanceLineY1);
context.lineTo(cabinX, railwallDistanceLineY1 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1 - arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx, railwallDistanceLineY1 + arrowSize);
context.lineTo(cabinX + cabinWallThicknessPx - arrowSize, railwallDistanceLineY1);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWallThicknessPx / 2,
  railwallDistanceLineY1 - 10
);
context.restore();


// Left Wall Thickness
const rightWallThicknessLineY3 = startY   - rearWallThicknessPx   - 275 * SCALE_FACTOR; // Below the cabin
context.beginPath();
context.moveTo(cabinX + cabinWidthPx, rightWallThicknessLineY3); // Start at the bottom-left edge of the wall
context.lineTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3); // Extend to the thickness
context.stroke();

// Left Wall Thickness Arrows
// Bottom arrow
context.beginPath();
context.moveTo(cabinX+ cabinWidthPx, rightWallThicknessLineY3 - arrowSize);
context.lineTo(cabinX+ cabinWidthPx + arrowSize, rightWallThicknessLineY3);
context.lineTo(cabinX+ cabinWidthPx, rightWallThicknessLineY3 + arrowSize);
context.closePath();
context.fill();

// Top arrow
context.beginPath();
context.moveTo(cabinX +cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3 - arrowSize);
context.lineTo(cabinX + cabinWidthPx- cabinWallThicknessPx, rightWallThicknessLineY3 + arrowSize);
context.lineTo(cabinX+ cabinWidthPx - cabinWallThicknessPx - arrowSize, rightWallThicknessLineY3);
context.closePath();
context.fill();

// Left Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  `${cabinSettings.wallThickness}`,
  cabinX + cabinWidthPx- cabinWallThicknessPx / 2,
  rightWallThicknessLineY3 - 10
);
context.restore();
// Top Cabin Wall Thickness
const topWallThicknessLineX3 = startX- leftWallThicknessPx - 100 * SCALE_FACTOR; // Position left of the cabin
context.beginPath();
context.moveTo(topWallThicknessLineX3, cabinY); // Start at the top of the cabin
context.lineTo(topWallThicknessLineX3, cabinY + cabinWallThicknessPx); // End at the bottom of the top wall
context.stroke();

// Top Wall Thickness Arrows
// Top arrow
context.beginPath();
context.moveTo(topWallThicknessLineX3 - arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX3 + arrowSize / 2, cabinY + arrowSize);
context.lineTo(topWallThicknessLineX3, cabinY);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(topWallThicknessLineX3 - arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX3 + arrowSize / 2, cabinY + cabinWallThicknessPx - arrowSize);
context.lineTo(topWallThicknessLineX3, cabinY + cabinWallThicknessPx);
context.closePath();
context.fill();

// Top Wall Thickness Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(topWallThicknessLineX3 - 10, cabinY + cabinWallThicknessPx / 2); // Adjust label position
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(` ${cabinSettings.wallThickness}`, 0, 0);
context.restore();
// Horizontal Center Axis Dimension Line
const centerAxisLineY6 = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
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
const centerAxisLineY7 = centerY - cabinDepthPx/2  - rearDistancePx- rearWallThicknessPx - 375 * SCALE_FACTOR; // Position below the center axis
context.strokeStyle = 'black';
context.lineWidth = 1;
context.beginPath();
context.moveTo(startX + innerWidthPx, centerAxisLineY7); // Start at the left edge
context.lineTo(centerX, centerAxisLineY7); // End at the center
context.stroke();

// Horizontal Center Axis Arrows
// Left arrow
context.beginPath();
context.moveTo(startX+ innerWidthPx + arrowSize, centerAxisLineY7 - arrowSize / 2);
context.lineTo(startX+ innerWidthPx + arrowSize, centerAxisLineY7 + arrowSize / 2);
context.lineTo(startX+ innerWidthPx, centerAxisLineY7);
context.closePath();
context.fill();

// Right arrow
context.beginPath();
context.moveTo(centerX - arrowSize, centerAxisLineY7- arrowSize / 2);
context.lineTo(centerX - arrowSize, centerAxisLineY7 + arrowSize / 2);
context.lineTo(centerX, centerAxisLineY7);
context.closePath();
context.fill();

// Horizontal Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText(
  ` ${((startX -centerX  + innerWidthPx) / SCALE_FACTOR).toFixed(0)} `,
  (startX+ innerWidthPx + centerX) / 2,
  centerAxisLineY7 - 10
);
context.restore();

// Vertical Center Axis Dimension Line
const centerAxisLineX6 = centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 400 * SCALE_FACTOR; // Position right of the center axis
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

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX6 - 10, (startY + centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((centerY - startY) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();
// Vertical Center Axis Dimension Line
const centerAxisLineX7= centerX- cabinWidthPx/2- railwallDistancePx- leftDistancePx  - 400 * SCALE_FACTOR; // Position right of the center axis
context.strokeStyle = 'black';
context.beginPath();
context.moveTo(centerAxisLineX7, startY+ innerDepthPx); // Start at the top edge
context.lineTo(centerAxisLineX7, centerY); // End at the center
context.stroke();

// Vertical Center Axis Arrows
// Top arrow
context.beginPath();
context.moveTo(centerAxisLineX7 - arrowSize / 2, startY + arrowSize + innerDepthPx);
context.lineTo(centerAxisLineX7 + arrowSize / 2, startY + arrowSize+ innerDepthPx);
context.lineTo(centerAxisLineX7, startY+ innerDepthPx);
context.closePath();
context.fill();

// Bottom arrow
context.beginPath();
context.moveTo(centerAxisLineX7 - arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX7 + arrowSize / 2, centerY - arrowSize);
context.lineTo(centerAxisLineX7, centerY);
context.closePath();
context.fill();

// Vertical Center Axis Label
context.save();
context.font = `${labelFontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
context.translate(centerAxisLineX7 - 10, (startY + innerDepthPx+ centerY) / 2); // Position next to dimension line
context.rotate(-Math.PI / 2); // Rotate text for vertical alignment
context.fillText(
  ` ${((  startY - centerY + innerDepthPx) / SCALE_FACTOR).toFixed(0)} `,
  0,
  0
);
context.restore();

            context.strokeStyle = 'black'; // Color for the center axis
context.lineWidth = 1;
context.setLineDash([5, 5]); // Dashed line

context.beginPath();
context.moveTo(cabinX -railwallDistancePx -leftWallThicknessPx-20, centerY); // Start at the left edge
context.lineTo(cabinX + cabinWidthPx + railwallDistancePx + rightWallThicknessPx+20 , centerY); // Extend to the right edge
context.stroke();

// Draw the center axis for depth
context.beginPath();
context.moveTo(centerX, cabinY - rearDistancePx - rearWallThicknessPx-20); // Start at the top edge
context.lineTo(centerX, cabinY + cabinDepthPx+ frontDistancePx+frontWallThicknessPx+20); // Extend to the bottom edge
context.stroke();

context.setLineDash([]);
              break;

        default:
            return;  // Exit if no wall is selected
    }

    const innerWidthWithoutWallsPx = cabinWidthPx - 2 * cabinWallThicknessPx;
    const innerDepthWithoutWallsPx = cabinDepthPx - 2 * cabinWallThicknessPx;

    // Draw inner walls with 30 mm thickness
    context.strokeStyle = 'green';
    context.strokeRect(
        cabinX + cabinWallThicknessPx,
        cabinY + cabinWallThicknessPx,
        innerWidthWithoutWallsPx,
        innerDepthWithoutWallsPx
    );
    // Calculate the top of the car door, where the outer walls should stop
    const carDoorTopY = cabinY + cabinDepthPx + carDoorjambPx - verticalOffset * SCALE_FACTOR ;

    // Draw the outer left and right walls, connecting to the top of the car door
    context.strokeStyle = 'green';

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
    context.strokeStyle = 'green';

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

};



const drawTShapeWithFrame = (context, startX, startY, innerWidthPx, innerDepthPx ) => {
 
  const { width, height, widthThickness, heightThickness } = tShapeSettings;
  const { offsetX, leftOffsetX, rightOffsetX } = tShapeSettings;

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
 const frontWallThicknessPx = wallThickness.front * SCALE_FACTOR;
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
      const centerY = cabinY + cabinDepthPx / 2;
      const bracketY1 = centerY - railDistancePx / 2 - bracketHeightPx + offsetYPx;
      const bracketY2 = centerY + railDistancePx / 2 + offsetYPx;
  
      const railY1 = centerY - railDistancePx / 2 + offsetYPx;
      const railY2 = centerY + railDistancePx / 2 + offsetYPx;
      const railCenterX = cabinX + cabinWidthPx / 2;
  
      // Flip the first T-shape by 180°
      drawSingleTShape(
        bracketX + offsetXPx,
        bracketY1 + tShapeHeightPx + bracketHeightPx + verticalOffsetY * SCALE_FACTOR ,
        true,
        true
      );
  
      // Second T-shape (not flipped)
      drawSingleTShape(bracketX + offsetXPx, bracketY2 - tShapeHeightPx + verticalOffsetY * SCALE_FACTOR);
  
      // Draw brackets on the left wall
      context.fillRect(bracketX, bracketY1, bracketWidthPx, bracketHeightPx);
      context.fillRect(bracketX, bracketY2, bracketWidthPx, bracketHeightPx);
  
      // Draw rail distance vertical dimension
      const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
        const arrowSize = 5; // Size of the arrows
        const labelFontSize = 13; // Font size for the label
  
        // Adjusted positions to include arrow size
        const adjustedRailY1 = railY1 - arrowSize + tShapeHeightPx;
        const adjustedRailY2 = railY2 + arrowSize - tShapeHeightPx;
  
        // Draw the vertical dimension line
        context.strokeStyle = 'black'; // Color for the dimension line
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(railCenterX, adjustedRailY1); // Start after the arrow
        context.lineTo(railCenterX, adjustedRailY2); // End before the arrow
        context.stroke();
  
        // Draw the top arrow
        context.beginPath();
        context.moveTo(railCenterX -arrowSize / 2, railY1 - tShapeHeightPx+ arrowSize); // Left wing
        context.lineTo(railCenterX + arrowSize / 2, railY1-tShapeHeightPx + arrowSize); // Right wing
        context.lineTo(railCenterX, adjustedRailY1 ); // Tip
        context.closePath();
        context.fillStyle = 'black';
        context.fill();
  
        // Draw the bottom arrow
        context.beginPath();
        context.moveTo(railCenterX - arrowSize / 2, railY2-tShapeHeightPx- arrowSize); // Left wing
        context.lineTo(railCenterX + arrowSize / 2, railY2-tShapeHeightPx-arrowSize); // Right wing
        context.lineTo(railCenterX, adjustedRailY2 -tShapeHeightPx ); // Tip
        context.closePath();
        context.fill();
  
        // Draw the label
        context.save();
        context.font = `${labelFontSize}px Arial`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
          `DBG: ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(1)} mm`,
          railCenterX + arrowSize + 15, // Position to the right of the dimension line
          (railY1 + railY2) / 2
        );
        context.restore();
      };
  
      drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
      break;
    }
  
  
  
    case 'right': {
      cabinX = startX + railwallDistancePx;
      cabinY = startY + rearDistancePx;
      cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
      const bracketX = startX + innerWidthPx  - bracketWidthPx + horizontalOffsetX;
      const centerY = cabinY + cabinDepthPx / 2;
      const bracketY1 = centerY -railDistancePx/2-bracketHeightPx  + offsetYPx;
      const bracketY2 = centerY+ railDistancePx/2 + offsetYPx ;
    
  
      // Flip the first T-shape by 180°
      drawSingleTShape(bracketX + bracketWidthPx + offsetXPx, bracketY1 + tShapeHeightPx  + bracketHeightPx  +(verticalOffsetY * SCALE_FACTOR) , true, true);
  
      // Second T-shape (not flipped)
      drawSingleTShape(bracketX + bracketWidthPx + offsetXPx, bracketY2 - tShapeHeightPx  + (verticalOffsetY * SCALE_FACTOR));
     // Draw brackets on the right wall
     context.fillRect(bracketX, bracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(bracketX, bracketY2, bracketWidthPx, bracketHeightPx);
    // Draw rail distance vertical dimension
    const railY1 = centerY - railDistancePx / 2 + offsetYPx;
    const railY2 = centerY + railDistancePx / 2 + offsetYPx;
    const railCenterX = cabinX + cabinWidthPx / 2;

      const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
        const arrowSize = 5; // Size of the arrows
        const labelFontSize = 13; // Font size for the label
  
        // Adjusted positions to include arrow size
        const adjustedRailY1 = railY1 + arrowSize + tShapeHeightPx;
        const adjustedRailY2 = railY2 - arrowSize- tShapeHeightPx;
  
        // Draw the vertical dimension line
        context.strokeStyle = 'black'; // Color for the dimension line
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(railCenterX, adjustedRailY1); // Start after the arrow
        context.lineTo(railCenterX, adjustedRailY2); // End before the arrow
        context.stroke();
  
        // Draw the top arrow
        context.beginPath();
        context.moveTo(railCenterX +arrowSize / 2, railY1 - tShapeHeightPx); // Left wing
        context.lineTo(railCenterX - arrowSize / 2, railY1-tShapeHeightPx); // Right wing
        context.lineTo(railCenterX, adjustedRailY1 ); // Tip
        context.closePath();
        context.fillStyle = 'black';
        context.fill();
  
        // Draw the bottom arrow
        context.beginPath();
        context.moveTo(railCenterX - arrowSize / 2, railY2-tShapeHeightPx); // Left wing
        context.lineTo(railCenterX + arrowSize / 2, railY2-tShapeHeightPx); // Right wing
        context.lineTo(railCenterX, adjustedRailY2 -tShapeHeightPx -arrowSize); // Tip
        context.closePath();
        context.fill();
  
        // Draw the label
        context.save();
        context.font = `${labelFontSize}px Arial`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
          `DBG: ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(1)} mm`,
          railCenterX + arrowSize + 15, // Position to the right of the dimension line
          (railY1 + railY2) / 2
        );
        context.restore();
      };
  
      drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
      break;
    }
  
    case 'left & right': {

      cabinX = startX + railwallDistancePx;
      cabinY = startY + rearDistancePx;
      cabinDepthPx = innerDepthPx - rearDistancePx - frontDistancePx;
      cabinWidthPx = innerWidthPx - railwallDistancePx - railwallDistancePx;
      const centerY = cabinY + cabinDepthPx / 2;
  
      // Left wall
      const leftBracketX = startX;
      const leftBracketY1 = centerY - railDistancePx / 2 - bracketHeightPx+ offsetYPx;
      const leftBracketY2 = centerY + railDistancePx / 2 + offsetYPx;
      drawSingleTShape(leftBracketX + leftOffsetXPx, leftBracketY1  + tShapeHeightPx + bracketHeightPx+ (verticalOffsetY * SCALE_FACTOR), true, true); // Flipped
      drawSingleTShape(leftBracketX + leftOffsetXPx, leftBracketY2 - tShapeHeightPx+ (verticalOffsetY * SCALE_FACTOR) );
  
      // Right wall
      const rightBracketX = startX + innerWidthPx  - bracketWidthPx  ;
      const rightBracketY1 = centerY - railDistancePx / 2 -bracketHeightPx+ offsetYPx;
      const rightBracketY2 = centerY + railDistancePx / 2 + offsetYPx;
      drawSingleTShape(rightBracketX +bracketWidthPx+ rightOffsetXPx, rightBracketY1 + tShapeHeightPx + bracketHeightPx+ (verticalOffsetY * SCALE_FACTOR), true, true); // Flipped
      drawSingleTShape(rightBracketX +bracketWidthPx+ rightOffsetXPx, rightBracketY2 - tShapeHeightPx + (verticalOffsetY * SCALE_FACTOR) );
     // Left wall brackets
    
     context.fillRect(leftBracketX, leftBracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(leftBracketX, leftBracketY2, bracketWidthPx, bracketHeightPx);

     // Right wall brackets
    
     context.fillRect(rightBracketX, rightBracketY1, bracketWidthPx, bracketHeightPx);
     context.fillRect(rightBracketX, rightBracketY2, bracketWidthPx, bracketHeightPx);
    
     const railY1 = centerY - railDistancePx / 2 + offsetYPx;
     const railY2 = centerY + railDistancePx / 2 + offsetYPx;
     const railCenterX = cabinX + cabinWidthPx / 2;
 
       const drawRailDistanceDimensionVertical = (context, railY1, railY2, railCenterX) => {
         const arrowSize = 5; // Size of the arrows
         const labelFontSize = 13; // Font size for the label
   
         // Adjusted positions to include arrow size
         const adjustedRailY1 = railY1 + arrowSize + tShapeHeightPx;
         const adjustedRailY2 = railY2 - arrowSize- tShapeHeightPx;
   
         // Draw the vertical dimension line
         context.strokeStyle = 'black'; // Color for the dimension line
         context.lineWidth = 1;
         context.beginPath();
         context.moveTo(railCenterX, adjustedRailY1); // Start after the arrow
         context.lineTo(railCenterX, adjustedRailY2); // End before the arrow
         context.stroke();
   
         // Draw the top arrow
         context.beginPath();
         context.moveTo(railCenterX +arrowSize / 2, railY1 - tShapeHeightPx); // Left wing
         context.lineTo(railCenterX - arrowSize / 2, railY1-tShapeHeightPx); // Right wing
         context.lineTo(railCenterX, adjustedRailY1 ); // Tip
         context.closePath();
         context.fillStyle = 'black';
         context.fill();
   
         // Draw the bottom arrow
         context.beginPath();
         context.moveTo(railCenterX - arrowSize / 2, railY2-tShapeHeightPx); // Left wing
         context.lineTo(railCenterX + arrowSize / 2, railY2-tShapeHeightPx); // Right wing
         context.lineTo(railCenterX, adjustedRailY2 -tShapeHeightPx -arrowSize); // Tip
         context.closePath();
         context.fill();
   
         // Draw the label
         context.save();
         context.font = `${labelFontSize}px Arial`;
         context.fillStyle = 'black';
         context.textAlign = 'center';
         context.textBaseline = 'middle';
         context.fillText(
           `DBG: ${((railY2 - railY1) / SCALE_FACTOR - tShapeHeightPx*2/SCALE_FACTOR).toFixed(1)} mm`,
           railCenterX + arrowSize + 15, // Position to the right of the dimension line
           (railY1 + railY2) / 2
         );
         context.restore();
       };
   
       drawRailDistanceDimensionVertical(context, railY1, railY2, railCenterX);
       break;
    }
  
    case 'rear': {
      cabinX = startX + leftDistancePx;
      cabinY = startY + railwallDistancePx;
      cabinWidthPx = innerWidthPx - leftDistancePx - rightDistancePx;
      const centerX = cabinX + cabinWidthPx / 2  ;
      const railX1 = centerX - railDistancePx / 2 + offsetXPx;
      const railX2 = centerX + railDistancePx / 2 + offsetXPx ;
      const centerY = cabinY + cabinWidthPx / 2; 
      const bracketY = startY   ;
      const railCenterY = centerY;
      const bracketX1 = centerX - railDistancePx / 2 -bracketHeightPx  + horizontalOffsetXPx;
      const bracketX2 = centerX + railDistancePx / 2   + horizontalOffsetXPx;
  
        // Draw the first T-shape without flipping (neutral orientation)
  drawSingleTShape(railX1  + (horizontalOffsetX * SCALE_FACTOR) , bracketY + offsetYPx, false, false);

  // Draw the second T-shape without flipping (neutral orientation)
  drawSingleTShape(railX2 +(horizontalOffsetX * SCALE_FACTOR) , bracketY+ offsetYPx, false, true);
  // Draw brackets on the rear wall
  context.fillRect(bracketX1, bracketY, bracketHeightPx, bracketWidthPx);
  context.fillRect(bracketX2, bracketY, bracketHeightPx, bracketWidthPx);

  const drawRailDistanceDimension = (context, railX1, railX2, railCenterY) => {
    const arrowSize = 5; // Size of the arrows
    const labelFontSize = 13; // Font size for the label

    // Calculate the adjusted rail positions to include arrows
    const adjustedRailX1 = railX1 + arrowSize + tShapeHeightPx + horizontalOffsetXPx;
    const adjustedRailX2 = railX2 - arrowSize-tShapeHeightPx+horizontalOffsetXPx;

    // Draw the dimension line
    context.strokeStyle = 'black'; // Color for the dimension line
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(adjustedRailX1+ horizontalOffsetXPx , railCenterY/2- rearWallThicknessPx); // Start after the arrow
    context.lineTo(adjustedRailX2+ horizontalOffsetXPx , railCenterY/2-rearWallThicknessPx); // End before the arrow
    context.stroke();

    // Draw the left arrow
    context.beginPath();
    context.moveTo(railX1+ tShapeHeightPx + horizontalOffsetXPx, railCenterY/2- rearWallThicknessPx); // Tip of the arrow
    context.lineTo(adjustedRailX1+ horizontalOffsetXPx , railCenterY/2- arrowSize / 2- rearWallThicknessPx); // Left wing
    context.lineTo(adjustedRailX1+ horizontalOffsetXPx , railCenterY /2+ arrowSize / 2-rearWallThicknessPx); // Right wing
    context.closePath();
    context.fillStyle = 'black';
    context.fill();

    // Draw the right arrow
    context.beginPath();
    context.moveTo(railX2-tShapeHeightPx+ horizontalOffsetXPx , railCenterY/2-rearWallThicknessPx); // Tip of the arrow
    context.lineTo(adjustedRailX2+ horizontalOffsetXPx , railCenterY/2 - arrowSize / 2-rearWallThicknessPx); // Left wing
    context.lineTo(adjustedRailX2+ horizontalOffsetXPx , railCenterY /2+ arrowSize / 2- rearWallThicknessPx); // Right wing
    context.closePath();
    context.fill();

    // Draw the label
    context.save();
    context.font = `${labelFontSize}px Arial`;
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
        `DBG ${((railX2 - railX1) / SCALE_FACTOR- tShapeHeightPx*2/SCALE_FACTOR).toFixed(0)} ` ,
        (railX1 + railX2) / 2 + horizontalOffsetXPx,
        railCenterY/2-rearWallThicknessPx - arrowSize - 3 // Position above the dimension line
    );
    context.restore();
};
  drawRailDistanceDimension(context, railX1, railX2, railCenterY );


  break;
}
  
    default:
      console.warn('Unsupported wall type:', tShapeSettings.selectedWall);
      break;
  }
  

 
  
  let frameX1, frameX2, frameY, frameHeight , frameWidth;

  switch (tShapeSettings.selectedWall) {
    case 'left': {
      const shoeThickness = 10 * SCALE_FACTOR;
      const railX = startX + tShapeSettings.offsetX * SCALE_FACTOR;
      const centerY = cabinY + cabinDepthPx / 2;
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
     
      break;
    }
  
    case 'right': {
      
      frameWidth = 150 * SCALE_FACTOR
      const shoeThickness = 10 * SCALE_FACTOR;
      const railX = startX + innerWidthPx - frameWidth/2 + tShapeSettings.offsetX*SCALE_FACTOR ;
      const centerY = cabinY + cabinDepthPx / 2;
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
     
      break;
    }
  
    case 'rear': {
      const centerX = cabinX + cabinWidthPx / 2;
       const shoeHeight = 60*SCALE_FACTOR;
      const railX1 = centerX - railDistancePx / 2  + tShapeHeightPx + shoeHeight/2 + tShapeSettings.offsetX * SCALE_FACTOR +(horizontalOffsetX * SCALE_FACTOR);
      const railX2 = centerX + railDistancePx / 2 - tShapeHeightPx - shoeHeight/2+ tShapeSettings.offsetX * SCALE_FACTOR +(horizontalOffsetX * SCALE_FACTOR);
      const shoeThickness = 10 * SCALE_FACTOR; 
      
      frameHeight = 150 * SCALE_FACTOR;
      frameX1 = railX1;
      frameX2 = railX2 ;
      frameY = startY -frameHeight /2 - shoeThickness + tShapeHeightThicknessPx+ tShapeSettings.offsetY * SCALE_FACTOR ;
     
  
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.strokeRect(frameX1, frameY, frameX2 - frameX1, frameHeight);
  
      const innerFrameWidth = (frameX2 - frameX1) / 2;
      const innerFrameHeight = frameHeight / 2;
      const innerFrameX = frameX1 + innerFrameWidth / 2;
      const innerFrameY = frameY + innerFrameHeight / 2;
  
      context.strokeRect(innerFrameX, innerFrameY, innerFrameWidth, innerFrameHeight);
      
      
      break;
    }
  
    case 'left & right': {
      const centerY = cabinY + cabinDepthPx / 2;
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
    const shoeWidth = 74 * SCALE_FACTOR;
    const shoeHeight = 60 * SCALE_FACTOR;
    const shoeThickness = 10 * SCALE_FACTOR;
    const frameWidth = 150* SCALE_FACTOR;

    const shoeY = frameY + (frameHeight - shoeHeight) / 2 ;

    const leftShoeX = frameX1 ; // Left rail
    drawUShoe(leftShoeX, shoeY, shoeWidth, shoeHeight, false, false, 90); // Rotate 90° clockwise

    const rightShoeX = frameX2 + shoeThickness; // Right rail
    drawUShoe(rightShoeX, shoeY, shoeWidth, shoeHeight, true, false, -270); // Rotate and flip 180°
    break;
  }
  case 'left & right': {
    // Common dimensions

    const centerY =cabinY + cabinDepthPx / 2;
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
      const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
      const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;
    
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

// Define drawDimensionLine at the top level of the file
const drawDimensionLine = (context, x1, y1, x2, y2, label, offsetX = 0, offsetY = 0) => {
  context.strokeStyle = 'black';
  context.lineWidth = 1;

  // Draw dimension line
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();

  // Add text label
  context.font = '10px Arial';
  context.fillStyle = 'black';
  const textWidth = context.measureText(label).width;
  const textX = (x1 + x2) / 2 - textWidth / 2 + offsetX;
  const textY = y1 + offsetY;
  context.fillText(label, textX, textY);
};

drawDimensionLine(
  context,
  startX , // Left inner shaft wall X-coordinate
  frameY1 + wallThickness.front * SCALE_FACTOR / 2, // Midpoint of the wall opening height
  frameX1, // Left wall opening beside frame X1
  frameY1 + wallThickness.front * SCALE_FACTOR / 2,
  `X1: ${Math.round((frameX1 - startX) / SCALE_FACTOR)} mm`
);



drawDimensionLine(
  context,
  startX + innerWidthPx, // Right inner shaft wall X-coordinate
  frameY1 + wallThickness.front * SCALE_FACTOR / 2, // Midpoint of the wall opening height
  frameX2 + frameWidthPx, // Right wall opening beside frame X2
  frameY1 + wallThickness.front * SCALE_FACTOR / 2,
  `X2: ${Math.round(((frameX2 + frameWidthPx) - (startX + innerWidthPx)) / SCALE_FACTOR)} mm`
);
context.strokeStyle = 'red';
context.lineWidth = 2;
context.beginPath();
context.moveTo(startX + innerWidthPx, frameY1);
context.lineTo(frameX2 + frameWidthPx, frameY1);
context.stroke();



  
  
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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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
context.lineTo(frameX2+ frameWidthPx , frameY1+  wallThickness.front *SCALE_FACTOR);
context.stroke();

 
 
  
  
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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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

};

const drawDoorsS3R = (context, startX, startY, cabinWidthPx, cabinDepthPx, innerDepthPx, innerWidthPx) => {
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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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
  const rearDistancePx = cabinSettings.rearDistance * SCALE_FACTOR;
  const cabinWallThicknessPx = cabinSettings.wallThickness * SCALE_FACTOR;

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

  };


const handleShaftChange = (e) => {
  const { name, value } = e.target;
    setShaftDimensions((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
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
    const context = canvas.getContext('2d');
    drawShaft(context);
  
  }, [drawShaft, tShapeSettings, bracketsSettings]);
  

  useEffect(() => {
    // Update tShapeSettings when rail type changes
    setTShapeSettings((prevSettings) => ({
      ...prevSettings,
      ...T_SHAPE_RAIL_OPTIONS[selectedRailType],
    }));
  }, [selectedRailType]);

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


        <h3>Inner Shaft Settings</h3>
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

      <label htmlFor="doorWidth">Select Door Width:</label>
      <select
        id="doorWidth"
        value={DoorDimensions.width}
        onChange={handleWidthChange}
      >
        {doorWidths.map((width) => (
          <option key={width} value={width}>
            {width} mm
          </option>
        ))}
      </select>

    
  
<label>
  Gap Between Doors (mm):
  <input
    type="number"
    name="doorGap"
    value={doorGap}
    onChange={(e) => setDoorGap(parseInt(e.target.value, 10))}
  />
</label>
<label>
  Car Door Jamb (mm):
  <input
    type="number"
    name="carDoorJamb"
    value={carDoorjamb}
    onChange={(e) => setCarDoorJamb(parseInt(e.target.value, 10))}
  />
</label>
<label>
    Wall Opening Offset (mm):
    <input
        type="number"
        name="wallOpeningOffset"
        value={wallOpeningOffset}
        onChange={(e) => setWallOpeningOffset(parseInt(e.target.value, 10))}
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

        <h3>Door Frame Settings</h3>
        <label>
          Frame Width :
          <input
            type="number"
            name="width"
            value={doorFrameSettings.width}
            onChange={handleDoorFrameChange}
          />
        </label>
    
        <label>
          Frame Height :
          <input
            type="number"
            name="height"
            value={doorFrameSettings.height}
            onChange={handleDoorFrameChange}
          />
        </label>
        <label>
  Vertical Offset (mm):
  <input
    type="number"
    value={verticalOffset}
    onChange={(e) => setVerticalOffset(parseInt(e.target.value, 10))}
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


  <label>
    Horizontal Offset:
    <input
      type="number"
      value={horizontalOffsetX}
      onChange={(e) => setHorizontalOffsetX(Number(e.target.value))}
    />
  </label>
  
  <label>
    Vertical Offset:
    <input
      type="number"
      value={verticalOffsetY}
      onChange={(e) => setVerticalOffsetY(Number(e.target.value))}
    />
  </label>


          <h3>T-Shape Settings</h3>

          <label>
  Rail Distance (mm):
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
          selectedWall === 'left' ? 130 :
          selectedWall === 'right' ? -130 : 0,
        offsetY: selectedWall === 'rear' ? 130 : 0,
        leftOffsetX: selectedWall === 'left & right' ? 130 : 0,
        rightOffsetX: selectedWall === 'left & right' ? -130 : 0,
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
  );
};
export default MRL;
