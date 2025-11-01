import axios from 'axios';
import { showAlert } from './alert.js';

export const sendRestLink = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    
    if (res.data.status === 'success') {
      // ✅ بس showAlert - مفيش حاجة تانية
      showAlert('success', 'Reset link sent to your email! Check your inbox.');
    }
  } catch (err) {
    console.error('❌ Error:', err);
    // ✅ بس showAlert - مفيش حاجة تانية
    showAlert('error', err.response?.data?.message || 'Failed to send reset link');
  }
};