FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pip setuptools wheel

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN git clone --depth 1 https://github.com/SebastianMoralesDuque/Pruebatecnica.git /tmp/pruebatecnica \
    && cp -r /tmp/pruebatecnica/domain/src/shared_domain /usr/local/lib/python3.11/site-packages/ \
    && rm -rf /tmp/pruebatecnica

COPY . .

RUN python manage.py collectstatic --noinput || true

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
