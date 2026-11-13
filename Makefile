# Smarf — top-level developer entry points.
#
#   make install      install API + web dependencies, start the DB, run migrations
#   make install:api  composer install, api/.env, app key, Passport keys
#   make install:web  npm install, ui/.env
#   make start:api    API on http://mbp:13001 (all interfaces; mbp is Tailscale MagicDNS)
#   make start:web    web dev server on http://mbp:13000 (all interfaces)
#   make start:db     Docker MySQL on 127.0.0.1:3308 (root/root, database: smarf)
#
# PHP runs through Valet, which reads api/.valetrc for the version (php@8.1).
# Node runs through nvm, which reads ui/.nvmrc.

SHELL := /bin/bash
DOCKER_COMPOSE ?= docker compose

# Valet reads .valetrc only for a linked site named via --site, so install:api
# links api/ as "smarf" (https://smarf.test) the first time.
VALET_SITE := smarf
ifneq ($(shell command -v valet 2>/dev/null),)
HAS_VALET := 1
PHP := valet php --site=$(VALET_SITE)
COMPOSER := valet composer --site=$(VALET_SITE)
else
PHP := php
COMPOSER := composer
endif

# nvm is a shell function, so source it before `nvm use` reads .nvmrc.
define use_nvm
for candidate in "$${NVM_DIR:-$$HOME/.nvm}/nvm.sh" /opt/homebrew/opt/nvm/nvm.sh /usr/local/opt/nvm/nvm.sh; do \
	if [ -s "$$candidate" ]; then . "$$candidate"; break; fi; \
done; \
if command -v nvm >/dev/null 2>&1; then \
	nvm use >/dev/null 2>&1 || nvm install; \
	echo "==> Using node $$(node --version)"; \
else \
	echo "==> nvm not found; using $$(node --version 2>/dev/null || echo 'no node on PATH')"; \
fi
endef

.PHONY: help install install-api install-web migrate oauth-client start-api start-web start-db

help:
	@sed -n '3,9p' Makefile | sed 's/^# *//'

install: install-api install-web start-db migrate oauth-client
	@echo ""
	@echo "==> Fill in DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in api/.env, and DISCORD_CLIENT_ID in ui/.env."
	@echo "==> Done. Run 'make start:api' and 'make start:web' in separate terminals."

install-api:
	@echo "==> Installing API dependencies with '$(COMPOSER)'"
	@set -e; cd api; \
	if [ -n "$(HAS_VALET)" ] && [ ! -e "$$HOME/.config/valet/Sites/$(VALET_SITE)" ]; then \
		echo "==> Linking api/ as Valet site '$(VALET_SITE)' (may ask for your password)"; \
		valet link $(VALET_SITE); \
	fi; \
	if [ -n "$(HAS_VALET)" ] && ! ls "$$(brew --prefix)/opt/php@8.1/bin/php" >/dev/null 2>&1; then \
		echo "==> Installing php@8.1"; brew install shivammathur/php/php@8.1; \
	fi; \
	[ -f .env ] || { cp .env.example .env; echo "==> Created api/.env"; }; \
	$(COMPOSER) install; \
	if grep -q '^APP_KEY=$$' .env; then $(PHP) artisan key:generate; fi; \
	[ -f storage/oauth-private.key ] || $(PHP) artisan passport:keys

install-web:
	@echo "==> Installing web dependencies"
	@set -e; cd ui; \
	$(use_nvm); \
	[ -f .env ] || { cp .env.example .env; echo "==> Created ui/.env"; }; \
	npm install

migrate:
	@cd api && $(PHP) artisan migrate --force

# Discord sign-in hands out Passport personal access tokens, which need a
# personal access client. Create one once (skipped when one exists).
oauth-client:
	@set -e; cd api; \
	count=$$($(PHP) artisan tinker --execute 'echo DB::table("oauth_personal_access_clients")->count();' 2>/dev/null | tail -1); \
	if [ -n "$$count" ] && [ "$$count" != "0" ]; then echo "==> Passport personal access client already exists"; exit 0; fi; \
	$(PHP) artisan passport:client --personal --name="Smarf Personal Access Client" --no-interaction >/dev/null; \
	echo "==> Created a Passport personal access client"

start-api:
	@set -e; cd api; \
	if [ ! -f .env ]; then echo "api/.env is missing — run 'make install' first."; exit 1; fi; \
	$(PHP) artisan serve --host=0.0.0.0 --port=13001

start-web:
	@set -e; cd ui; \
	if [ ! -f .env ]; then echo "ui/.env is missing — run 'make install' first."; exit 1; fi; \
	$(use_nvm); \
	npm start

start-db:
	@echo "==> Starting MySQL on 127.0.0.1:3308 (root/root, database: smarf)"
	@$(DOCKER_COMPOSE) up -d --wait db

# Colon aliases. Escape colons only in target names: Make 3.81 keeps the
# backslash literally in prerequisite names (including .PHONY).
install\:api: install-api
install\:web: install-web
start\:api: start-api
start\:web: start-web
start\:db: start-db
