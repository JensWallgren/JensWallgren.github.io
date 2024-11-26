
// Check the current URL and highlight the correct nav button
const url = window.location.pathname;
const navButtons = document.querySelectorAll('.nav-button');

navButtons.forEach(button => {
  let underline = button.parentElement.querySelector('.underline');

  if (button.getAttribute('hx-get') === url) {
    button.classList.add('active');
  } else {
    button.classList.remove('active');
  }
});
