import axios from 'axios';
import { showAlert } from './alerts';

export async function updateUserData(type, data) {
  try {
    let url;

    console.log(data);
    type === 'data'
      ? (url = 'http://localhost:3000/api/v1/users/updateMe')
      : (url = 'http://localhost:3000/api/v1/users/updateMyPassword');
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} updated Successfully`);
      window.location.assign('/me');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
}
