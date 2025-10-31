import axios from 'axios';
import { showAlert } from './alert.js';

export const createProduct = async (formData) => {
  try {
    console.log('🚀 Sending request to API...');
    
    const res = await axios({
      method: 'POST',
      url: '/api/v1/products',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Response:', res.data);
    
    if (res.data.status === 'success') {
      showAlert('success', 'Product created successfully!');
      
      const modal = document.getElementById('addProductModal');
      if(modal) modal.classList.remove('active');
      
      const form = document.getElementById('addProductForm');
      if(form) form.reset();
      
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    console.error('❌ Response data:', err.response?.data);
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  }
};
export const deleteProduct = async (productId) => {
  try {
    console.log('🚀 Sending delete request for product:', productId);
    
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/products/${productId}`
    });
    
    console.log('✅ Delete response:', res);
    
    // ⚠️ لاحظ: DELETE request بيرجع status 204 (No Content)
    // يعني مفيش res.data
    if (res.status === 204 || res.data?.status === 'success') {
      showAlert('success', 'Product deleted successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    showAlert('error', err.response?.data?.message || 'Failed to delete product!');
  }
};
// export const createCategory = async (formData) => {
//   try {
//     console.log('🚀 Sending request to API...');
    
//     const res = await axios({
//       method: 'POST',
//       url: '/api/v1/categories',
//       data: formData,
//       headers: {
//         'Content-Type': 'multipart/form-data'
//         // ✅ axios بيبعت الـ cookies تلقائياً لو withCredentials: true
//       },
//       withCredentials: true // ✅ مهم لو بتستخدم cookies
//     });
    
//     console.log('✅ Response:', res.data);
    
//     if (res.data.status === 'success') {
//       showAlert('success', 'Category created successfully!');
      
//       const modal = document.getElementById('addCategoryModal');
//       if(modal) modal.classList.remove('active');
      
//       const form = document.getElementById('addCategoryForm');
//       if(form) form.reset();
      
//       window.setTimeout(() => {
//         location.reload();
//       }, 1500);
//     }
//   } catch (err) {
//     console.error('❌ Error:', err);
//     console.error('❌ Response:', err.response); // ✅ شوف الـ response كامل
//     console.error('❌ Status:', err.response?.status); // ✅ هل 401 Unauthorized؟
//     showAlert('error', err.response?.data?.message || 'Something went wrong!');
//   }
// };
export const deleteCategory = async (categoryId) => {
  try {
    console.log('🚀 Sending delete request for category:', categoryId); // ✅ عدلت هنا
    
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/categories/${categoryId}`
    });
    
    console.log('✅ Delete response:', res);
    
    if (res.status === 204 || res.data?.status === 'success') {
      showAlert('success', 'Category deleted successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error('❌ Error deleting category:', err);
    showAlert('error', err.response?.data?.message || 'Failed to delete category!');
  }
};