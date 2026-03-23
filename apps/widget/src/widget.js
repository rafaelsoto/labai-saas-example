var apiModule = require('./api');
var utilsModule = require('./utils');

function FeedbackWidget(config) {
  this.config = config;
  this.isOpen = false;
  this.selectedRating = 0;
  this.isSubmitting = false;
  this.isSubmitted = false;
  this.container = null;
  this.fab = null;
  this.popup = null;
  this.stars = [];
}

FeedbackWidget.prototype.init = function () {
  this._injectStyles();
  this._createFab();
};

FeedbackWidget.prototype._injectStyles = function () {
  var stylesModule = require('./styles');
  var css = stylesModule.getStyles(
    this.config.widget_color || '#6366f1',
    this.config.widget_position || 'bottom-right'
  );
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

FeedbackWidget.prototype._createFab = function () {
  var self = this;
  this.fab = document.createElement('button');
  this.fab.className = 'ff-fab';
  this.fab.innerHTML = '💬';
  this.fab.setAttribute('aria-label', 'Deixar feedback');
  this.fab.addEventListener('click', function () {
    if (self.isOpen) {
      self._closePopup();
    } else {
      self._openPopup();
    }
  });
  document.body.appendChild(this.fab);
};

FeedbackWidget.prototype._openPopup = function () {
  this.isOpen = true;
  this.isSubmitted = false;
  this.selectedRating = 0;

  var self = this;
  this.popup = document.createElement('div');
  this.popup.className = 'ff-popup';
  this.popup.innerHTML = this._buildPopupHtml();

  document.body.appendChild(this.popup);

  this.stars = this.popup.querySelectorAll('.ff-star');
  for (var i = 0; i < this.stars.length; i++) {
    (function (star, rating) {
      star.addEventListener('click', function () {
        self._selectRating(rating);
      });
      star.addEventListener('mouseover', function () {
        self._hoverStars(rating);
      });
    })(this.stars[i], i + 1);
  }

  this.popup.addEventListener('mouseleave', function () {
    self._hoverStars(self.selectedRating);
  });

  var closeBtn = this.popup.querySelector('.ff-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { self._closePopup(); });

  var form = this.popup.querySelector('.ff-form');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); self._submit(); });
};

FeedbackWidget.prototype._buildPopupHtml = function () {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span class="ff-star" data-rating="' + i + '" aria-label="' + i + ' estrelas">★</span>';
  }

  return (
    '<div class="ff-popup-header">' +
    '<p class="ff-popup-title">' + (utilsModule.escapeHtml(this.config.prompt_text) || 'Como foi sua experiência?') + '</p>' +
    '<button class="ff-close" aria-label="Fechar">✕</button>' +
    '</div>' +
    '<div class="ff-body">' +
    '<form class="ff-form">' +
    '<div class="ff-stars">' + stars + '</div>' +
    '<textarea class="ff-textarea" placeholder="Comentário (opcional)" maxlength="2000"></textarea>' +
    '<div class="ff-error" style="display:none"></div>' +
    '<button type="submit" class="ff-submit">Enviar feedback</button>' +
    '</form>' +
    '</div>'
  );
};

FeedbackWidget.prototype._selectRating = function (rating) {
  this.selectedRating = rating;
  this._hoverStars(rating);
};

FeedbackWidget.prototype._hoverStars = function (rating) {
  for (var i = 0; i < this.stars.length; i++) {
    if (i < rating) {
      this.stars[i].classList.add('active');
    } else {
      this.stars[i].classList.remove('active');
    }
  }
};

FeedbackWidget.prototype._submit = function () {
  if (this.isSubmitting) return;

  if (!this.selectedRating) {
    this._showError('Selecione uma nota antes de enviar.');
    return;
  }

  var textarea = this.popup.querySelector('.ff-textarea');
  var message = textarea ? textarea.value.trim() : '';
  var self = this;

  this.isSubmitting = true;
  var btn = this.popup.querySelector('.ff-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  apiModule.submitFeedback(
    this.config.apiUrl,
    {
      apiKey: this.config.apiKey,
      rating: this.selectedRating,
      message: message || null,
      page_url: window.location.href,
      metadata: {
        language: utilsModule.getBrowserLang(),
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      },
    },
    function (err) {
      self.isSubmitting = false;
      if (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Enviar feedback'; }
        self._showError('Erro ao enviar. Tente novamente.');
      } else {
        self._showThanks();
      }
    }
  );
};

FeedbackWidget.prototype._showError = function (msg) {
  var errEl = this.popup.querySelector('.ff-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
};

FeedbackWidget.prototype._showThanks = function () {
  var body = this.popup.querySelector('.ff-body');
  if (body) {
    body.innerHTML =
      '<div class="ff-thanks">' +
      '<div class="ff-thanks-icon">🎉</div>' +
      '<p class="ff-thanks-text">' + (utilsModule.escapeHtml(this.config.thank_you_text) || 'Obrigado!') + '</p>' +
      '</div>';
  }
  var self = this;
  setTimeout(function () { self._closePopup(); }, 2500);
};

FeedbackWidget.prototype._closePopup = function () {
  this.isOpen = false;
  if (this.popup) {
    this.popup.parentNode.removeChild(this.popup);
    this.popup = null;
  }
};

module.exports = FeedbackWidget;
