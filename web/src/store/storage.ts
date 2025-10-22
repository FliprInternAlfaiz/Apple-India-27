const storageSession = {
  getItem: (key: string) => {
    return Promise.resolve(sessionStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    sessionStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default storageSession;
