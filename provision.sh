#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "=== BOSK CRM Stack Provisioning ==="
echo "=== Step 1: Prerequisites ==="
apt-get install -y -qq software-properties-common curl gnupg2 ca-certificates lsb-release apt-transport-https unzip git acl 2>&1 | tail -3

echo "=== Step 2: Add Repositories ==="
# PHP 8.4
add-apt-repository -y ppa:ondrej/php 2>&1 | tail -3

# PostgreSQL 16
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/pgdg.gpg
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - 2>&1 | tail -3

# Redis
apt-get update -qq

echo "=== Step 3: Install PHP 8.4 ==="
apt-get install -y -qq \
  php8.4-fpm php8.4-cli php8.4-pgsql php8.4-mbstring php8.4-xml \
  php8.4-curl php8.4-zip php8.4-gd php8.4-intl php8.4-bcmath \
  php8.4-redis php8.4-tokenizer php8.4-fileinfo php8.4-opcache 2>&1 | tail -3
php -v | head -1

echo "=== Step 4: Install PostgreSQL 16 ==="
apt-get install -y -qq postgresql-16 postgresql-client-16 2>&1 | tail -3
pg_lsclusters

echo "=== Step 5: Install Redis ==="
apt-get install -y -qq redis-server 2>&1 | tail -3
redis-cli ping

echo "=== Step 6: Install Nginx ==="
apt-get install -y -qq nginx 2>&1 | tail -3
nginx -v

echo "=== Step 7: Install Node 22 ==="
apt-get install -y -qq nodejs 2>&1 | tail -3
node -v
npm -v

echo "=== Step 8: Install Composer ==="
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer 2>&1 | tail -3
composer --version

echo "=== Step 9: Install Typesense ==="
curl -fsSL https://dl.typesense.org/releases/27.1/typesense-server-27.1-amd64.deb -o /tmp/typesense.deb
dpkg -i /tmp/typesense.deb 2>&1 | tail -3
rm /tmp/typesense.deb

echo "=== Step 10: Create app user ==="
if ! id -u bosk >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G www-data bosk
  echo "bosk:cr4z&KAC??" | chpasswd
fi

echo "=== Step 11: Create directories ==="
mkdir -p /var/www/bosk-crm/backend
mkdir -p /var/www/bosk-crm/frontend
mkdir -p /var/log/bosk-crm
chown -R bosk:www-data /var/www/bosk-crm
chown -R bosk:www-data /var/log/bosk-crm

echo "=== Step 12: Configure PostgreSQL ==="
su - postgres -c "psql -c \"CREATE USER bosk WITH PASSWORD 'cr4z&KAC??';\"" 2>&1 || true
su - postgres -c "psql -c \"CREATE DATABASE bosk_crm OWNER bosk;\"" 2>&1 || true
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE bosk_crm TO bosk;\"" 2>&1 || true

echo "=== Step 13: Configure Redis ==="
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf 2>/dev/null || true
sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

echo "=== Step 14: Configure PHP-FPM ==="
cat > /etc/php/8.4/fpm/pool.d/bosk.conf << 'PHPFPM'
[bosk]
user = bosk
group = www-data
listen = /run/php/php8.4-fpm-bosk.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 10
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
php_admin_value[error_log] = /var/log/bosk-crm/php-fpm.log
php_admin_flag[log_errors] = on
PHPFPM

echo "=== Step 15: Configure Nginx ==="
cat > /etc/nginx/sites-available/bosk-crm << 'NGINX'
server {
    listen 80;
    server_name bosk-crm.local 172.24.0.30;

    # Frontend (React SPA)
    root /var/www/bosk-crm/frontend/dist;
    index index.html;

    # API requests proxy to Laravel
    location /api {
        try_files $uri $uri/ /api/index.php?$query_string;
    }

    location /docs {
        try_files $uri $uri/ /api/index.php?$query_string;
    }

    # Laravel API
    location /api/index.php {
        internal;
        alias /var/www/bosk-crm/backend/public/index.php;
        fastcgi_pass unix:/run/php/php8.4-fpm-bosk.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/bosk-crm/backend/public/index.php;
        include fastcgi_params;
    }

    # Actually, simpler approach: separate location blocks
    location ~ \.php$ {
        root /var/www/bosk-crm/backend/public;
        fastcgi_pass unix:/run/php/php8.4-fpm-bosk.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/bosk-crm/nginx-access.log;
    error_log /var/log/bosk-crm/nginx-error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/bosk-crm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "=== Step 16: Configure Typesense ==="
mkdir -p /var/lib/typesense/data
cat > /etc/typesense/typesense-server.ini << 'TS'
[server]
api-address = 127.0.0.1
api-port = 8108
data-dir = /var/lib/typesense/data
api-key = bosk-typesense-key-2026
log-dir = /var/log/bosk-crm
TS

echo "=== Step 17: Start services ==="
systemctl enable --now postgresql 2>&1 || service postgresql start
systemctl enable --now redis-server 2>&1 || service redis-server start
systemctl enable --now php8.4-fpm 2>&1 || service php8.4-fpm start
systemctl enable --now nginx 2>&1 || service nginx start
# Typesense may need manual start in LXC
typesense-server --config=/etc/typesense/typesense-server.ini --daemon 2>&1 || true

echo ""
echo "=== PROVISIONING COMPLETE ==="
echo "PHP:        $(php -v | head -1)"
echo "PostgreSQL: $(psql --version)"
echo "Redis:      $(redis-cli --version)"
echo "Node:       $(node -v)"
echo "npm:        $(npm -v)"
echo "Composer:   $(composer --version 2>&1 | head -1)"
echo "Nginx:      $(nginx -v 2>&1)"
echo "Typesense:  $(typesense-server --version 2>&1 || echo 'installed')"
