import axios from 'axios';
import { showAlert } from './alerts';

export async function login(email, password) {
  try {
    console.log(email, password);
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      window.location.assign('/');
    }
  } catch (err) {
    console.log(err);
  }
}
