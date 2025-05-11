/**
 * Utility functions for DOM manipulation related to tutorial features
 */

/**
 * Highlight a board cell at the specified coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} text - Optional tooltip text to display
 * @param {function} dispatchFn - Redux dispatch function
 * @returns {void}
 */
export const highlightBoardCell = (x, y, text, dispatchFn) => {
  // First, remove any existing highlights
  const existingHighlights = document.querySelectorAll('.tutorial-highlight-cell');
  existingHighlights.forEach(el => el.classList.remove('tutorial-highlight-cell'));
  
  // Primary approach: get cell by position using the board's structure
  const boardRows = document.querySelectorAll('.board-row');
  let element = null;
  
  // Get the cell using DOM traversal (most reliable method)
  if (boardRows && boardRows.length > y && y >= 0) {
    const targetRow = boardRows[y];
    if (targetRow) {
      const cells = targetRow.querySelectorAll('.board-cell');
      if (cells && cells.length > x && x >= 0) {
        element = cells[x];
      }
    }
  }
  
  // Fall back to data attribute selector if DOM traversal fails
  if (!element) {
    element = document.querySelector(`.board-cell[data-x="${x}"][data-y="${y}"]`);
  }
  
  // If still not found, final fallback to scanning all cells
  if (!element) {
    const allCells = document.querySelectorAll('.board-cell');
    for (const cell of allCells) {
      const cellX = parseInt(cell.getAttribute('data-x'), 10);
      const cellY = parseInt(cell.getAttribute('data-y'), 10);
      if (cellX === x && cellY === y) {
        element = cell;
        break;
      }
    }
  }
  
  if (!element) {
    return; // Silently fail if we can't find the element
  }
  
  // Add a class to the element for styling purposes
  element.classList.add('tutorial-highlight-cell');
  
  // Only create tooltip if text is provided
  if (text) {
    // Create a unique ID for this element if it doesn't have one already
    const elementId = `tutorial-element-${x}-${y}`;
    element.setAttribute('data-tutorial-id', elementId);
    
    // Get the actual position of the element in the viewport
    const rect = element.getBoundingClientRect();
    
    // Send the actual element position and ID for accurate tooltip placement
    dispatchFn({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      text: text,
      elementId: elementId // This allows the TutorialOverlay to find this element
    });
  } else {
    // Clear existing tooltip if no text is provided
    dispatchFn(null);
  }
};

/**
 * Highlight any DOM element using a CSS selector
 * @param {string} selector - CSS selector for the element to highlight
 * @param {string} text - Tooltip text to display
 * @param {function} dispatchFn - Redux dispatch function
 * @returns {void}
 */
export const highlightElement = (selector, text, dispatchFn) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`Could not find element with selector: ${selector}`);
    return;
  }
  
  const rect = element.getBoundingClientRect();
  dispatchFn({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    text: text
  });
};
