#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput || true

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(correo='admin@example.com').exists():
    user = User.objects.create_superuser('admin@example.com', 'admin@example.com', 'admin123')
    user.correo = 'admin@example.com'
    user.is_administrator = True
    user.save()
    print('Superuser created')
else:
    user = User.objects.get(correo='admin@example.com')
    if not user.correo:
        user.correo = 'admin@example.com'
    user.is_administrator = True
    user.save()
    print('Superuser updated')
" || true

echo "Creating standard user if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(correo='user@example.com').exists():
    user = User.objects.create_user('user@example.com', 'user@example.com', 'user123')
    user.correo = 'user@example.com'
    user.save()
    print('Standard user created')
else:
    print('Standard user already exists')
" || true

echo "Starting Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
