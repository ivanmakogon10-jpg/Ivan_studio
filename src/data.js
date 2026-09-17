/* =============================================================
   ИВАН STUDIO — ДАННЫЕ САЙТА
   Единственный файл, который нужно править при обновлении контента.
   Логика интерфейса живёт в app.js и сюда не заглядывает.
   ============================================================= */

/* ---------- 0. САЙТ ---------- */
const SITE = {
  title: 'Ivan Studio — веб-дизайн и разработка',
  shortTitle: 'Ivan Studio',
  description: 'Ivan Studio — дизайн и разработка сайтов под ключ. UX/UI, цифровой дизайн и современные веб-интерфейсы.',
  // Укажите домен после публикации — тогда добавятся canonical и og:url.
  url: '',
  // Картинка для превью в мессенджерах и соцсетях, 1200×630.
  ogImage: ''
};

/* ---------- 0б. ПЕРВЫЙ ЭКРАН ----------
   Только типографика и поле частиц: устройства живут ниже,
   в секции живого показа проектов.
   heroProject — id проекта для счётчика «01 / 03» под заголовком.
*/
const HERO = {
  eyebrow: 'Цифровые продукты',
  // Заголовок построчно. accent: true — строка светлее и тоньше.
  lines: [
    { text: 'Цифровые' },
    { text: 'продукты,' },
    { text: 'которые хочется', soft: true },
    { text: 'использовать.', soft: true }
  ],
  text: 'Дизайн и разработка сайтов под ключ. От структуры и макетов до вёрстки и публикации — одним процессом.',
  primary: { label: 'Смотреть проекты', href: '#showcase' },
  secondary: { label: 'Обсудить проект', href: '#brief' },
  scroll: 'Листай',
  heroProject: 'karate',

  // Первый экран — только типографика и поле частиц.
  // Устройства появляются ниже, в секции живого показа проектов.
  heroRing: true
};

/* ---------- 0в. ВИТРИНА ПРОЕКТОВ ----------
   Секция, где из глубины выходят MacBook и iPhone, приближаются
   вместе при прокрутке и останавливаются крупной композицией:
   слева ноутбук, справа телефон. Внутри экранов — карточки работ,
   их переключают стрелки. Клик по экрану открывает сам сайт
   в новой вкладке.

   Сцена собирается в своей системе координат — «пластине».
   mac.screen / phone.screen — четыре угла экрана в координатах
   пластины (левый верх, правый верх, правый низ, левый низ).
   Меняете картинку устройства — пересчитайте углы.
*/
const SHOWCASE = {
  enabled: true,
  // Высота секции в vh: чем больше, тем длиннее приближение.
  height: 220,
  plate: { width: 1900, height: 860 },
  mac: {
    src: 'assets/hero/mac.webp',
    fallback: 'assets/hero/mac.png',
    alt: 'MacBook с работой Ivan Studio на экране',
    x: 0, y: 0, width: 1459, height: 848,
    screen: [[185, 12], [1272, 12], [1277, 633], [180, 633]]
  },
  phone: {
    src: 'assets/hero/iphone.webp',
    fallback: 'assets/hero/iphone.png',
    x: 1520, y: 246, width: 356, height: 602,
    screen: [[1637.2, 283.0], [1856.5, 254.9], [1766.8, 831.8], [1526.3, 800.9]]
  },
  // Логический размер карточки внутри экрана ноутбука и телефона.
  frame: { width: 1600, height: 910 },
  phoneFrame: { width: 430, height: 932 },

  // Заголовок над устройствами.
  title: 'Посмотрите мои работы',
  note: 'Стрелки листают проекты. Клик по экрану откроет сайт в новой вкладке.',
  noteFlat: 'Стрелки листают проекты. Нажмите на экран — сайт откроется в новой вкладке.',
  cta: 'Открыть сайт'
};

/* ---------- 1. КОНТАКТЫ ---------- */
const CONTACTS = {
  telegramHandle: '@ivxtxx',
  telegramUrl: 'https://t.me/ivxtxx',
  email: 'ivanmakogon10@gmail.com',
  phone: '+7 989 722-40-22',
  phoneHref: 'tel:+79897224022'
};

/* ---------- 2. ПРОЕКТЫ ----------
   id         уникальный ключ, попадает в адрес: #project-karate
   number     номер в портфолио
   title      название
   summary    короткое описание, видно в сетке
   categories массив категорий
   year       год ('' — не показывать)
   status     'released' — полноценный проект, 'soon' — место под будущий кейс
   cover      генеративная обложка, если нет своей картинки:
              'arc' | 'menu' | 'flow' | 'ghost'
   letter     буква для обложки 'ghost'
   media      картинки проекта. Любое поле можно оставить null / [].
              preview  — обложка в сетке и шапка кейса
              desktop  — десктопный экран внутри кейса
              mobile   — мобильный экран внутри кейса
              gallery  — [{ src, alt }] дополнительные изображения
   span       место в сетке: колонки и пропорция плитки
   case       материалы кейса. Пустое значение = «Раздел в подготовке».
*/
const PROJECTS = [
  {
    id: 'karate',
    number: '01',
    title: 'Кэмпо',
    sector: 'Спорт',
    summary: 'Сайт клуба каратэ JKA в Донецке.',
    categories: ['Веб-дизайн', 'Разработка'],
    year: '',
    status: 'released',
    cover: 'arc',
    media: {
      // Реальный скриншот проекта: сетка работ и кейс.
      preview: 'assets/projects/kempo/kempo-desktop.jpg',
      desktop: 'assets/projects/kempo/kempo-desktop.jpg',
      // Появится мобильный скриншот — положите сюда, он встанет в кейс.
      mobile: null,
      gallery: []
    },
    span: { col: 'span 12', ratio: '16 / 7' },
    // Живой сайт внутри showcase: путь относительный, works на GitHub Pages
    live: {
      path: 'projects/kempo/index.html', label: 'KEMPO', meta: 'Спорт / Веб-дизайн',
      card: 'Клуб каратэ JKA в Донецке: расписание, тренеры, запись на тренировку.',
      shot: 'assets/projects/kempo/kempo-desktop.jpg',
      mobile: 'assets/projects/mobile/kempo-mobile.jpg'
    },
    case: {
      role: ['Дизайн', 'Разработка'],
      task: '',
      solution: '',
      stack: [],
      process: [],
      // Что было сделано в проекте — короткий чек-лист в кейсе.
      // Заполните своими пунктами, пустой массив ничего не выводит.
      deliverables: [],
      // Ссылка на живой сайт: появится кнопка «Перейти на сайт →»
      url: ''
    }
  },
  {
    id: 'restaurant',
    number: '02',
    title: 'NOIR TABLE',
    sector: 'Ресторан',
    summary: 'Сайт камерного ресторана европейской кухни.',
    categories: ['Веб-дизайн', 'UX/UI'],
    year: '',
    status: 'released',
    cover: 'menu',
    media: {
      preview: 'assets/projects/noir-table/noir-desktop.jpg',
      desktop: 'assets/projects/noir-table/noir-desktop.jpg',
      mobile: null, gallery: []
    },
    span: { col: 'span 4', ratio: '4 / 3' },
    live: {
      path: 'projects/noir-table/index.html', label: 'NOIR TABLE', meta: 'Ресторан / Веб-дизайн',
      card: 'Камерный ресторан: меню, фирменное блюдо, бронирование столика.',
      shot: 'assets/projects/noir-table/noir-desktop.jpg',
      mobile: 'assets/projects/mobile/noir-mobile.jpg'
    },
    case: {
      role: ['Дизайн', 'UX/UI'],
      task: '',
      solution: '',
      stack: [],
      process: [],
      deliverables: [],
      url: ''
    }
  },
  {
    id: 'business-landing',
    number: '03',
    title: 'NORTH & CO.',
    sector: 'Бизнес',
    summary: 'Лендинг студии бизнес-решений.',
    categories: ['Веб-дизайн', 'Разработка'],
    year: '',
    status: 'released',
    cover: 'flow',
    media: {
      preview: 'assets/projects/north-co/north-desktop.jpg',
      desktop: 'assets/projects/north-co/north-desktop.jpg',
      mobile: null, gallery: []
    },
    span: { col: 'span 4', ratio: '4 / 3' },
    live: {
      path: 'projects/north-co/index.html', label: 'NORTH & CO.', meta: 'Бизнес / Веб-дизайн',
      card: 'Лендинг студии бизнес-решений: услуги, процесс, заявка.',
      shot: 'assets/projects/north-co/north-desktop.jpg',
      mobile: 'assets/projects/mobile/north-mobile.jpg'
    },
    case: {
      role: ['Дизайн', 'Разработка'],
      task: '',
      solution: '',
      stack: [],
      process: [],
      deliverables: [],
      url: ''
    }
  }
];

/* ---------- 3. КОНЦЕПТУАЛЬНЫЕ ПРОЕКТЫ ----------
   Пока status: 'soon' — проект показывается в панели «Концептуальные проекты»
   с пометкой «Скоро» и не открывается.
   Чтобы превратить его в полноценный кейс: заполните media и case,
   поставьте status: 'released' и span — карточка сама встанет в сетку работ.
*/
const CONCEPTS = [
  {
    id: 'aura', number: '04', title: 'AURA',
    summary: '', categories: ['Концепт-проект'], year: '',
    status: 'soon', cover: 'ghost', letter: 'A',
    media: { preview: null, desktop: null, mobile: null, gallery: [] },
    span: { col: 'span 4', ratio: '4 / 3' },
    case: { role: [], task: '', solution: '', stack: [], process: [] }
  },
  {
    id: 'mono', number: '05', title: 'MONO',
    summary: '', categories: ['Концепт-проект'], year: '',
    status: 'soon', cover: 'ghost', letter: 'M',
    media: { preview: null, desktop: null, mobile: null, gallery: [] },
    span: { col: 'span 4', ratio: '4 / 3' },
    case: { role: [], task: '', solution: '', stack: [], process: [] }
  },
  {
    id: 'pulse', number: '06', title: 'PULSE',
    summary: '', categories: ['Концепт-проект'], year: '',
    status: 'soon', cover: 'ghost', letter: 'P',
    media: { preview: null, desktop: null, mobile: null, gallery: [] },
    span: { col: 'span 4', ratio: '4 / 3' },
    case: { role: [], task: '', solution: '', stack: [], process: [] }
  }
];

/* ---------- 4. ПОДХОД ---------- */
const APPROACH = [
  {
    number: '01',
    title: 'Исследование',
    label: 'ИССЛЕДОВАНИЕ',
    text: 'Понимание задачи, аудитории и контекста.',
    detail: 'Смотрю, чем живёт ниша, что делают соседи по рынку и какой сценарий приводит человека на сайт.'
  },
  {
    number: '02',
    title: 'Структура',
    label: 'СТРУКТУРА',
    text: 'Информационная архитектура и логика взаимодействия.',
    detail: 'Порядок блоков, глубина разделов, точки принятия решения. Сетка появляется раньше картинки.'
  },
  {
    number: '03',
    title: 'Интерфейс',
    label: 'ИНТЕРФЕЙС',
    text: 'Визуальная система, типографика и UI.',
    detail: 'Шкала размеров, токены цвета, состояния элементов. Одна система вместо набора экранов.'
  },
  {
    number: '04',
    title: 'Движение',
    label: 'ДВИЖЕНИЕ',
    text: 'Микровзаимодействия и анимация, которые помогают интерфейсу.',
    detail: 'Анимация отвечает на действие и подсказывает, что произошло. Всё лишнее выключается.'
  }
];

/* ---------- 5. О СТУДИИ ----------
   portrait: путь к фотографии. null — показывается место под фото.
*/
const ABOUT = {
  label: 'Цифровой дизайн',
  lead: 'Ivan Studio — независимая студия. За каждым проектом один человек, который делает и дизайн, и разработку.',
  text: 'Создаю цифровые продукты: сайты, интерфейсы и визуальные системы, которые работают на задачу и на людей.',
  how: 'Вы работаете напрямую с исполнителем. Без менеджеров между вами и макетом, без потерь смысла на переходе от дизайна к вёрстке — все вопросы решаются в одном чате.',
  portrait: null,
  roles: [
    'Дизайн интерфейсов',
    'Дизайн цифровых продуктов',
    'Вёрстка и фронтенд',
    'Визуальные системы'
  ],
  kicker: 'Делать продукты, которыми хочется пользоваться.',
  meta: [
    { k: 'НАПРАВЛЕНИЕ', v: 'Веб-дизайн / Разработка' },
    { k: 'УСЛУГИ',      v: 'Сайты под ключ, UX/UI' },
    { k: 'ГОД',         v: '2026' }
  ]
};

/* ---------- 6. УСЛУГИ ---------- */
const SERVICES = [
  {
    id: 'landing',
    label: 'ЛЕНДИНГ',
    title: 'Лендинг',
    price: 25000,
    scope: 'Одна страница, один сценарий: первый экран, аргументы, форма.'
  },
  {
    id: 'corporate',
    label: 'КОРПОРАТИВНЫЙ САЙТ',
    title: 'Корпоративный сайт',
    price: 45000,
    scope: 'Многостраничная структура, разделы, каталог услуг, редактируемый контент.'
  },
  {
    id: 'shop',
    label: 'ИНТЕРНЕТ-МАГАЗИН',
    title: 'Интернет-магазин',
    price: 65000,
    scope: 'Каталог, карточка товара, корзина, оформление заказа.'
  },
  {
    id: 'turnkey',
    label: 'САЙТ ПОД КЛЮЧ',
    title: 'Сайт под ключ',
    price: 50000,
    scope: 'Дизайн, вёрстка, сборка, домен и публикация — одним процессом.'
  },
  {
    id: 'uxui',
    label: 'UX/UI ДИЗАЙН',
    title: 'UX/UI дизайн',
    price: 20000,
    scope: 'Структура, прототип, интерфейс и макеты под передачу в разработку.'
  }
];

const SERVICES_NOTE = 'Итоговая стоимость зависит от задачи, объёма и сложности проекта.';

/* ---------- 6б. ПОЛЕ ЧАСТИЦ ----------
   Фон первого экрана. enabled: false — выключить целиком.
   density      множитель количества точек (0.4 — редко, 2 — плотно)
   speed        множитель скорости дрейфа
   linkDistance до какого расстояния в px соединять соседей
   pointerRadius радиус реакции на курсор, 0 — отключить отклик
   dotSize      базовый радиус точки в px
   bigShare     доля крупных «звёзд» (0 — все точки одинаковые)
   glow         сила ореола вокруг крупных точек, 0 — выключить
   dotAlpha     прозрачность точек
   linkAlpha    прозрачность связей между точками
   pointerPush  на сколько px ближние точки отходят от курсора
   twinkle      сила редкого мерцания (0 — выключить)
   opacity      общая прозрачность слоя
*/
const PARTICLES = {
  enabled: true,
  density: 0.95,
  speed: 0.85,
  linkDistance: 126,
  pointerRadius: 200,
  dotSize: 1.75,
  bigShare: 0.26,
  glow: 1,
  dotAlpha: 0.92,
  linkAlpha: 0.42,
  pointerPush: 18,
  twinkle: 0.5,
  opacity: 1
};

/* ---------- 7б. ФОН СТРАНИЦЫ ----------
   Neuro-noise: тонкие светящиеся нити на тёмном поле, единым
   канвасом на весь экран (см. .page-shader в styles.css). Проявляется
   при входе в «Посмотрите мои работы» и дальше идёт фоном до подвала —
   эта часть сайта всегда тёмная, независимо от переключателя темы.
   Модуль лежит в shader-field.js и ничего не знает о сайте: кадры
   ставит на паузу во вкладке в фоне и при prefers-reduced-motion
   (тогда рисуется один статичный кадр).
     scale     во сколько раз меньше CSS-размера рендерится канвас
               (ниже — легче для GPU, изображение мягче)
     speed     скорость течения поля
     detail    число слоёв узора (3–7): больше — тоньше нити, дороже
     intensity сила отклика поля на курсор
     opacity   верхняя граница прозрачности узора (сама прозрачность
               плавно нарастает по прокрутке от витрины — см. app.js)
     mobile    те же ключи с более лёгкими значениями для узких экранов
               (телефон/планшет) — там же поле теперь тоже включено */
/* opacity занижена относительно первых версий: при 0.9+ яркие нити
   слишком часто проходили прямо под текстом секций и мешали читать —
   see «текст на этом фоне надо контрастнее» (правка от 2026-09). */
const SHADER_FIELD = {
  enabled: true,
  scale: 0.65,
  speed: 0.85,
  detail: 5,
  intensity: 1,
  opacity: 0.6,
  mobile: {
    scale: 0.5,
    detail: 4,
    intensity: 0.55,
    opacity: 0.5
  }
};

/* ---------- 8. БРИФ ---------- */
const BRIEF_STEPS = [
  {
    id: 'product',
    number: '01',
    short: 'Что нужно создать?',
    question: 'Что нужно создать?',
    type: 'choice',
    options: ['Лендинг', 'Корпоративный сайт', 'Интернет-магазин', 'Цифровой продукт', 'Другое']
  },
  {
    id: 'work',
    number: '02',
    short: 'Что нужно сделать?',
    question: 'Что нужно сделать?',
    type: 'choice',
    options: ['Только дизайн', 'Только разработка', 'Дизайн + разработка']
  },
  {
    id: 'budget',
    number: '03',
    short: 'Какой бюджет?',
    question: 'Какой ориентировочный бюджет?',
    type: 'choice',
    options: ['25–50 тыс. ₽', '50–100 тыс. ₽', '100–200 тыс. ₽', '200 тыс. ₽+']
  },
  {
    id: 'timing',
    number: '04',
    short: 'Когда запуск?',
    question: 'Когда планируете запуск?',
    type: 'choice',
    options: ['Как можно скорее', 'В течение месяца', '1–2 месяца', 'Пока изучаю варианты']
  },
  {
    id: 'contact',
    number: '05',
    short: 'Контакты',
    question: 'Как с вами связаться?',
    type: 'contact',
    fields: [
      { id: 'name', label: 'Имя', type: 'text', autocomplete: 'name', required: true }
    ],
    /* Раньше здесь было 3 отдельных поля (Telegram/Телефон/Email), которые
       нужно было заполнять по очереди. Теперь один способ связи выбирается
       ярлыком-переключателем (см. renderStep() в app.js), и значение
       вводится в одно поле #f-contact, у которого меняются type/placeholder
       в зависимости от выбранного способа. */
    contactMethods: [
      { id: 'telegram', label: 'Telegram', type: 'text',  autocomplete: 'off',   placeholder: '@username' },
      { id: 'phone',    label: 'Телефон',  type: 'tel',   autocomplete: 'tel',   placeholder: '+7 900 000-00-00' },
      { id: 'email',    label: 'Почта',    type: 'email', autocomplete: 'email', placeholder: 'you@mail.ru' }
    ],
    hint: 'Выберите способ связи и оставьте контакт.'
  },
  {
    id: 'about',
    number: '06',
    short: 'Описание',
    question: 'Расскажите немного о проекте',
    type: 'text',
    placeholder: 'Чем занимаетесь, что уже есть, на что стоит посмотреть.',
    hint: 'Необязательно, но помогает ответить по делу.'
  }
];

/* =============================================================
   9. ОТПРАВКА ЗАЯВКИ

   БЕЗОПАСНОСТЬ. Любой ключ, токен или пароль, помещённый в этот
   файл, виден каждому посетителю сайта: код отдаётся браузеру
   как есть. Поэтому здесь указывается ТОЛЬКО адрес приёмника.
   Секреты (токен Telegram-бота, ключ CRM, пароль SMTP) должны
   лежать на сервере — в serverless-функции, на бэкенде или в
   переменных окружения хостинга.

   Обработчик уже готов: api/brief.js в корне репозитория —
   serverless-функция для Vercel, пересылает заявку в Telegram.
   Токен бота и chat_id задаются в переменных окружения хостинга
   (TG_TOKEN, TG_CHAT), в коде их нет. Подробности — README.md,
   раздел «Приём заявок».

   Пока сайт не задеплоен на Vercel (или переменные окружения там
   не заданы), форма честно сообщает, что приём заявок ещё не
   подключён, и предлагает написать напрямую.
   ============================================================= */
const BRIEF_ENDPOINT = '/api/brief';

/**
 * Отправляет заявку.
 * @returns {Promise<{delivered: boolean, reason?: string}>}
 *   delivered: true  — сервер принял заявку;
 *   delivered: false — приём не настроен (reason: 'not-configured').
 *   Ошибка сети или ответ сервера с кодом ошибки → исключение.
 */
async function submitBrief(payload) {
  if (!BRIEF_ENDPOINT) {
    return { delivered: false, reason: 'not-configured' };
  }
  const res = await fetch(BRIEF_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Сервер ответил ' + res.status);
  return { delivered: true };
}
