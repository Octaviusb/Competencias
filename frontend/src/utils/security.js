// XSS Protection utilities
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Safe component for rendering user content
export const SafeText = ({ children, ...props }) => {
  const safeContent = escapeHTML(children);
  return <span {...props} dangerouslySetInnerHTML={{ __html: safeContent }} />;
};