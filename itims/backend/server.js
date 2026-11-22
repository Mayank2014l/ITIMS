// =============================================================
// ITIMS Backend entry point
// React (frontend)  ->  Express (this server)  ->  Prisma  ->  PostgreSQL
// =============================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());          // allow the React app (another port) to call us
app.use(express.json());  // read JSON request bodies

app.get('/', (req, res) => res.json({ success: true, data: null, message: 'ITIMS API is running' }));
app.use('/api', routes);  // all REST APIs

// Unknown URL -> 404 in the standard format
app.use((req, res) => res.status(404).json({ success: false, data: null, message: `Route ${req.originalUrl} not found` }));

app.use(errorHandler);    // central error handler (must be last)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ITIMS API running on http://localhost:${PORT}`));
