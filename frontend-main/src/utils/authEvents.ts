export const AUTH_EVENT_NAME = "authUpdated";
export const OPEN_LOGIN_EVENT_NAME = "openLogin";

export const authEvents = {
  dispatch: () => {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  },
  listen: (callback: () => void) => {
    window.addEventListener(AUTH_EVENT_NAME, callback);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, callback);
    };
  },
  openLogin: () => {
    window.dispatchEvent(new Event(OPEN_LOGIN_EVENT_NAME));
  },
  listenOpenLogin: (callback: () => void) => {
    window.addEventListener(OPEN_LOGIN_EVENT_NAME, callback);
    return () => {
      window.removeEventListener(OPEN_LOGIN_EVENT_NAME, callback);
    };
  },
};
