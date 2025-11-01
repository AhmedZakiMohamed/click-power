// ✅ في أول ملف updateSettings.js
import axios from 'axios';
import { showAlert } from './alert.js';  // ← المهم ده!

export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';

    console.log('📤 Sending update request...');
    console.log('📦 Data to send:', data);
    
    if (data instanceof FormData) {
      console.log('📋 FormData contents:');
      for (let [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }
    }

    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });

    console.log('✅ Response received:', res.data);
    console.log('📸 Updated photo:', res.data.data.user.photo);

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      
      console.log('🔄 Reloading page in 1.5 seconds...');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.error('❌ Update error:', err);
    console.error('❌ Error response:', err.response);
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  }
};