# VIVA NOTES – ITIMS (IT Infrastructure Management System)

## 1. The project in one line
A web app where the IT department can keep a record of all IT assets (computers, IPs, network, ISP, firewall, Wi-Fi, servers, CCTV), handle IT complaints from start to finish, and download reports.

## 2. What each layer does (very simple)

| Layer | Simple meaning | In our project |
|---|---|---|
| **Frontend (React)** | What the user sees and clicks | Login page, dashboard, tables, forms, charts |
| **Backend (Express)** | The "manager" that checks rules and talks to the database | REST APIs, login check, role check, duplicate-IP check, complaint workflow |
| **ORM (Prisma)** | A translator: JavaScript code → SQL | `prisma.server.create({...})` instead of writing `INSERT INTO ...` |
| **Database (PostgreSQL)** | Permanent storage | 13 tables |

Think of a restaurant: **React = the menu and waiter**, **Express = the kitchen manager**, **Prisma = the recipe book that converts orders into cooking steps**, **PostgreSQL = the store room**.

## 3. Why these technologies?

- **React** – builds the UI from small reusable components (DataTable, FormModal…). Fast, very popular, huge community.
- **Vite** – starts the dev server in under a second; much faster than old Create-React-App.
- **Tailwind CSS** – style directly with class names (`bg-indigo-600 rounded-xl`), no big CSS files, easy to make it look modern and responsive.
- **Express.js** – the simplest and most used Node.js web framework; easy to define routes and middleware.
- **Node.js** – JavaScript on both frontend and backend → one language for the whole project.
- **Prisma** – type-safe, readable queries, auto migrations from one `schema.prisma` file, protects against SQL injection.
- **PostgreSQL** – free, reliable, relational (our data has relations: complaint → user, port → switch), supports UNIQUE constraints and enums.
- **JWT** – stateless login: the server doesn't store sessions, the token itself proves who you are.
- **bcrypt** – stores passwords as one-way hashes, so even the admin cannot read passwords.
- **Recharts** – simple React chart library. **jsPDF / xlsx** – create PDF and Excel files directly in the browser, so the server stays light.

## 4. Key features to demonstrate
1. Login as admin → dashboard full of data.
2. IP Management → try adding `10.10.10.10` → red error "Duplicate IP… (409)".
3. Server Room → add a server with IP `10.10.30.21` → error says it belongs to Access Point "AP-Admin-Lobby".
4. Complaints → open a ticket → Assign → Start Work → Resolve (note) → Close; watch the stepper move.
5. Reports → Download PDF and Excel.
6. Logout → login as staff → delete buttons are hidden and the Users menu is gone.

---

## 5. Likely viva questions with answers

**Q1. What is 3-tier architecture? How is it used here?**
It splits the app into Presentation (React), Application/Business logic (Express) and Data (PostgreSQL via Prisma). Each tier only talks to the next one, so we can change one tier without breaking the others.

**Q2. What is a REST API?**
A way for the frontend and backend to talk over HTTP using URLs and methods: GET = read, POST = create, PUT = update, PATCH = partial update, DELETE = delete. Example: `GET /api/servers` returns all servers.

**Q3. How does login work?**
User sends email + password → backend finds the user and compares the password with the bcrypt hash → if correct, it creates a JWT token (valid 1 day) → frontend stores it in localStorage and sends it in the `Authorization: Bearer <token>` header with every request.

**Q4. What is JWT and what is inside it?**
JSON Web Token – a signed string with 3 parts: header, payload, signature. Our payload has the user id and role. The signature (made with `JWT_SECRET`) proves nobody changed it.

**Q5. Why hash passwords? Why bcrypt?**
If the database leaks, hashes cannot be turned back into passwords. bcrypt is slow on purpose and adds a random "salt", which makes guessing attacks very hard.

**Q6. How is role-based access control done?**
`protect` middleware checks the token; `allow('ADMIN')` middleware is added on DELETE routes and user routes. IT_STAFF gets HTTP 403. The frontend also hides delete buttons and the Users menu for IT_STAFF.

**Q7. How does duplicate-IP validation work?**
One helper `ipValidator.js`: (1) checks IPv4 format, (2) checks the IP table for the same IP, (3) checks all device tables and the IP table to see if the IP is used by another device. Any clash returns HTTP 409 with a clear message. The `ipAddress` column is also UNIQUE in the database as a final safety net.

**Q8. Why HTTP 409?**
409 means "Conflict" – the request is valid but conflicts with existing data (the IP is already taken). 400 is used for wrong format.

**Q9. What is Prisma and what is a migration?**
Prisma is an ORM – it maps tables to JavaScript objects. A migration is a saved SQL file that creates/changes tables. `npx prisma migrate dev` reads `schema.prisma` and applies it to PostgreSQL.

**Q10. What is the seed file?**
`prisma/seed.js` fills the database with demo data (users, 15 computers, 41 IPs, 12 cameras, 15 complaints…) so the dashboard looks complete on first run.

**Q11. Explain the complaint workflow.**
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED (RESOLVED can be re-opened). The backend has a map of allowed next steps and rejects skipping. Resolving needs a resolution note. Ticket numbers are generated like TKT-0001.

**Q12. Which tables have relationships?**
User → Complaint (one staff has many complaints), IpAddress → Computer (one IP to computer), NetworkDevice → Switch (one switch has many port records, deleted together = cascade).

**Q13. What is the generic CRUD pattern and why use it?**
Instead of writing the same list/create/update/delete code 10 times, `makeCrud(model, options)` creates them for any table, and `<CrudPage config>` does the same on the frontend. Less code, fewer bugs, same behaviour everywhere (DRY – Don't Repeat Yourself).

**Q14. How do pagination, search and filters work?**
Frontend sends `?search=dell&status=ACTIVE&page=2&limit=10`. Backend builds a Prisma `where` (case-insensitive `contains` for search), uses `skip = (page-1)*limit` and `take = limit`, and also returns the total count to show "page 2 of 5".

**Q15. How are PDF and Excel reports created?**
On the frontend: the report card fetches all matching rows (`limit=0`), then jsPDF + autotable draws a table in a PDF, and the `xlsx` library builds an Excel sheet. The browser downloads the file. No extra load on the server.

**Q16. How are errors handled?**
Every error goes to one central `errorHandler` middleware which converts it into `{ success:false, data:null, message }` with the right status code (400, 401, 403, 404, 409, 500). Prisma errors are translated into friendly messages.

**Q17. What is CORS and why is it enabled?**
The React app (port 5173) and API (port 5000) are different origins. Browsers block such calls unless the server allows them; `app.use(cors())` allows them.

**Q18. What is middleware in Express?**
A function that runs between the request and the controller, e.g. `express.json()` (reads JSON body), `protect` (checks token), `allow` (checks role), `errorHandler` (formats errors).

**Q19. How is the app made responsive?**
Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`). On mobile the sidebar becomes a slide-in menu with a hamburger button; grids collapse to one column; tables scroll horizontally.

**Q20. What can be improved in future?**
Email/SMS alerts for CRITICAL tickets and ISP down, SNMP/ping-based live device monitoring, QR-code asset tags, audit log of who changed what, file attachments on complaints, Docker deployment.
