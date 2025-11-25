Server README

To run the backend server locally:

1. Open a terminal and go to the server folder:

   cd "C:\Users\Subhash\Desktop\New folder (2)\quiz-application\server"

2. Install dependencies (only first time):

   npm install

3. Start the server:

   npm start

   The server listens on port 5000 by default. Endpoints:
   - GET /health -> { status: 'ok' }
   - POST /api/auth/register -> { name, email, password }
   - POST /api/auth/login -> { email, password }
   - GET /api/auth/me -> requires Authorization: Bearer <token>
   - GET /api/exams -> list of exams
   - POST /api/exams -> create exam (requires admin token)
   - POST /api/results -> submit exam result (requires token)
   - GET /api/results -> get results (admin sees all; user sees own)

Admin seed:
- On first run the server seeds an admin user: email `admin@example.com` with password `Admin@123` (unless you set ADMIN_PW environment variable before starting the server).

Notes:
- Data is stored in `server/data/db.json` (simple file-based persistence). For production, switch to a real DB.

*** End of README
