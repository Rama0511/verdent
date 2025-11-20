# Panduan Deployment Verdant PKK Agropark Lampung
## Production Server: http://agroparkpkklampung.my.id (157.10.161.46)

---

## PERSIAPAN LOKAL

### 1. Update vite.config.ts untuk Production Build
Buat file `vite.config.production.ts` atau update yang ada untuk production.

### 2. Build Frontend untuk Production
```bash
npm run build
```
Ini akan generate file static di `public/build/`

### 3. Git Setup & Push ke Repository

#### Buat .gitignore (jika belum ada)
```bash
# Pastikan file ini ada di root project
echo ".env
.env.production
/node_modules
/public/hot
/public/storage
/storage/*.key
/vendor
.phpunit.result.cache
npm-debug.log
yarn-error.log" > .gitignore
```

#### Initialize Git & Push
```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit - Verdant PKK Agropark production ready"

# Tambahkan remote (ganti dengan repo Anda)
# Contoh menggunakan GitHub:
git remote add origin https://github.com/username/verdant-pkkl.git

# Push ke repository
git push -u origin main
```

---

## DEPLOYMENT DI SERVER (157.10.161.46)

### 1. Koneksi ke Server
```bash
ssh root@157.10.161.46
# atau
ssh user@157.10.161.46
```

### 2. Install Dependencies di Server

#### Update sistem
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install PHP 8.2+ dan Extensions
```bash
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl
```

#### Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### Install Node.js & NPM (untuk build)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

#### Install Nginx
```bash
sudo apt install -y nginx
```

### 3. Setup Database di Server
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE verdant_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'verdant_user'@'localhost' IDENTIFIED BY 'PASSWORD_ANDA_DISINI';
GRANT ALL PRIVILEGES ON verdant_production.* TO 'verdant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Clone Project dari Repository
```bash
# Masuk ke directory web
cd /var/www/

# Clone repository
git clone https://github.com/username/verdant-pkkl.git verdant
cd verdant

# Set permissions
sudo chown -R www-data:www-data /var/www/verdant
sudo chmod -R 755 /var/www/verdant
sudo chmod -R 775 /var/www/verdant/storage
sudo chmod -R 775 /var/www/verdant/bootstrap/cache
```

### 5. Setup Environment di Server
```bash
# Copy .env.production menjadi .env
cp .env.production .env

# Edit .env dan isi:
# - APP_KEY (akan di-generate)
# - DB_PASSWORD
nano .env
```

### 6. Install Dependencies & Setup Laravel
```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (detection labels)
php artisan db:seed --class=DetectionLabelSeeder

# Create storage link
php artisan storage:link

# Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Konfigurasi Nginx

#### Buat file konfigurasi Nginx
```bash
sudo nano /etc/nginx/sites-available/verdant
```

#### Isi dengan:
```nginx
server {
    listen 80;
    server_name agroparkpkklampung.my.id www.agroparkpkklampung.my.id;
    root /var/www/verdant/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Increase upload limit
    client_max_body_size 20M;
}
```

#### Aktivasi site
```bash
sudo ln -s /etc/nginx/sites-available/verdant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Setup SSL (Optional tapi Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d agroparkpkklampung.my.id -d www.agroparkpkklampung.my.id
```

### 9. Setup Cron untuk Laravel Scheduler
```bash
sudo crontab -e
```

Tambahkan:
```
* * * * * cd /var/www/verdant && php artisan schedule:run >> /dev/null 2>&1
```

### 10. Setup Supervisor untuk Queue Worker (Optional)
```bash
sudo apt install -y supervisor

sudo nano /etc/supervisor/conf.d/verdant-worker.conf
```

Isi:
```ini
[program:verdant-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/verdant/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/verdant/storage/logs/worker.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start verdant-worker:*
```

---

## BUAT USER ADMIN PERTAMA

```bash
cd /var/www/verdant
php artisan tinker
```

```php
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@agroparkpkklampung.my.id';
$user->password = bcrypt('password123'); // Ganti dengan password kuat
$user->role = 'admin';
$user->email_verified_at = now();
$user->save();
exit;
```

---

## UPDATE KODE (Jika ada perubahan)

### Di Lokal:
```bash
git add .
git commit -m "Update fitur xyz"
git push origin main
```

### Di Server:
```bash
cd /var/www/verdant
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart nginx
```

---

## MONITORING & MAINTENANCE

### Cek Logs
```bash
# Laravel logs
tail -f /var/www/verdant/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Clear Cache (jika ada masalah)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Backup Database (Recommended - Rutin)
```bash
# Buat script backup
sudo nano /root/backup-verdant.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
mysqldump -u verdant_user -p verdant_production > $BACKUP_DIR/verdant_$TIMESTAMP.sql
find $BACKUP_DIR -name "verdant_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup-verdant.sh
crontab -e
# Tambahkan: 0 2 * * * /root/backup-verdant.sh
```

---

## TROUBLESHOOTING

### Permission Issues
```bash
sudo chown -R www-data:www-data /var/www/verdant
sudo chmod -R 755 /var/www/verdant
sudo chmod -R 775 /var/www/verdant/storage
sudo chmod -R 775 /var/www/verdant/bootstrap/cache
```

### 500 Error
```bash
# Cek logs
tail -f /var/www/verdant/storage/logs/laravel.log

# Pastikan .env sudah benar
# Pastikan storage writable
# Clear cache
```

### Database Connection Error
```bash
# Cek kredensial di .env
# Cek MySQL running: sudo systemctl status mysql
# Test koneksi: php artisan tinker
```

---

## CHECKLIST DEPLOYMENT

- [ ] Git repository sudah dibuat dan di-push
- [ ] Server sudah terinstall PHP 8.2+, Composer, Node.js, MySQL, Nginx
- [ ] Database sudah dibuat dan user sudah dibuat
- [ ] Project sudah di-clone ke `/var/www/verdant`
- [ ] `.env` sudah di-setup dengan benar
- [ ] `composer install` sudah dijalankan
- [ ] `php artisan key:generate` sudah dijalankan
- [ ] Migrations sudah dijalankan
- [ ] Seeder label tanaman sudah dijalankan
- [ ] Storage link sudah dibuat
- [ ] Nginx sudah dikonfigurasi
- [ ] SSL certificate sudah terinstall (optional)
- [ ] User admin sudah dibuat
- [ ] Permissions sudah di-set dengan benar
- [ ] Test website di browser: http://agroparkpkklampung.my.id

---

## KONTAK & SUPPORT

Jika ada masalah deployment, periksa:
1. Laravel logs: `/var/www/verdant/storage/logs/laravel.log`
2. Nginx error logs: `/var/log/nginx/error.log`
3. PHP-FPM logs: `/var/log/php8.2-fpm.log`
