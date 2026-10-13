let sessionTimer = null;

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + (4 - (base64.length % 4)) % 4,
      "="
    );

    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
}

export function stopSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

export function startSessionTimer(logoutCallback) {
  stopSessionTimer();

  const token = localStorage.getItem("haigana_token");

  if (!token) {
    return;
  }

  const payload = decodeToken(token);

  if (!payload || !payload.exp) {
    return;
  }

  const expirationTime = payload.exp * 1000;
  const remainingTime = expirationTime - Date.now();

  // Token déjà expiré
  if (remainingTime <= 0) {
    logoutCallback();
    return;
  }

  sessionTimer = setTimeout(() => {
    logoutCallback();
  }, remainingTime);
}