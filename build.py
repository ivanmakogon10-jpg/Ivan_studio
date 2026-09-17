#!/usr/bin/env python3
"""Сборка сайта: dist/ — для публикации артефакта, standalone/ — обычный сайт."""
import pathlib, shutil

root = pathlib.Path(__file__).parent
src, dist, alone = root / 'src', root / 'dist', root / 'standalone'
head = (src / 'head.html').read_text('utf-8')
body = (src / 'body.html').read_text('utf-8')

for d in (dist, alone):
    d.mkdir(exist_ok=True)
    for name in ('styles.css', 'data.js', 'particles.js', 'shader-field.js', 'app.js'):
        shutil.copy(src / name, d / name)
    # изображения проектов
    assets_src = src / 'assets'
    if assets_src.is_dir():
        # *.source.* — исходники высокого разрешения: лежат в проекте,
        # но в собранный сайт не попадают, чтобы не утяжелять загрузку.
        # dirs_exist_ok: файлы перезаписываются на месте, каталог не
        # сносится — сборка не требует прав на удаление.
        shutil.copytree(assets_src, d / 'assets', dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns('*.source.*'))
    # сайты проектов: копируются как есть, своими файлами
    proj_src = src / 'projects'
    if proj_src.is_dir():
        shutil.copytree(proj_src, d / 'projects', dirs_exist_ok=True)

# Артефакт: скелет <html><head><body> добавляется платформой
(dist / 'index.html').write_text(head + '\n' + body, 'utf-8')

# Обычный сайт: полноценный документ и полный SEO-заголовок
SEO_TITLE = 'Иван Studio — цифровые продукты, которые хочется использовать'
head_site = head.replace('<title>Иван Studio</title>', f'<title>{SEO_TITLE}</title>')
(alone / 'index.html').write_text(
    '<!doctype html>\n<html lang="ru">\n<head>\n'
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + head_site +
    '</head>\n<body>\n' + body + '\n</body>\n</html>\n', 'utf-8')

print('собрано:', dist, alone)
