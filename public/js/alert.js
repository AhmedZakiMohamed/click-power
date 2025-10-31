// export const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) el.remove();
// };

// /*************  ✨ Windsurf Command ⭐  *************/
// /*******  3233b6b1-d5cb-4da8-af88-14b78cd127f3  *******/
// export const showAlert = (type, msg) => {
//   hideAlert();
//   const markup = `
//     <div class="alert alert--${type}">
//       <span class="alert__message">${msg}</span>
//       <button class="alert__close" type="button">&times;</button>
//     </div>`;
  
//   document.body.insertAdjacentHTML('afterbegin', markup);

//   const closeBtn = document.querySelector('.alert__close');
//   closeBtn.addEventListener('click', hideAlert);

//   window.setTimeout(hideAlert, 5000);
// };
// أضف الـ styles مرة واحدة
const addAlertStyles = () => {
  if (!document.getElementById('alert-styles')) {
    const styles = document.createElement('style');
    styles.id = 'alert-styles';
    styles.textContent = `
      .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 16px 22px;
        min-width: 300px;
        max-width: 400px;
        border-radius: 12px;
        font-weight: 600;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(400px);
        animation: slideIn 0.4s ease forwards;
        font-family: 'Inter', sans-serif;
      }

      .alert__message {
        flex: 1;
        font-size: 15px;
        line-height: 1.5;
      }

      .alert__close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        transition: background 0.3s ease;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .alert__close:hover {
        background: rgba(255, 255, 255, 0.35);
      }

      .alert--success {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .alert--error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      @keyframes slideIn {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(400px);
        }
      }

      @media (max-width: 480px) {
        .alert {
          left: 10px;
          right: 10px;
          min-width: unset;
          max-width: unset;
        }
      }
    `;
    document.head.appendChild(styles);
  }
};

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }
};

export const showAlert = (type, msg) => {
  addAlertStyles(); // أضف الـ styles أول حاجة
  hideAlert();
  
  const markup = `
    <div class="alert alert--${type}">
      <span class="alert__message">${msg}</span>
      <button class="alert__close" type="button">&times;</button>
    </div>`;
  
  document.body.insertAdjacentHTML('afterbegin', markup);

  const closeBtn = document.querySelector('.alert__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideAlert);
  }

  window.setTimeout(hideAlert, 5000);
};