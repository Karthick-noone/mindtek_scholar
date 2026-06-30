export const getCompanyUrl = () => {
  let url = window.location.origin;
  
  // Remove trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
};