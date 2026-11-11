import fs from 'node:fs';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function runSetup() {
  console.log('\n================================================================');
  console.log('⚡ ДОБРО ПОЖАЛОВАТЬ В СЦЕНАРНЫЙ КОНСТРУКТОР SALES HARNESS');
  console.log('Полноценный цифровой экзоскелет руководителя продаж');
  console.log('================================================================\n');

  console.log('Выбери сценарии, которые хочешь активировать для себя:');
  console.log('1. [Telegram] Радар личек: фильтрация 60+ чатов, утренний бриф блокеров');
  console.log('2. [Telegram] Ловец обещаний: превращение фраз «скину/созвон» в таски');
  console.log('3. [Slack] Диспетчер команды: таймер 15 минут на отчет, селфи смен');
  console.log('4. [AmoCRM] Контроль воронки: трекинг этапов, защита от зависших сделок');
  console.log('5. [Bitrix24] Контроль очередей лидов и SLA первого звонка (< 5 мин)');
  console.log('6. [Календари] Google & Яндекс: защита прайм-тайма от лишних созвонов');
  console.log('7. [AI OKK] Авто-транскрипция звонков и скоринг сейлов по чек-листу');
  console.log('----------------------------------------------------------------');

  const selectedScenariosInput = await ask(
    'Введи номера нужных сценариев через запятую (например: 1,3,4,6) или Enter для ВСЕХ',
    '1,2,3,4,5,6,7'
  );

  const selected = selectedScenariosInput.split(',').map(s => s.trim());
  const config = {};

  // 1. БАЗОВЫЙ МОЗГ (GEMINI)
  console.log('\n--- 1. МОЗГ АССИСТЕНТА ---');
  console.log('Бесплатный ключ Google Gemini (безлимитные вызовы и отклик 400мс):');
  console.log('👉 https://aistudio.google.com/app/apikey');
  config.GEMINI_API_KEY = await ask('Вставь API-ключ Gemini');

  // 2. ТЕЛЕГРАМ БОТ ДЛЯ ПУШЕЙ
  console.log('\n--- 2. КУДА ПРИСЫЛАТЬ ОТЧЕТЫ И АЛЕРТЫ ---');
  console.log('1. Создай бота в @BotFather в Telegram за 30 секунд.');
  config.TELEGRAM_BOT_TOKEN = await ask('Токен Telegram-бота');
  console.log('2. Узнай свой Chat ID у бота @userinfobot:');
  config.TELEGRAM_ADMIN_CHAT_ID = await ask('Твой Telegram Chat ID (только цифры)');

  // СЦЕНАРИЙ 1 И 2: ТЕЛЕГРАМ ОТ СВОЕГО ЛИЦА
  if (selected.includes('1') || selected.includes('2')) {
    console.log('\n--- СЦЕНАРИЙ: ЧТЕНИЕ ЧАТОВ ОТ СВОЕГО ЛИЦА (USERBOT) ---');
    console.log('Позволяет ассистенту читать твои переписки, находить блокеры и ловить обещания.');
    const useUserbot = await ask('Подключить чтение чатов от твоего лица? (y/n)', 'y');
    if (useUserbot.toLowerCase() === 'y') {
      config.TELEGRAM_USER_PHONE = await ask('Твой номер телефона в Telegram (+7...)');
      config.TELEGRAM_API_ID = '2040';
      config.TELEGRAM_API_HASH = 'b18441a1ff607e10a989891a5462e627';
      config.ENABLE_PROMISE_CATCHER = 'true';
    }
  }

  // СЦЕНАРИЙ 3: SLACK
  if (selected.includes('3')) {
    console.log('\n--- СЦЕНАРИЙ: КОМАНДНЫЙ SLACK ---');
    console.log('Алерты менеджерам по регламенту отчетов и селфи.');
    config.SLACK_BOT_TOKEN = await ask('Slack Bot Token (xoxb-...) или нажми Enter чтобы пропустить', '');
    config.SLACK_ALERTS_CHANNEL = await ask('Канал для алертов команды', '#оп-оперативка');
    config.REPORT_DEADLINE_MINUTES = await ask('Сколько минут давать сейлу на отчет?', '15');
  }

  // СЦЕНАРИЙ 4: AMOCRM
  if (selected.includes('4')) {
    console.log('\n--- СЦЕНАРИЙ: AMOCRM ---');
    console.log('В AmoCRM: Настройки -> Интеграции -> Создать интеграцию (Долгосрочный токен).');
    config.AMOCRM_SUBDOMAIN = await ask('Поддомен AmoCRM (например: company)', '');
    config.AMOCRM_ACCESS_TOKEN = await ask('Долгосрочный токен AmoCRM', '');
    config.AMOCRM_PIPELINE_ID = await ask('ID основной воронки продаж (из адресной строки)', '');
  }

  // СЦЕНАРИЙ 5: БИТРИКС24
  if (selected.includes('5')) {
    console.log('\n--- СЦЕНАРИЙ: БИТРИКС24 ---');
    console.log('В Битрикс24: Разработчикам -> Другое -> Входящий вебхук (права crm).');
    config.BITRIX24_WEBHOOK_URL = await ask('URL входящего вебхука Битрикс24', '');
    config.LEAD_SLA_ALERT_MINUTES = await ask('Норматив первого звонка (минут)', '5');
  }

  // СЦЕНАРИЙ 6: КАЛЕНДАРИ
  if (selected.includes('6')) {
    console.log('\n--- СЦЕНАРИЙ: КАЛЕНДАРИ (GOOGLE / ЯНДЕКС) ---');
    console.log('Секретный адрес в формате iCal из настроек календаря:');
    config.GOOGLE_CALENDAR_ICAL_URL = await ask('Ссылка на Google Календарь (iCal)', '');
    config.YANDEX_CALENDAR_ICAL_URL = await ask('Ссылка на Яндекс Календарь (iCal, если есть)', '');
  }

  // СЦЕНАРИЙ 7: AI OKK
  if (selected.includes('7')) {
    console.log('\n--- СЦЕНАРИЙ: AI OKK И СКОРИНГ ЗВОНКОВ ---');
    config.ENABLE_AI_OKK_SCORING = 'true';
    console.log('✅ Модуль AI OKK активирован. Записи звонков будут расшифровываться и оцениваться.');
  }

  // ТАСК-ТРЕКЕР (WEEEK / NOTION)
  console.log('\n--- КУДА СТАВИТЬ ЗАДАЧИ ИЗ ОБЕЩАНИЙ ---');
  const tracker = await ask('Где ведешь задачи: weeek, notion или enter (пропустить)?', 'weeek');
  if (tracker.toLowerCase() === 'weeek') {
    config.WEEEK_API_TOKEN = await ask('Weeek API Token', '');
    config.WEEEK_PROJECT_ID = await ask('ID проекта в Weeek', '1');
  } else if (tracker.toLowerCase() === 'notion') {
    config.NOTION_API_KEY = await ask('Notion Secret Key', '');
    config.NOTION_DATABASE_ID = await ask('ID базы задач в Notion', '');
  }

  // ТАЙМИНГ УТРЕННЕГО БРИФА
  config.MORNING_BRIEF_TIME = await ask('\nВо сколько присылать утренний дайджест (МСК)?', '09:30');

  // СОХРАНЕНИЕ В .ENV
  let envFile = '# Сгенерировано сценарным конструктором Sales Harness\n\n';
  for (const [key, val] of Object.entries(config)) {
    envFile += `${key}="${val || ''}"\n`;
  }
  fs.writeFileSync('.env', envFile, 'utf-8');

  // СОХРАНЕНИЕ ВЫБРАННЫХ СЦЕНАРИЕВ
  const scenariosPayload = {
    selectedScenarios: selected,
    configuredAt: new Date().toISOString(),
  };
  fs.writeFileSync('config-active-scenarios.json', JSON.stringify(scenariosPayload, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log('🎉 СЦЕНАРНЫЙ КОНСТРУКТОР УСПЕШНО ЗАВЕРШИЛ НАСТРОЙКУ!');
  console.log('Конфиг записан в .env и config-active-scenarios.json.');
  console.log('Запуск ассистента:');
  console.log('  npm start');
  console.log('Проверка всех подключений:');
  console.log('  npm run test-connectors');
  console.log('================================================================\n');

  rl.close();
}

runSetup().catch((err) => {
  console.error('Ошибка в конструкторе:', err);
  rl.close();
});
