/* globals document */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshButton').onclick = function onRefreshButtonClick() {
    document.getElementById('refreshIcon').classList.add('spin')
    window.location.reload()
  }
}, false)
