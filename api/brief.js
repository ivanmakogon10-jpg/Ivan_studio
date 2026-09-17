// Приём заявок с сайта → пересылка в Telegram.
//
// Токен бота и chat_id НЕ хранятся здесь. Они задаются как переменные
// окружения TG_TOKEN и TG_CHAT в настройках проекта на Vercel
// (Project Settings → Environment Variables). Этот файл их только читает.
//
// Как настроить бота и получить оба значения — см. README.md,
// раздел «Приём заявок».

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  const TG_TOKEN = process.env.TG_TOKEN;
  const TG_CHAT = process.env.TG_CHAT;

  if (!TG_TOKEN || !TG_CHAT) {
    // Функция задеплоена, но переменные окружения ещё не заданы.
    res.status(500).json({ ok: false, error: 'not-configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  // Простая защита от спам-ботов: скрытое поле "website" заполняют
  // только автоматические скрипты, живые посетители его не видят.
  if (body.website) {
    res.status(200).json({ ok: true });
    return;
  }

  const text = Object.entries(body)
    .filter(function (entry) { return entry[0] !== 'website' && String(entry[1] || '').trim(); })
    .map(function (entry) { return entry[0] + ': ' + String(entry[1]).trim(); })
    .join('\n')
    .slice(0, 3500); // запас под лимит Telegram (4096 символов)

  if (!text) {
    res.status(400).json({ ok: false, error: 'empty' });
    return;
  }

  try {
    const tgRes = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: '🆕 Новая заявка с сайта\n\n' + text
      })
    });
    if (!tgRes.ok) {
      res.status(502).json({ ok: false, error: 'telegram-error' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'network' });
  }
};
