
const drawRailDistanceDimension = (context, railX1, railX2, railCenterY) => {
  const perpendicularSize  = 5; // Size of the arrows
  const labelFontSize = 13; // Font size for the label

  // Calculate the adjusted rail positions to include arrows
  const adjustedRailX1 = railX1 + perpendicularSize  + tShapeHeightPx;
  const adjustedRailX2 = railX2 - perpendicularSize -tShapeHeightPx;

  // Draw the dimension line
  context.strokeStyle = 'black'; // Color for the dimension line
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(adjustedRailX1, railCenterY/2- rearWallThicknessPx); // Start after the arrow
  context.lineTo(adjustedRailX2, railCenterY/2-rearWallThicknessPx); // End before the arrow
  context.stroke();

  // Draw the left arrow
  context.beginPath();
  context.moveTo(railX1+ tShapeHeightPx, railCenterY/2- rearWallThicknessPx); // Tip of the arrow
  context.lineTo(adjustedRailX1, railCenterY/2 - perpendicularSize  / 2- rearWallThicknessPx); // Left wing
  context.lineTo(adjustedRailX1, railCenterY /2+ perpendicularSize  / 2-rearWallThicknessPx); // Right wing
  context.closePath();
  context.fillStyle = 'black';
  context.fill();

  // Draw the right arrow
  context.beginPath();
  context.moveTo(railX2-tShapeHeightPx, railCenterY/2-rearWallThicknessPx); // Tip of the arrow
  context.lineTo(adjustedRailX2, railCenterY/2 - perpendicularSize  / 2-rearWallThicknessPx); // Left wing
  context.lineTo(adjustedRailX2, railCenterY /2+ perpendicularSize  / 2- rearWallThicknessPx); // Right wing
  context.closePath();
  context.fill();

  // Draw the label
  context.save();
  context.font = `${labelFontSize}px Arial`;
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
      `DBG: ${((railX2 - railX1) / SCALE_FACTOR- tShapeHeightPx*2/SCALE_FACTOR)} `,
      (railX1 + railX2) / 2,
      railCenterY/2-rearWallThicknessPx - perpendicularSize  - 5 // Position above the dimension line
  );
  context.restore();
};
drawRailDistanceDimension(context, railX1, railX2, railCenterY);