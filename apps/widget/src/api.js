function fetchConfig(apiUrl, apiKey, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiUrl + '/api/widget/config?apiKey=' + encodeURIComponent(apiKey), true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (e) {
          callback(new Error('Invalid response'));
        }
      } else {
        callback(new Error('Failed to load config: ' + xhr.status));
      }
    }
  };
  xhr.send();
}

function submitFeedback(apiUrl, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', apiUrl + '/api/widget/feedbacks', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 201 || xhr.status === 200) {
        callback(null, JSON.parse(xhr.responseText));
      } else {
        try {
          var err = JSON.parse(xhr.responseText);
          callback(new Error(err.error || 'Failed to submit feedback'));
        } catch (e) {
          callback(new Error('Failed to submit feedback'));
        }
      }
    }
  };
  xhr.send(JSON.stringify(data));
}

module.exports = { fetchConfig: fetchConfig, submitFeedback: submitFeedback };
