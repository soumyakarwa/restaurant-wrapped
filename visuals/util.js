import * as Constants from "./constants.js";

export function drawLocationPin(context, x, y, radius, color, text) {
  const tailHeight = radius * 1.618; // Height of the pin's tail

  // Start the path for the pin
  context.beginPath();

  // Draw the rounded top (circle)
  context.arc(x, y - tailHeight, radius, Math.PI, 2 * Math.PI, false); // Top half of the pin

  // Draw the tail (triangle)
  context.lineTo(x + radius, y - tailHeight); // Bottom-right of the circle
  context.lineTo(x, y); // Point of the tail (centered at x, y)
  context.lineTo(x - radius, y - tailHeight);
  // Close the path
  context.closePath();

  // Fill the pin shape
  context.fillStyle = Constants.colors.yellow;
  context.fill();

  // Add text inside the pin
  if (text) {
    context.fillStyle = Constants.colors.black; // Text color
    context.font = `${radius * 0.8}px baskerville-display-pt`; // Font size relative to pin size
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, x, y - tailHeight); // Center the text in the circular area
  }
}
