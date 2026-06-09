#!/bin/sh
set -e

# Cria banco SQLite se não existir
touch /var/www/database/database.sqlite

# Permissões — garante acesso de escrita
chmod -R 777 /var/www/database/
chmod -R 777 /var/www/storage/
chmod -R 777 /var/www/bootstrap/cache/

# Migrations + seed (se banco vazio)
php /var/www/artisan migrate --force
php /var/www/artisan db:seed --force --no-interaction || true

# Inicia serviços
exec supervisord -c /etc/supervisord.conf
