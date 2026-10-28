// Shared navigation: reads the current session from the Express backend.
// The same menu is displayed on every page, including Login and Register.
(async function renderNavigation() {
  const holder = document.getElementById('site-navigation');
  if (!holder) return;
  let username = null;
  try {
    const response = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      username = data.loggedIn ? data.username : null;
    }
  } catch (error) {
    console.warn('Unable to check login status:', error);
  }
  const links = [
    ['/', 'Home'], ['/destinations.html', 'Destinations'],
    ['/tips.html', 'Travel Tips'], ['/about.html', 'About']
  ];
  if (username) {
    links.push(['/profile', 'My Profile'], ['/logout', 'Logout']);
  } else {
    links.push(['/login.html', 'Login'], ['/register.html', 'Register']);
  }
  const current = window.location.pathname;
  const nav = document.createElement('nav');
  nav.className = 'navigation shared-navigation';
  nav.setAttribute('aria-label', 'Main navigation');
  for (const [href, label] of links) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    if (current === href || (current === '/index.html' && href === '/')) {
      anchor.classList.add('active');
      anchor.setAttribute('aria-current', 'page');
    }
    nav.appendChild(anchor);
  }
  if (username) {
    const welcome = document.createElement('span');
    welcome.className = 'nav-welcome';
    welcome.textContent = 'Hi, ' + username;
    nav.appendChild(welcome);
  }
  holder.replaceChildren(nav);
})();
