export const getBaseUrl = () => {
  const configuredBaseUrl = process.env.REACT_APP_BASE_URL || process.env.REACT_APP_API_URL || "";

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  let url = window.location.origin;

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
};

export const getCompanyUrl = () => {
  let url = window.location.origin;
  
  // Remove trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
};

export const getAssetUrl = (path = "") => {
  const baseUrl = getBaseUrl();

  if (!path) {
    return baseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}/${String(path).replace(/^\/+/, "")}`;
};