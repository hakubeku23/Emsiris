document.addEventListener('keydown', function(e) {
    const focusableElements = document.querySelectorAll('.focusable');
    const numColumns = 3;  // Define how many items per row
  
    let index = Array.from(focusableElements).indexOf(document.activeElement);
  
    if (e.key === 'ArrowDown') {
      // Move focus down (to the next row, same column)
      const nextIndex = index + numColumns;
      if (nextIndex < focusableElements.length) {
        focusableElements[nextIndex].focus();
      }
    } else if (e.key === 'ArrowUp') {
      // Move focus up (to the previous row, same column)
      const prevIndex = index - numColumns;
      if (prevIndex >= 0) {
        focusableElements[prevIndex].focus();
      }
    } else if (e.key === 'ArrowLeft') {
      // Move focus left (to the previous element in the row)
      if (index > 0) {
        focusableElements[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight') {
      // Move focus right (to the next element in the row)
      if (index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  });