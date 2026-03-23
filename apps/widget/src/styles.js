function getStyles(color, position) {
  var positions = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;',
  };
  var pos = positions[position] || positions['bottom-right'];

  return (
    '.ff-fab {' +
    '  position: fixed;' +
    '  ' + pos +
    '  width: 52px;' +
    '  height: 52px;' +
    '  border-radius: 50%;' +
    '  background: ' + color + ';' +
    '  border: none;' +
    '  cursor: pointer;' +
    '  z-index: 999999;' +
    '  display: flex;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  font-size: 22px;' +
    '  box-shadow: 0 4px 16px rgba(0,0,0,0.3);' +
    '  transition: transform 0.2s, box-shadow 0.2s;' +
    '  animation: ff-pulse 2s infinite;' +
    '}' +
    '.ff-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.4); }' +
    '@keyframes ff-pulse {' +
    '  0%,100% { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }' +
    '  50% { box-shadow: 0 4px 24px ' + color + '80; }' +
    '}' +
    '.ff-popup {' +
    '  position: fixed;' +
    '  ' + pos +
    '  width: 320px;' +
    '  background: #13131a;' +
    '  border: 1px solid #2a2a3a;' +
    '  border-radius: 16px;' +
    '  padding: 0;' +
    '  z-index: 999998;' +
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.5);' +
    '  animation: ff-slideUp 0.25s ease;' +
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
    '}' +
    '@keyframes ff-slideUp {' +
    '  from { opacity: 0; transform: translateY(12px); }' +
    '  to { opacity: 1; transform: translateY(0); }' +
    '}' +
    '.ff-popup-header {' +
    '  padding: 16px 20px;' +
    '  border-bottom: 1px solid #2a2a3a;' +
    '  display: flex;' +
    '  align-items: center;' +
    '  justify-content: space-between;' +
    '}' +
    '.ff-popup-title {' +
    '  font-size: 15px;' +
    '  font-weight: 600;' +
    '  color: #f0f0f5;' +
    '  margin: 0;' +
    '}' +
    '.ff-close {' +
    '  background: none;' +
    '  border: none;' +
    '  color: #5a5a72;' +
    '  font-size: 18px;' +
    '  cursor: pointer;' +
    '  padding: 0 4px;' +
    '  line-height: 1;' +
    '}' +
    '.ff-body { padding: 20px; }' +
    '.ff-stars {' +
    '  display: flex;' +
    '  gap: 6px;' +
    '  justify-content: center;' +
    '  margin-bottom: 16px;' +
    '}' +
    '.ff-star {' +
    '  font-size: 28px;' +
    '  cursor: pointer;' +
    '  color: #3a3a4a;' +
    '  transition: color 0.15s, transform 0.1s;' +
    '  line-height: 1;' +
    '}' +
    '.ff-star:hover, .ff-star.active { color: #f59e0b; }' +
    '.ff-star:active { transform: scale(0.9); }' +
    '.ff-textarea {' +
    '  width: 100%;' +
    '  background: #1a1a24;' +
    '  border: 1px solid #2a2a3a;' +
    '  border-radius: 8px;' +
    '  color: #f0f0f5;' +
    '  font-size: 13px;' +
    '  padding: 10px 12px;' +
    '  resize: vertical;' +
    '  min-height: 80px;' +
    '  font-family: inherit;' +
    '  box-sizing: border-box;' +
    '  margin-bottom: 12px;' +
    '  outline: none;' +
    '}' +
    '.ff-textarea:focus { border-color: ' + color + '; }' +
    '.ff-textarea::placeholder { color: #5a5a72; }' +
    '.ff-submit {' +
    '  width: 100%;' +
    '  background: ' + color + ';' +
    '  color: #fff;' +
    '  border: none;' +
    '  border-radius: 8px;' +
    '  padding: 10px;' +
    '  font-size: 14px;' +
    '  font-weight: 600;' +
    '  cursor: pointer;' +
    '  transition: opacity 0.15s;' +
    '}' +
    '.ff-submit:hover { opacity: 0.9; }' +
    '.ff-submit:disabled { opacity: 0.5; cursor: not-allowed; }' +
    '.ff-error { color: #ef4444; font-size: 12px; margin-bottom: 8px; text-align: center; }' +
    '.ff-thanks {' +
    '  text-align: center;' +
    '  padding: 24px 20px;' +
    '  animation: ff-slideUp 0.25s ease;' +
    '}' +
    '.ff-thanks-icon { font-size: 40px; margin-bottom: 8px; }' +
    '.ff-thanks-text { color: #f0f0f5; font-size: 15px; font-weight: 600; }' +
    '@media (max-width: 480px) {' +
    '  .ff-popup { width: calc(100vw - 32px); }' +
    '}'
  );
}

module.exports = { getStyles: getStyles };
