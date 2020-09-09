function loadFavicon(tab) {
  let webview = tab.webview
  webview.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons.length > 0)
      tab.setIcon(e.favicons[0], '')
  });
}
export default loadFavicon