// Get URL params
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Assign title
if (urlParams.has('title')) {
  const title = urlParams.get('title');
  document.title = `${title}`;
}

// Try to assign model to the model-viewer
var assignModelInterval = setInterval(function() {
  const modelViewer = document.querySelector('model-viewer');
  if (modelViewer) {
    if (urlParams.has('src')) {
      const src = urlParams.get('src');
      modelViewer.setAttribute('src', `${src}`);
    }
    if (urlParams.has('ios-src')) {
      const iosSrc = urlParams.get('ios-src');
      modelViewer.setAttribute('ios-src', `${iosSrc}`);
    }
    if (urlParams.has('poster')) {
      const poster = urlParams.get('poster');
      modelViewer.setAttribute('poster', `${poster}`);
    }
    if (urlParams.has('alt')) {
      const alt = urlParams.get('alt');
      modelViewer.setAttribute('alt', `${alt}`);
    }
    clearInterval(assignModelInterval);
  }
}, 500);
