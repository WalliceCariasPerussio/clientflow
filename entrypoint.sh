#!/bin/sh
set -e

# Cria banco SQLite se não existir
touch /var/www/database/database.sqlite
chmod 777 /var/www/database/database.sqlite

# Permissões
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Migrations + seed (se banco vazio)
php /var/www/artisan migrate --force
php /var/www/artisan db:seed --force --no-interaction || true

# Inicia serviços
exec supervisord -c /etc/supervisord.conf
