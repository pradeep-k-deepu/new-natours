import '@babel/polyfill';
import { getMap } from './mapbox';
import { login, logout } from './login';
import { updateUserData } from './updateUserData';
import { booking } from './stripe';

const form = document.querySelector('.loginForm');
const map = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const updateSettings = document.querySelector('.form-user-settings');
const bookButton = document.getElementById('bookButton');

if (map) {
  let locations = JSON.parse(map.dataset.locations);
  getMap(locations);
}

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    login(email.value, password.value);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let userData = new FormData();
    userData.append('name', document.getElementById('name').value);
    userData.append('email', document.getElementById('email').value);
    userData.append('photo', document.getElementById('photo').files[0]);
    updateUserData('data', userData);
  });
}

if (updateSettings) {
  updateSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    updateUserData('password', {
      currentPassword,
      newPassword,
      passwordConfirm,
    });
  });
}

if (bookButton) {
  bookButton.addEventListener('click', function (e) {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    console.log(tourId);
    booking(tourId);
  });
}
