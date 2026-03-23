const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateApiKey = () => `ff_proj_${crypto.randomBytes(16).toString('hex')}`;

const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

exports.seed = async function (knex) {
  await knex('api_keys_log').del();
  await knex('password_reset_tokens').del();
  await knex('feedbacks').del();
  await knex('projects').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await knex('users').insert([
    {
      name: 'Ana Silva',
      email: 'ana@example.com',
      password_hash: passwordHash,
      plan: 'pro',
    },
    {
      name: 'Bruno Costa',
      email: 'bruno@example.com',
      password_hash: passwordHash,
      plan: 'free',
    },
  ]).returning('*');

  const settings = JSON.stringify({
    widget_color: '#6366f1',
    widget_position: 'bottom-right',
    widget_language: 'pt-BR',
    prompt_text: 'Como foi sua experiência?',
    thank_you_text: 'Obrigado pelo seu feedback!',
  });

  const projects = await knex('projects').insert([
    {
      user_id: users[0].id,
      name: 'Meu E-commerce',
      url: 'https://meuecommerce.com.br',
      api_key: generateApiKey(),
      is_active: true,
      settings,
    },
    {
      user_id: users[0].id,
      name: 'Blog da Ana',
      url: 'https://blog.ana.com.br',
      api_key: generateApiKey(),
      is_active: true,
      settings,
    },
    {
      user_id: users[1].id,
      name: 'Portfólio Bruno',
      url: 'https://brunocosta.dev',
      api_key: generateApiKey(),
      is_active: true,
      settings,
    },
  ]).returning('*');

  const messages = [
    'Adorei o site! Muito fácil de usar.',
    'Interface confusa, não encontrei o que precisava.',
    'Bom, mas poderia ser melhor.',
    'Excelente experiência! Voltarei com certeza.',
    'O carregamento está lento.',
    null,
    'Produto de qualidade, entrega rápida.',
    'Suporte ao cliente muito atencioso.',
    null,
    'Precisa melhorar a navegação mobile.',
    'Muito bom! Recomendo para todos.',
    'Preços abusivos para a qualidade oferecida.',
    null,
    'Site bonito e funcional.',
    'Tive problemas no checkout.',
    'Superou minhas expectativas!',
    null,
    'Aceitável, nada especial.',
    'Péssima experiência, não comprarei novamente.',
    'Fantástico! 10/10',
  ];

  const pages = [
    'https://meuecommerce.com.br/',
    'https://meuecommerce.com.br/produtos',
    'https://meuecommerce.com.br/checkout',
    'https://meuecommerce.com.br/sobre',
    'https://blog.ana.com.br/post-1',
    'https://blog.ana.com.br/',
  ];

  const feedbacksData = [];
  for (let i = 0; i < 20; i++) {
    const projectIndex = i < 10 ? 0 : i < 15 ? 1 : 2;
    const rating = (i % 5) + 1;
    feedbacksData.push({
      project_id: projects[projectIndex].id,
      rating,
      message: messages[i],
      page_url: pages[i % pages.length],
      user_agent: 'Mozilla/5.0 (dev seed)',
      ip_address: '127.0.0.1',
      metadata: JSON.stringify({}),
      is_read: i < 5,
      created_at: randomDate(30),
    });
  }

  await knex('feedbacks').insert(feedbacksData);
};
