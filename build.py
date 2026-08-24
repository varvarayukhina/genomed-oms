#!/usr/bin/env python3
"""Собирает index.html (превью для GitHub Pages) из block.html.

block.html — единственный источник правды: это ровно тот код, который
вставляется в виджет HTML на странице genomed.ru/about/oms/.
В превью убираем счётчик Яндекс.Метрики, чтобы тестовые открытия
не попадали в статистику сайта.
"""
from pathlib import Path
import re

block = Path("block.html").read_text(encoding="utf-8")

block = re.sub(r"<!-- Yandex\.Metrika counter -->.*?<!-- /Yandex\.Metrika counter -->",
               "<!-- Яндекс.Метрика убрана в превью -->", block, flags=re.S)

page = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Исследования по ОМС в «Геномед» — превью правок</title>
</head>
<body>
%s
</body>
</html>
""" % block

Path("index.html").write_text(page, encoding="utf-8")
print("index.html собран:", len(page), "символов")
