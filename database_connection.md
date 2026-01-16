# Database Connection Details

## Connection Information

Use these credentials to connect to the PostgreSQL database using any SQL extension:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `mathmax_db`
- **Username:** `mathmax_user`
- **Password:** `mathmax_password`

## SQLTools Extension (VS Code)

The connection has been configured in `.vscode/settings.json`. 

1. Install the **SQLTools** extension and **SQLTools PostgreSQL/Cockroach Driver** extension
2. Open the SQLTools sidebar (click the database icon in the left sidebar)
3. You should see "MathMax PostgreSQL" connection
4. Click the connect button to connect

## PostgreSQL Extension (VS Code)

1. Install the **PostgreSQL** extension by Chris Kolkman
2. Click the PostgreSQL icon in the sidebar
3. Click "Add Connection"
4. Enter the connection details above

## Connection String Format

If you need a connection string:

```
postgresql://mathmax_user:mathmax_password@localhost:5432/mathmax_db
```

## psql Command Line

```bash
psql -h localhost -p 5432 -U mathmax_user -d mathmax_db
```

When prompted, enter the password: `mathmax_password`


