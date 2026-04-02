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

echo "Seeding demo data..."
python manage.py shell -c "
from management.models import Empresa, Producto

empresas_data = [
    {'nit': '900123456-7', 'nombre': 'TechStore Colombia', 'direccion': 'Calle 72 #10-34, Bogotá', 'telefono': '3105551234'},
    {'nit': '800987654-3', 'nombre': 'ElectroMax S.A.S', 'direccion': 'Av. El Poblado #25-50, Medellín', 'telefono': '3014445678'},
    {'nit': '901555888-1', 'nombre': 'Digital Solutions', 'direccion': 'Cra 15 #45-20, Cali', 'telefono': '3203339999'},
]
for data in empresas_data:
    Empresa.objects.get_or_create(nit=data['nit'], defaults=data)

productos_data = [
    {'codigo': 'LAP001', 'nombre': 'Laptop Dell XPS 15', 'caracteristicas': 'Intel i7, 16GB RAM, 512GB SSD, 15.6 OLED', 'precios': {'compra': 3500000, 'venta': 4200000}, 'empresa_nit': '900123456-7'},
    {'codigo': 'LAP002', 'nombre': 'MacBook Air M3', 'caracteristicas': 'Apple M3, 8GB RAM, 256GB SSD, 13.6', 'precios': {'compra': 4800000, 'venta': 5600000}, 'empresa_nit': '900123456-7'},
    {'codigo': 'MON001', 'nombre': 'Monitor Samsung 27 4K', 'caracteristicas': 'UHD, 144Hz, 1ms, HDR400', 'precios': {'compra': 1200000, 'venta': 1500000}, 'empresa_nit': '900123456-7'},
    {'codigo': 'TEC001', 'nombre': 'Teclado Logitech MX Keys', 'caracteristicas': 'Inalambrico, Retroiluminado, Multi-dispositivo', 'precios': {'compra': 350000, 'venta': 450000}, 'empresa_nit': '900123456-7'},
    {'codigo': 'CEL001', 'nombre': 'iPhone 15 Pro', 'caracteristicas': 'A17 Pro, 256GB, Camara 48MP, Titanio', 'precios': {'compra': 4200000, 'venta': 5100000}, 'empresa_nit': '800987654-3'},
    {'codigo': 'CEL002', 'nombre': 'Samsung Galaxy S24 Ultra', 'caracteristicas': 'Snapdragon 8 Gen 3, 256GB, S Pen, 200MP', 'precios': {'compra': 4000000, 'venta': 4800000}, 'empresa_nit': '800987654-3'},
    {'codigo': 'AUD001', 'nombre': 'AirPods Pro 2', 'caracteristicas': 'Cancelacion de ruido, USB-C, Audio Espacial', 'precios': {'compra': 850000, 'venta': 1050000}, 'empresa_nit': '800987654-3'},
    {'codigo': 'TAB001', 'nombre': 'iPad Pro 12.9', 'caracteristicas': 'M2 chip, 256GB, Liquid Retina XDR', 'precios': {'compra': 4500000, 'venta': 5300000}, 'empresa_nit': '901555888-1'},
    {'codigo': 'ACC001', 'nombre': 'Cargador Anker 100W', 'caracteristicas': 'GaN, 4 puertos USB-C, Portatil', 'precios': {'compra': 180000, 'venta': 250000}, 'empresa_nit': '901555888-1'},
    {'codigo': 'ACC002', 'nombre': 'Hub USB-C 12-en-1', 'caracteristicas': 'HDMI 4K, Ethernet, SD, USB 3.0', 'precios': {'compra': 220000, 'venta': 320000}, 'empresa_nit': '901555888-1'},
]
for data in productos_data:
    nit = data.pop('empresa_nit')
    empresa = Empresa.objects.get(nit=nit)
    Producto.objects.get_or_create(codigo=data['codigo'], defaults={**data, 'empresa': empresa})

print(f'Demo data: {Empresa.objects.count()} empresas, {Producto.objects.count()} productos')
" || true

echo "Starting Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
