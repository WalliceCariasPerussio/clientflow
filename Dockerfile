FROM php:8.4-fpm-alpine

# Dependências do sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    nodejs \
    npm \
    sqlite-dev \
    git \
    && docker-php-ext-install pdo pdo_sqlite

# Config do Nginx
COPY nginx/default.conf /etc/nginx/http.d/default.conf

# Config do Supervisor
COPY supervisor/supervisord.conf /etc/supervisord.conf

# Copia projeto
WORKDIR /var/www
COPY . /var/www

# Permissões Laravel
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Instala dependências PHP
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --no-interaction --optimize-autoloader

# Build frontend
RUN cd frontend && npm ci && npm run build

# Gera key e prepara banco
RUN cp .env.example .env \
    && sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env \
    && echo 'DB_DATABASE=/var/www/database/database.sqlite' >> .env \
    && echo 'APP_URL=http://localhost' >> .env \
    && php artisan key:generate --force \
    && touch database/database.sqlite \
    && php artisan migrate --force \
    && php artisan db:seed --force

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
