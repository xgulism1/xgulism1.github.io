// Test if this is iOS
// @see https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
function isIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
}

// Try to start the iOS AR Quick Look immediatelly
// @see https://github.com/google/model-viewer/issues/697
// @see https://infinitygames-kids-galicnik.glitch.me/
if (isIOS()) {
  var iosRedirectInterval = setInterval(function() {
    const modelViewer = document.querySelector('model-viewer');
    // Wait until ios-src is assigned
    if (modelViewer && modelViewer.hasAttribute('ios-src')) {
      modelViewer.activateAR();
      clearInterval(iosRedirectInterval);
    }
  }, 500);
}
