function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function getBrowserLang() {
  return (navigator.language || navigator.userLanguage || 'pt-BR').substring(0, 5);
}

module.exports = { escapeHtml: escapeHtml, getBrowserLang: getBrowserLang };
