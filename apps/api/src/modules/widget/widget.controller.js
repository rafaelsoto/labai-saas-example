const path = require('path');
const fs = require('fs');
const widgetService = require('./widget.service');

async function getConfig(req, res, next) {
  try {
    const apiKey = req.query.apiKey || req.project?.api_key;
    const config = await widgetService.getConfig(apiKey);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

async function createFeedback(req, res, next) {
  try {
    const feedback = await widgetService.createFeedback(req.project.id, req.body, req);
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
}

async function serveEmbed(req, res) {
  // Arquivo copiado para dentro da API para funcionar em qualquer ambiente de deploy
  const embedPath = path.resolve(__dirname, '../../../public/embed.js');

  // Permite que qualquer site externo carregue o script
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (fs.existsSync(embedPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(embedPath);
  } else {
    res.setHeader('Content-Type', 'application/javascript');
    res.send('/* FeedbackFlow Widget - run "npm run build" in apps/widget to generate */');
  }
}

module.exports = { getConfig, createFeedback, serveEmbed };
