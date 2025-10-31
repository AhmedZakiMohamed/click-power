import axios from 'axios';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login } from './login.js';
import { logout } from './logout.js';
import { signup } from './signup.js';
import { updateSettings } from './updateSettings.js';
import { sendRestLink } from './sendRestLink.js';
import { resetPassword } from './formForgotPass.js';
import { createProduct } from './dashboard.js';
import { deleteProduct } from './dashboard.js';
import { createCategory } from './dashboard.js';
import { deleteCategory } from './dashboard.js';
import { showAlert } from './alert.js';

// انتظر لحد ما الصفحة تحمل كلها
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.form--login');
  const signupForm = document.querySelector('.form--signup');
  const logoutBtn = document.querySelector('.dropdown-item--logout');
  const userDataForm = document.querySelector('.form-user-data');
  const userPasswordForm = document.querySelector('.form-user-password');
  const forgotPasswordForm = document.querySelector('#resetForm');
  const resetPasswordForm = document.querySelector('#passwordForm');
  const addProductForm = document.getElementById('addProductModal');
  const deleteProductBtns = document.querySelectorAll('.btn-delete');
  const deleteCategoryBtns = document.querySelectorAll('.btn-delete-category');
  const addCategoryForm = document.querySelector('form#addCategoryForm');
  const categoryItems = document.querySelectorAll('.category-item');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('🔵 Login form submitted');

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault(); // ← منع الـ default behavior

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      const userDataForm = document.querySelector('.form-user-data');

      signup(name, email, password, passwordConfirm);
    });
  }
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      const photo = document.getElementById('photo').files[0];
      if (photo) form.append('photo', photo);
      updateSettings(form, 'data');
    });
  }
  if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = userPasswordForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Updating...';
      submitBtn.disabled = true; // منع الضغط مرتين

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password',
      );

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      // Clear inputs
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = forgotPasswordForm.querySelector(
        'button[type="submit"]',
      );
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showAlert('error', 'Please enter a valid email address');
        emailInput.classList.add('error');
        return;
      }

      // Show loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      console.log('📧 Sending password reset link to:', email);

      // Call the API function
      await sendRestLink(email);

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      // Clear input
      emailInput.value = '';
      emailInput.classList.remove('error');
    });
  }
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = resetPasswordForm.querySelector(
        'button[type="submit"]',
      );
      const passwordInput = document.getElementById('password');
      const passwordConfirmInput = document.getElementById('password-confirm');
      const password = passwordInput.value.trim();
      const passwordConfirm = passwordConfirmInput.value.trim();

      // Validate passwords
      if (password.length < 8) {
        showAlert('error', 'Password must be at least 8 characters long');
        passwordInput.classList.add('error');
        return;
      }
      if (password !== passwordConfirm) {
        showAlert('error', 'Passwords do not match');
        passwordConfirmInput.classList.add('error');
        return;
      }

      // Show loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Resetting...';
      submitBtn.disabled = true;

      console.log('🔒 Resetting password');

      const urlParams = new URLSearchParams(window.location.search);
      const token =
        urlParams.get('token') || window.location.pathname.split('/').pop();

      await resetPassword(password, passwordConfirm, token);

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      passwordInput.value = '';
      passwordConfirmInput.value = '';
    });
  }

  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      console.log('🔵 Form submitted!');

      const submitBtn = addProductForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Adding...';
      submitBtn.disabled = true;

      const formData = new FormData();

      const name = document.getElementById('productName').value;
      const category = document.getElementById('productCategory').value;
      const description = document.getElementById('productDescription').value;

      console.log('🔍 Name:', name);
      console.log('🔍 Category:', category);
      console.log('🔍 Description:', description);

      formData.append('name', name);
      formData.append('categories', category);
      formData.append('description', description);
      formData.append('summary', description); // نفس الـ description مؤقتاً

      const imageCover = document.getElementById('productImageCover').files[0];
      if (imageCover) {
        console.log('🖼️ Image cover:', imageCover.name);
        formData.append('imageCover', imageCover);
      }

      const image1 = document.getElementById('productImage1').files[0];
      if (image1) formData.append('images', image1);

      const image2 = document.getElementById('productImage2').files[0];
      if (image2) formData.append('images', image2);

      const image3 = document.getElementById('productImage3').files[0];
      if (image3) formData.append('images', image3);

      console.log('📦 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await createProduct(formData);

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }
  if (deleteProductBtns.length > 0) {
    deleteProductBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const productId = btn.dataset.productId;

        console.log('🔍 Clicked delete button');
        console.log('🔍 Product ID:', productId);

        if (!productId) {
          showAlert('error', 'Product ID not found!');
          return;
        }

        if (!confirm('Are you sure you want to delete this product?')) {
          return;
        }

        console.log('🗑️ Deleting product with ID:', productId);
        await deleteProduct(productId);
      });
    });
  }
  // في ملف index.js - form submission
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = addCategoryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // UI feedback
      submitBtn.textContent = 'Adding...';
      submitBtn.disabled = true;

      const name = document.getElementById('categoryName').value.trim();

      // ✅ validate input
      if (!name) {
        showAlert('error', 'Please enter category name!');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      try {
        // ✅ send request
        const res = await axios.post('/api/v1/categories', { name });

        console.log('✅ SUCCESS RESPONSE:', res);
        console.log('➡️ Status:', res.status);
        console.log('➡️ Data:', res.data);

        // ✅ ensure backend sent success properly
        if (res.status === 201 && res.data?.status === 'success') {
          showAlert(
            'success',
            res.data.message || 'Category created successfully!',
          );
        } else {
          console.warn('⚠️ Unexpected success response format:', res);
          showAlert(
            'info',
            'Category created, but response format unexpected.',
          );
        }

        // ✅ close modal + reset form
        const modal = document.getElementById('addCategoryModal');
        if (modal) modal.classList.remove('active');

        addCategoryForm.reset();

        // ✅ reload page after short delay
        setTimeout(() => {
          location.reload();
        }, 1500);
      } catch (err) {
        console.error('❌ REQUEST FAILED:', err);
        console.error('❌ FULL ERROR RESPONSE:', err.response);

        const status = err.response?.status;
        const msg =
          err.response?.data?.message || err.message || 'Something went wrong!';

        if (status === 401) {
          showAlert('error', 'You are not authorized. Please log in again.');
        } else if (status === 400) {
          showAlert('error', msg);
        } else {
          showAlert('error', `Error (${status || 'unknown'}): ${msg}`);
        }
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Category Items Click Handler

if (categoryItems.length > 0) {
  categoryItems.forEach(function(item) {
    item.addEventListener('click', async function(e) {
      e.preventDefault();

      const categoryId = item.dataset.categoryId;

      // إغلاق الـ drawer
      if (drawerList) {
        drawerList.classList.remove('active');
        document.body.style.overflow = '';
      }

      // عرض loading
      const productsContainer = document.querySelector('.products-container');
      if (productsContainer) {
        productsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;"><div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 1rem; color: #64748b; font-size: 1.2rem;">Loading...</p></div>';
      }

      try {
        const res = await fetch('/api/v1/categories/' + categoryId + '/products', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to fetch products for this category.');

        const data = await res.json();
        const products = data.items || [];
        
        displayProducts(products, item.textContent);
      } catch (err) {
        console.error('❌ Error:', err);
        if (productsContainer) {
          productsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;"><h2 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem;">❌ Error: ' + err.message + '</h2><button onclick="location.reload()" style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: white; padding: 0.8rem 2rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;"> Show All Products  </button></div>';
        }
      }
    });
  });
}

function displayProducts(products, categoryName) {
  const productsContainer = document.querySelector('.products-container');
  if (!productsContainer) return;

  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;"><h2 style="color: #64748b; font-size: 1.5rem; margin-bottom: 1rem;">  No products found  ' + categoryName + '</h2><button onclick="location.reload()" style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: white; padding: 0.8rem 2rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;"> Show All Products  </button></div>';
    return;
  }

  console.log('📦 First Product Full Data:', products[0]);

  const productsHTML = products.map(function(product) {
    const productName = product.name || 'No Name';
    const productSummary = product.summary || 'No Summary';
    
    // ✅ استخدم slug لو موجود، لو مش موجود استخدم _id
    const productSlug = product.slug || product._id;
    
    console.log('Product:', productName, 'Slug:', productSlug);
    
    let imageUrl = 'https://placehold.co/600x400/2563eb/ffffff?text=' + encodeURIComponent(productName);
    if (product.imageCover) {
      imageUrl = '/img/products/' + product.imageCover;
    } else if (product.images && product.images.length > 0) {
      imageUrl = '/img/products/' + product.images[0];
    }

    return '<div class="product-card">' +
      '<div class="product-imgbox">' +
        '<div class="product-img-overlay"></div>' +
        '<img src="' + imageUrl + '" alt="' + productName + '">' +
      '</div>' +
      '<div class="product-card-content">' +
        '<h3 class="product-name">' + productName + '</h3>' +
        '<div class="product-summary">' + productSummary + '</div>' +
        '<a class="details-btn" href="/product/' + productSlug + '">Details</a>' +
      '</div>' +
    '</div>';
  }).join('');

  productsContainer.innerHTML = productsHTML;
  window.scrollTo({ top: productsContainer.offsetTop - 120, behavior: 'smooth' });
}
if(deleteCategoryBtns.length > 0) {
    deleteCategoryBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const categoryId = btn.dataset.categoryId;

        console.log('🔍 Clicked delete button');
        console.log('🔍 Category ID:', categoryId);
        
        if (!categoryId) {
          console.error('❌ Category ID not found');
          return;
        }

        try {
          if (!confirm('Are you sure you want to delete this category?')) {
            return;
          }

          console.log('🗑️ Deleting category with ID:', categoryId);
        }
        catch (err) {
          console.error('❌ Error:', err);
        }

        await deleteCategory(categoryId);
      });
    });
  }
  // Show alert from server
  const alertMessage = document.body.dataset.alert;
  if (alertMessage) showAlert('success', alertMessage);
});
