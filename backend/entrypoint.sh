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
    user.save()
    print('Superuser created')
else:
    user = User.objects.get(correo='admin@example.com')
    if not user.correo:
        user.correo = 'admin@example.com'
        user.save()
    print('Superuser already exists')
" || true

echo "Starting Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
