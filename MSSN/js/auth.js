document.addEventListener('DOMContentLoaded', () => {
  const isFirebaseReady = window.hasFirebaseConfig === true;
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (!isFirebaseReady) {
    const authMessage = document.getElementById('authMessage');
    const message = 'Firebase is not configured yet. Open js/firebase-config.js and replace the placeholder values with your real Firebase project settings.';
    if (authMessage) {
      authMessage.textContent = message;
      authMessage.classList.add('error', 'visible');
    }
    return;
  }

  const firebaseApp = firebase.apps?.[0] || firebase.initializeApp(window.firebaseConfig);
  const auth = firebaseApp.auth();

  const authNavigationGuard = { active: false };

  const redirectTo = (targetPage) => {
    const currentPath = window.location.pathname.split('/').pop() || '';
    if (authNavigationGuard.active || currentPath === targetPage) return;
    authNavigationGuard.active = true;
    window.location.replace(targetPage);
  };

  const redirectToAccount = () => redirectTo('account.html');
  const redirectToLogin = () => redirectTo('login.html');

  const persistAuth = async () => {
    if (!auth || !auth.setPersistence) return;
    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (error) {
      console.warn('Auth persistence could not be set:', error);
    }
  };

  persistAuth();

  const logoutButtons = document.querySelectorAll('#logoutBtn, #logoutBtnAlt, .mobile-logout-btn');

  const isAuthPage = Boolean(loginForm || registerForm);
  const page = document.body.dataset.page;

  const setMessage = (element, message, type = '') => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('success', 'error', 'visible');
    if (type) element.classList.add(type, 'visible');
  };

  const setLoadingState = (button, isLoading, labelText = '') => {
    if (!button) return;
    const buttonText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    if (!buttonText || !spinner) return;
    button.disabled = isLoading;
    buttonText.classList.toggle('hidden', isLoading);
    spinner.classList.toggle('hidden', !isLoading);
    if (labelText) buttonText.textContent = labelText;
  };

  const showValidationError = (fieldId, message) => {
    const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
    if (errorEl) errorEl.textContent = message;
  };

  const clearValidationErrors = () => {
    document.querySelectorAll('.error-text').forEach((el) => {
      el.textContent = '';
    });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuthStateUpdate = (user) => {
    if (user) {
      updateUserNameDisplay();
      if (window.initAccountPage) window.initAccountPage();
      if (window.refreshDashboardData) window.refreshDashboardData();

      if (page === 'login' || page === 'register') {
        redirectToAccount();
      }
      return;
    }

    if ((page === 'dashboard' || page === 'account') && !authNavigationGuard.active) {
      redirectToLogin();
    }
  };

  const updateUserNameDisplay = () => {
    const user = auth.currentUser;
    if (!user) return;

    const name = user.displayName || 'Muslim User';
    document.querySelectorAll('#welcomeGreeting, #accountUserName, #accountName').forEach((el) => {
      if (el) {
        if (el.id === 'accountName') {
          el.textContent = name;
        } else {
          el.textContent = `Assalamu Alaikum, ${name} 🌙`;
        }
      }
    });

    const emailEls = document.querySelectorAll('#accountEmail, #accountInfoEmail');
    emailEls.forEach((el) => {
      if (el) el.textContent = user.email || 'No email available';
    });

    document.querySelectorAll('#accountTheme').forEach((el) => {
      if (el) el.textContent = localStorage.getItem('islamic-platform-theme') === 'dark' ? 'Dark' : 'Light';
    });
  };

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearValidationErrors();
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();
      const messageEl = document.getElementById('authMessage');
      const submitBtn = document.getElementById('loginSubmit');

      let hasError = false;
      if (!email || !validateEmail(email)) {
        hasError = true;
        showValidationError('loginEmail', 'Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        hasError = true;
        showValidationError('loginPassword', 'Password must be at least 6 characters.');
      }
      if (hasError) return;

      setLoadingState(submitBtn, true);
      try {
        await auth.signInWithEmailAndPassword(email, password);
        setMessage(messageEl, 'Login successful. Redirecting...', 'success');
        setTimeout(() => redirectToAccount(), 400);
      } catch (error) {
        let message = 'Login failed. Please try again.';
        if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
        if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
        if (error.code === 'auth/invalid-credential') message = 'Invalid login credentials.';
        setMessage(messageEl, message, 'error');
      } finally {
        setLoadingState(submitBtn, false);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearValidationErrors();
      const formData = new FormData(registerForm);
      const fullName = String(formData.get('fullName') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();
      const confirmPassword = String(formData.get('confirmPassword') || '').trim();
      const messageEl = document.getElementById('authMessage');
      const submitBtn = document.getElementById('registerSubmit');

      let hasError = false;
      if (!fullName || fullName.length < 2) {
        hasError = true;
        showValidationError('fullName', 'Please enter your full name.');
      }
      if (!email || !validateEmail(email)) {
        hasError = true;
        showValidationError('registerEmail', 'Please enter a valid email.');
      }
      if (!password || password.length < 6) {
        hasError = true;
        showValidationError('registerPassword', 'Password must be at least 6 characters.');
      }
      if (!confirmPassword || confirmPassword !== password) {
        hasError = true;
        showValidationError('confirmPassword', 'Passwords do not match.');
      }

      if (hasError) return;

      setLoadingState(submitBtn, true);
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: fullName });
        setMessage(messageEl, 'Account created successfully. Redirecting...', 'success');
        setTimeout(() => redirectToAccount(), 400);
      } catch (error) {
        let message = 'Registration failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') message = 'This email is already in use.';
        if (error.code === 'auth/weak-password') message = 'Please choose a stronger password.';
        setMessage(messageEl, message, 'error');
      } finally {
        setLoadingState(submitBtn, false);
      }
    });
  }

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
      }
    });
  });

  if (logoutButtons.length) {
    logoutButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await auth.signOut();
          window.location.href = 'login.html';
        } catch (error) {
          console.error('Logout failed', error);
        }
      });
    });
  }

  auth.onAuthStateChanged((user) => {
    handleAuthStateUpdate(user);
  });
});
