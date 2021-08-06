import axios from 'axios';
import { showAlert } from './alerts';

export const booking = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51JLIdwSHRlMWHn5YkaHokKEeyuOLDpXicl7ALolkCqlrJy0slChuhR48o74FXIijvyJcKLW4NZy7Vtpt3f4F9mGD00J2mKCTQ8'
    );
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err.message);
    showAlert('error', err.message);
  }
};
