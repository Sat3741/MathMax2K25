# PostgreSQL Setup Instructions

## 1. Install PostgreSQL

### macOS (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Alternative: Postgres.app
Download from: https://postgresapp.com/

## 2. Create Database and User

```bash
# Access PostgreSQL
psql postgres

# In PostgreSQL shell, run:
CREATE DATABASE mathmax_db;
CREATE USER mathmax_user WITH PASSWORD 'mathmax_password';
ALTER ROLE mathmax_user SET client_encoding TO 'utf8';
ALTER ROLE mathmax_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mathmax_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mathmax_db TO mathmax_user;

# Exit PostgreSQL
\q
```

## 3. Install Python PostgreSQL Adapter

```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary
```

## 4. Run Migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

## 5. Start Server

```bash
python manage.py runserver
```

## Troubleshooting

### Connection Error
If you get "could not connect to server":
```bash
brew services restart postgresql@14
```

### Permission Denied
```bash
# Grant permissions
psql postgres
GRANT ALL PRIVILEGES ON DATABASE mathmax_db TO mathmax_user;
ALTER DATABASE mathmax_db OWNER TO mathmax_user;
```

### Change Password (Optional)
Update `backend/config/settings.py` DATABASES section with your preferred credentials.
