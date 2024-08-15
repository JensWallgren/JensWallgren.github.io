console.log('Microsoft JSON Dates --- script.js');

function writeJsonDate(dateObj) {
  let unixTimestamp = Math.floor(dateObj.getTime() / 1000) * 1000;
  document.getElementById('mjd-value').innerHTML = `/Date(${unixTimestamp})/`;

  let date = dateObj.toISOString().split('T')[0];
  let time = dateObj.toTimeString().split(' ')[0];
  document.getElementById('mjd-date-value').innerHTML = date;
  document.getElementById('mjd-time-value').innerHTML = time;
}

function writeJsonDateNow() { writeJsonDate(new Date()) }


document.body.addEventListener('htmx:load', function (e) {
  // When page load via url: the target is the body. When via HTMX: the target is mjd-page
  let element = e.detail.elt;
  console.dir(element);
  if (element.tagName === 'BODY' || element.id === 'mjd-page') {
    startInterval();
  }
});

function startInterval() {
  writeJsonDateNow();
  if (!window.intervalId) {
    window.intervalId = setInterval(writeJsonDateNow, 1000);
  }
  document.querySelector('.mjd-button.play img').src = '/media/icons/tabler/player-stop.svg';
}

function stopInterval() {
  clearInterval(window.intervalId);
  window.intervalId = null;
  document.querySelector('.mjd-button.play img').src = '/media/icons/tabler/player-play.svg';
}

document.body.addEventListener('htmx:beforeSwap', function (e) {
  if (e.detail.pathInfo.requestPath === e.detail.target.id !== 'mjd-page') {
    stopInterval();
  }
});

function jsonDateToClipboard() {
  navigator.clipboard.writeText(document.getElementById('mjd-value').innerHTML);
}

startInterval();
document.querySelector('#mjd-page').classList.add('show');
document.querySelector('.dropdown').classList.remove('active');
