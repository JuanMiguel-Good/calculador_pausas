const listeners = [];
let currentRoute = location.hash.slice(1) || '/';

function parseRoute(hash) {
  const path = hash.startsWith('#') ? hash.slice(1) : hash;
  return path || '/';
}

export function navigate(path) {
  location.hash = path;
}

export function getCurrentRoute() {
  return parseRoute(location.hash);
}

export function onRouteChange(fn) {
  listeners.push(fn);
}

window.addEventListener('hashchange', () => {
  currentRoute = parseRoute(location.hash);
  listeners.forEach(fn => fn(currentRoute));
});

// Call all listeners with the initial route on page load
export function initRouter() {
  currentRoute = parseRoute(location.hash);
  listeners.forEach(fn => fn(currentRoute));
}
