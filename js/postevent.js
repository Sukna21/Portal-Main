(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=20260923-postevent-v36').catch(()=>{}));
  }
})();
