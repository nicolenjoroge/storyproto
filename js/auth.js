// ── AUTH — MSAL v2 ────────────────────────────────────────────────────────────
import { PublicClientApplication, InteractionRequiredAuthError } from
  'https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.esm.min.js';

const MSAL_CONFIG = {
  auth: {
    clientId:    'e7b4c1f3-119f-4a5c-9a83-eca6314a7926',
    authority:   'https://login.microsoftonline.com/6a28e8b9-ea23-417c-b7c9-7d38478b2a89',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation:        'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const LOGIN_REQUEST = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

let _msalInstance = null;
let _account      = null;

// ── INIT ──────────────────────────────────────────────────────────────────────
export async function initAuth() {
  _msalInstance = new PublicClientApplication(MSAL_CONFIG);
  await _msalInstance.initialize();

  // Handle redirect response on page load
  const response = await _msalInstance.handleRedirectPromise();
  if (response) {
    _account = response.account;
  }

  // Check if already signed in
  const accounts = _msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    _account = accounts[0];
    return _account;
  }

  // No session — redirect to Entra ID login
  await _msalInstance.loginRedirect(LOGIN_REQUEST);
  // Execution stops here — page will reload after login
  return null;
}

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
export function getAccount() {
  return _account;
}

// ── GET ACCESS TOKEN (for calling APIs later) ─────────────────────────────────
export async function getToken(scopes = LOGIN_REQUEST.scopes) {
  if (!_msalInstance || !_account) return null;
  try {
    const result = await _msalInstance.acquireTokenSilent({
      scopes,
      account: _account,
    });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      await _msalInstance.acquireTokenRedirect({ scopes, account: _account });
    }
    return null;
  }
}

// ── SIGN OUT ──────────────────────────────────────────────────────────────────
export async function signOut() {
  if (!_msalInstance || !_account) return;
  await _msalInstance.logoutRedirect({
    account: _account,
    postLogoutRedirectUri: window.location.origin,
  });
}