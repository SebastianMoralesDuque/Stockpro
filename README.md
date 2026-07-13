# 🚀 StockPro: Inventory Intelligence & Blockchain Integrity

StockPro is a high-performance inventory management system that leverages **Artificial Intelligence** for executive analysis and **Blockchain Technology** for data immutability.


## 🏗️ Technical Architecture

### Tech Stack
- **Backend**: Django 5.x + Django Rest Framework + Poetry
- **Database**: PostgreSQL (Hosted on **Supabase** via IPv4 Transaction Pooler)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **AI Engine**: Google Gemini (generative-ai)
- **Blockchain**: Solana Protocol (Devnet)

### Architecture Principles
This project follows **Clean Architecture** principles and **SOLID** design guidelines to ensure maintainability and scalability.

- **Clean Architecture**:
  - **Shared Domain**: Contains the core business entities (`Empresa`, `Producto`) and exceptions. These are now implemented as Django Models for practicality while maintaining domain isolation logic where possible.
  - **Application**: Contains Use Cases (`GestionarProducto`, `ProcesarInventario`) that implement business logic orchestrating the domain and infrastructure.
  - **Infrastructure**: Handles external concerns like Database (Django ORM), AI Service (Gemini), Blockchain Service (Solana), and Email (Resend).
  - **Interface Adapters (Management App)**: Django Views and Serializers acting as entry points (Controllers).

- **SOLID**:
  - **S**R: Each service (AI, PDF, Blockchain) has a single responsibility.
  - **O**CP: System is open for extension (e.g., adding new notification channels) without modifying existing logic.
  - **L**SP: Services and repositories follow expected protocols.
  - **I**SP: Interfaces are specific to client needs.
  - **D**IP: High-level modules delegate implementation details to low-level modules via abstractions (dependency injection pattern used implicitly).

---

## 🛠️ Installation & Setup (Using Poetry)

We use **Poetry** for dependency management.

### 1. Prerequisites
- Python 3.11+
- Poetry installed (`curl -sSL https://install.python-poetry.org | python3 -`)

### 2. Backend Setup
```bash
# Clone repository
git clone <repository_url>
cd backend

# Install dependencies
poetry install

# Activate shell
poetry shell
```

### 3. Environment Configuration
Create a `.env` file in `backend/` based on the template:
```env
DB_NAME=postgres
DB_USER=postgres.zngvnppcnybhnzjwevtz
DB_PASSWORD=your_password
DB_HOST=aws-1-eu-west-1.pooler.supabase.com
DB_PORT=6543
GOOGLE_API_KEY=your_key
# Análisis de inventario: Ollama local (puente MiniMax cloud), sin API key
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1
OLLAMA_MODEL=minimax-m3:cloud
OLLAMA_API_KEY=not-needed
RESEND_API_KEY=your_key
SOLANA_PRIVATE_KEY=your_hex_key
```

### 4. Database Setup
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
# OR use default credentials provided below
```

### 6. Start Server
```bash
python manage.py runserver
```

---

## 🔑 Credenciales de Prueba (Test Credentials)

Para probar la aplicación y el panel administrativo, utilice las siguientes credenciales:

### 1. Super Admin (Acceso Total)
Este usuario tiene acceso tanto al Frontend como al **Django Admin**.
- **Usuario/Correo**: `admin@example.com`
- **Contraseña**: `admin123`
- **Ruta Django Admin**: [https://pruebatecnica-production-38af.up.railway.app/domain/admin/](https://pruebatecnica-production-38af.up.railway.app/domain/admin/)

### 2. Usuario Estándar (Acceso Limitado)
Este usuario srive para probar la funcionalidad básica desde el Frontend.
- **Usuario/Correo**: `user@example.com`
- **Contraseña**: `user123`

### 📚 API Documentation
- **Swagger UI**: [https://pruebatecnica-production-38af.up.railway.app/api/docs/](https://pruebatecnica-production-38af.up.railway.app/api/docs/)
- **ReDoc**: [https://pruebatecnica-production-38af.up.railway.app/api/redoc/](https://pruebatecnica-production-38af.up.railway.app/api/redoc/)

---

## 🧪 Testing Suite

We include Unit Tests and Integration Tests.

### Running Tests
Inside the `backend` directory (with virtual environment active):
```bash
pytest
```
Or with detailed output:
```bash
pytest -v
```

- **Unit Tests**: Cover specific logic in Use Cases and Domain.
- **Integration Tests**: Verify API Endpoints and Database interactions.

---

## ⛓️ Solana Blockchain Integration

StockPro uses the Solana blockchain to provide **Proof of Integrity** for every inventory report.

### How it works:
1. **Hashing**: We generate a unique SHA-256 fingerprint (Hash) of the inventory data and the AI analysis.
2. **On-Chain Recording**: This hash is sent to the **Solana Memo Program** (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`).
3. **Immutability**: Once recorded, the transaction hash (TxHash) serves as a permanent, timestamped receipt that proves the data has not been altered.

### 🚰 Solana Faucet (Devnet)
To perform certifications, you need **Devnet SOL**.
1. Visit [faucet.solana.com](https://faucet.solana.com/).
2. Paste your public key: `4ThzNAZJkndwjS6AuULjT2mgeWeM82tEJVQrFoy5aCKn`.
3. Select "Devnet" and request tokens.
4. Verify your balance:
   ```bash
   solana balance 4ThzNAZJkndwjS6AuULjT2mgeWeM82tEJVQrFoy5aCKn --url https://api.devnet.solana.com
   ```
