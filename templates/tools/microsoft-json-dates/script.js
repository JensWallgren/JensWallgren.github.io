function writeJsonDate(dateObj) {
  let elem = document.getElementById('mjd-value');

  let unixTimestamp = Math.floor(dateObj.getTime() / 1000) * 1000;
  elem.value = `/Date(${unixTimestamp})/`;
  elem.classList.remove('error');
}

function writeTextDate(dateObj) {
  let date = dateObj.toISOString().split('T')[0];
  let time = dateObj.toTimeString().split(' ')[0];
  document.getElementById('mjd-date-value').value = date;
  document.getElementById('mjd-time-value').value = time;

  document.querySelector('.mjd-time-equiv').classList.remove('error');
  document.getElementById('mjd-value').classList.remove('error');
}

function writeJsonDateNow() {
  let date = new Date();
  writeJsonDate(date);
  writeTextDate(date);
}

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
  navigator.clipboard.writeText(document.getElementById('mjd-value').value);
}

function inputToJsonDate() {
  console.log('inputToJsonDate');
  let date = document.getElementById('mjd-date-value').value;
  let time = document.getElementById('mjd-time-value').value;
  let dateObj = new Date(`${date}T${time}`);

  if (isNaN(dateObj)) {
    document.querySelector('.mjd-time-equiv').classList.add('error');
  } else {
    document.querySelector('.mjd-time-equiv').classList.remove('error');

    // Trigger animation on date change
    let jsonDate = document.getElementById('mjd-value');
    jsonDate.classList.remove('animate');
    void jsonDate.offsetHeight;
    jsonDate.classList.add('animate');
    writeJsonDate(dateObj);
  }
}


function jsonDateToTextDate() {
  let jsonDate = document.getElementById('mjd-value');
  let match = jsonDate.value.match(/\/Date\((\d{13})\)\//);
  if (match) {
    let timestamp = parseInt(match[1]);
    let dateObj = new Date(timestamp);

    // Trigger animation on date change
    let dateTime = document.querySelector('.mjd-time-equiv');
    dateTime.classList.remove('animate');
    void dateTime.offsetHeight;
    dateTime.classList.add('animate');
    writeTextDate(dateObj);
  } else {
    document.getElementById('mjd-value').classList.add('error');
  }
}


startInterval();
document.querySelector('#mjd-page').classList.add('show');
document.querySelector('.dropdown').classList.remove('active');

document.querySelector('#mjd-date-value').addEventListener('focus', () => stopInterval());
document.querySelector('#mjd-time-value').addEventListener('focus', () => stopInterval());

document.querySelector('#mjd-date-value').addEventListener('input', () => inputToJsonDate());
document.querySelector('#mjd-time-value').addEventListener('input', () => inputToJsonDate());

document.querySelector('#mjd-value').addEventListener('focus', () => stopInterval());
document.querySelector('#mjd-value').addEventListener('input', () => jsonDateToTextDate());