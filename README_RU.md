<p align="center">
  <img src="assets/hero.svg" alt="Tashev Proof" width="100%">
</p>

# Tashev Proof — русская версия

**AI сказал «готово». Proof проверяет, так ли это.**

Tashev Proof — local-first система «доказательства готовности» для AI-разработки.

Главная проблема вайбкодинга: AI быстро пишет код и сообщает, что задача выполнена, но владельцу проекта всё равно приходится выяснять, что забыто, что сломано и можно ли выпускать результат.

Proof ставится между «AI закончил» и «выкатываем в бой».

<p align="center">
  <img src="assets/flow.svg" alt="Схема Tashev Proof" width="100%">
</p>

## Что он делает

Вы задаёте человеческую задачу:

~~~text
Добавить восстановление пароля
~~~

И описываете, что означает «готово»:

~~~text
✓ тесты авторизации проходят
✓ reset endpoint работает
✓ просроченный token отклоняется
✓ старый пароль перестаёт работать
✓ мобильный интерфейс проверен
~~~

Proof выполняет реальные доказательства и выдаёт:

- **PROVEN** — все обязательные пункты доказаны;
- **PARTIAL** — ошибок нет, но доказательств не хватает;
- **FAILED** — обязательная проверка провалилась.

## Быстрый старт

~~~bash
git clone https://github.com/tashev11/tashev-proof.git
cd tashev-proof
npm install -g .

cd your-project
proof init --task "Добавить восстановление пароля"
~~~

Отредактируйте:

~~~text
.proof/contract.json
~~~

Затем:

~~~bash
proof run
proof ship
~~~

<p align="center">
  <img src="assets/terminal.svg" alt="Tashev Proof результат" width="100%">
</p>

## Какие доказательства умеет собирать

<p align="center">
  <img src="assets/evidence.svg" alt="Типы доказательств Tashev Proof" width="100%">
</p>

**Command** — запускает существующие тесты, lint, build, Playwright, Cypress, pytest и любые project commands.

**File** — доказывает существование файла или нужного содержимого.

**HTTP** — реально обращается к API/health endpoint и проверяет status/body.

**Manual** — требует явного человеческого подтверждения там, где автоматизация нечестна: UX, визуал, бизнес-приёмка.

Пример:

~~~bash
proof attest mobile-ux \
  --note "Проверил форму на реальном iPhone" \
  --by "Rinat"
~~~

## Проверять только затронутое

Критерии могут быть связаны с файлами проекта.

После изменения:

~~~bash
proof run --since HEAD~3
~~~

Proof выбирает проверки, затронутые изменёнными файлами.

## Интеграция с Tashev Relay

Proof работает самостоятельно.

Но если рядом есть Tashev Relay, <code>proof init</code> автоматически подхватывает текущую задачу Relay.

<p align="center">
  <img src="assets/ecosystem.svg" alt="Экосистема Tashev" width="100%">
</p>

## Почему это не ещё один тестировщик

Тест отвечает:

> прошёл ли тест?

Proof отвечает:

> достаточно ли у нас доказательств, что исходная человеческая задача действительно завершена?

Он объединяет уже существующие тесты, API-проверки, браузерные сценарии и человеческую приёмку вокруг задачи.

## Безопасность

Proof может выполнять команды из <code>.proof/contract.json</code>. Поэтому contract из чужого непроверенного репозитория нужно читать перед запуском — так же, как package scripts или Makefile.

Proof не требует облака, не читает авторизацию AI и не отправляет evidence на внешний сервер. Секреты для HTTP можно брать из environment:

~~~json
{
  "Authorization": "Bearer {{env.PROOF_API_TOKEN}}"
}
~~~

## Команды

| Команда | Для чего |
| --- | --- |
| <code>proof init</code> | создать proof-contract |
| <code>proof plan</code> | проверить контракт |
| <code>proof run</code> | выполнить доказательства |
| <code>proof run --since REF</code> | проверить затронутую часть |
| <code>proof attest ID</code> | добавить человеческое доказательство |
| <code>proof revoke ID</code> | отозвать подтверждение |
| <code>proof status</code> | последний результат |
| <code>proof ship</code> | разрешить выпуск только при PROVEN |

Полная документация: [README.md](README.md) · [ROADMAP.md](ROADMAP.md) · [SECURITY.md](SECURITY.md)

---

**Don't trust “done”. Prove it.**
