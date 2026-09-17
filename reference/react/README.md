# Оригинальный React-компонент ParticleDrift

Эффект пришёл как React + TypeScript компонент, который рендерит анимацию
внутри sandboxed iframe через `srcDoc`. Для Ivan Studio он **портирован**
в `src/particles.js` — без React, без iframe, без CDN-зависимостей.

Самих файлов `particle-drift.tsx` / `demo.tsx` здесь нет намеренно: сайт
собран на чистых HTML/CSS/JS, в сборку они не входят, а переписывать 500
строк TSX «на всякий случай» без возможности их проверить — плохая идея.
Исходник остался в переписке; скажите — положу файлы сюда отдельно.

## Если решите перейти на React

Компоненту нужен только React 18+. Других npm-зависимостей у него нет:
ни lucide-react, ни картинок. Tailwind, Iconify, GSAP и Google Fonts
подгружаются внутри изолированного iframe и в хост-приложение не попадают.

Развернуть проект:

```bash
npm create vite@latest ivan-studio-react -- --template react-ts
cd ivan-studio-react && npm install
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

В `vite.config.ts` добавить alias `@` на `./src`, в `tsconfig.json` —
`compilerOptions.paths` с `"@/*": ["./src/*"]`. После `shadcn init`
появится `components.json`, где путь компонентов по умолчанию —
`@/components/ui`. Положить `particle-drift.tsx` туда.

Папка **/components/ui** важна потому, что shadcn CLI при установке любого
компонента (`npx shadcn@latest add button`) кладёт файлы именно по пути из
`components.json`. Если держать компоненты в другом месте, импорты
сгенерированных компонентов (`@/components/ui/...`) не разрешатся, и каждый
установленный компонент придётся править руками.

## Что стоит поправить в оригинале

1. **Гонка при первом рендере.** `postMessage` в `useEffect` уходит до того,
   как документ внутри iframe успевает повесить слушатель `message`.
   Первое изменение `speed` / `opacity` теряется. Лечится отправкой по
   событию `load` у iframe.
2. **Мёртвые пропсы.** `gap` и `strokeWidth` принимаются и клампятся, но ни
   `patch`, ни `applyVisual` их не используют. `size` влияет только на
   толщину лучей.
3. **Нет поддержки `prefers-reduced-motion`.** Анимация идёт всегда.
4. **Балласт в строке.** Внутри `srcDoc` едет вся вёрстка чужого героя
   («Zenith Compute», метрика «128.6 PB/s»). Она скрыта правилом
   `[data-threeui-residual] { display: none }` и на экран не попадает, но
   ради неё грузятся Tailwind CDN, Iconify и GSAP, а GSAP ещё и анимирует
   скрытые узлы.
5. **Производительность.** 90 узлов дают ~4000 проверок расстояния на кадр
   плюс отдельный JS-контекст iframe.

В порте (`src/particles.js`) всё это учтено.
