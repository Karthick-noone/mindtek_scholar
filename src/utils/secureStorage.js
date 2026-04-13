import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.REACT_APP_SECRET_KEY || "seasense_secret_key_2026";

//  Encrypt
const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

//  Decrypt
const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  } catch {
    return null;
  }
};

export const secureStorage = {
  // TOKEN
  setToken: (token) => {
    localStorage.setItem("authToken", encrypt(token));
  },

  getToken: () => {
    const data = localStorage.getItem("authToken");
    return data ? decrypt(data) : null;
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
  },


  // User (User)
  setUser: (data) => {
    localStorage.setItem("user", encrypt(data));
  },

  getUser: () => {
    const data = localStorage.getItem("user");
    return data ? decrypt(data) : null;
  },

  removeUser: () => {
    localStorage.removeItem("user");
  },

  // SCHOLAR (User)
  setScholar: (data) => {
    localStorage.setItem("scholar", encrypt(data));
  },

  getScholar: () => {
    const data = localStorage.getItem("scholar");
    return data ? decrypt(data) : null;
  },

  removeScholar: () => {
    localStorage.removeItem("scholar");
  },

  //  COMPANY
  setCompany: (data) => {
    localStorage.setItem("company", encrypt(data));
  },

  getCompany: () => {
    const data = localStorage.getItem("company");
    return data ? decrypt(data) : null;
  },

  removeCompany: () => {
    localStorage.removeItem("company");
  },

  //  WORK DETAILS
  setWork: (data) => {
    localStorage.setItem("work", encrypt(data));
  },

  getWork: () => {
    const data = localStorage.getItem("work");
    return data ? decrypt(data) : null;
  },

  removeWork: () => {
    localStorage.removeItem("work");
  },

  clear: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("scholar");
    localStorage.removeItem("company");
    localStorage.removeItem("work");
    localStorage.removeItem("user");
  }
};
