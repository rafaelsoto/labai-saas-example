(function () {
  var apiModule = require('./api');
  var FeedbackWidget = require('./widget');

  function init() {
    var scripts = document.querySelectorAll('script[data-api-key]');
    var scriptEl = scripts[scripts.length - 1];

    if (!scriptEl) return;

    var apiKey = scriptEl.getAttribute('data-api-key');
    var position = scriptEl.getAttribute('data-position') || null;
    var color = scriptEl.getAttribute('data-color') || null;

    var src = scriptEl.src || '';
    var apiUrl = src.replace('/api/widget/embed.js', '') || 'http://localhost:3333';

    if (!apiKey) {
      console.warn('[FeedbackFlow] data-api-key is required');
      return;
    }

    apiModule.fetchConfig(apiUrl, apiKey, function (err, config) {
      if (err) {
        console.warn('[FeedbackFlow] Failed to load config:', err.message);
        return;
      }

      var settings = config.settings || {};
      var widget = new FeedbackWidget({
        apiKey: apiKey,
        apiUrl: apiUrl,
        widget_color: color || settings.widget_color || '#6366f1',
        widget_position: position || settings.widget_position || 'bottom-right',
        prompt_text: settings.prompt_text || 'Como foi sua experiência?',
        thank_you_text: settings.thank_you_text || 'Obrigado pelo seu feedback!',
      });

      widget.init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
