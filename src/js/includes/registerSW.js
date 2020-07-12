if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sworker.js').then((reg) => {
      // Successful register
    });
  });
} 
