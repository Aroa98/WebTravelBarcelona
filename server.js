import express from 'express';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sanitizeHtml from 'sanitize-html';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'barcelona-travel-2024';

// --- Middleware ---

// Parse JSON bodies with a size limit (1MB max)
app.use(express.json({ limit: '1mb' }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Write lock to prevent simultaneous writes corrupting the JSON
let isWriting = false;

// --- Helper Functions ---

/**
 * Get the path to a language JSON file
 */
function getDbPath(lang) {
  const safeLang = lang === 'en' ? 'en' : 'es'; // Only allow es/en
  return join(__dirname, 'src', 'database', `${safeLang}.json`);
}

/**
 * Read and parse a language JSON file
 */
function readDb(lang) {
  const dbPath = getDbPath(lang);
  if (!existsSync(dbPath)) {
    throw new Error(`Database file not found: ${dbPath}`);
  }
  const raw = readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Create a backup of the JSON before writing
 */
function backupDb(lang) {
  const dbPath = getDbPath(lang);
  const backupPath = join(__dirname, 'src', 'database', `${lang}.backup.json`);
  if (existsSync(dbPath)) {
    copyFileSync(dbPath, backupPath);
  }
}

/**
 * Write data to the JSON file (with backup + lock)
 */
async function writeDb(lang, data) {
  if (isWriting) {
    throw new Error('Another write operation is in progress. Please try again.');
  }
  isWriting = true;
  try {
    backupDb(lang);
    const dbPath = getDbPath(lang);
    writeFileSync(dbPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  } finally {
    isWriting = false;
  }
}

/**
 * Sanitize a string to remove dangerous HTML/scripts
 */
function sanitizeStr(str) {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, {
    allowedTags: ['strong', 'em', 'b', 'i'],  // Only allow basic formatting
    allowedAttributes: {}
  });
}

/**
 * Sanitize all string fields in an activity object
 */
function sanitizeActivity(activity) {
  return {
    hora: sanitizeStr(activity.hora || '10:00'),
    titulo: sanitizeStr(activity.titulo || ''),
    descripcion: sanitizeStr(activity.descripcion || ''),
    lugar: sanitizeStr(activity.lugar || 'Barcelona'),
    ...(activity.enlace_reserva ? { enlace_reserva: sanitizeStr(activity.enlace_reserva) } : {})
  };
}

/**
 * Middleware: Verify API key for write operations
 */
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing API key.' });
  }
  next();
}

// --- API Routes ---

/**
 * GET /api/itinerary/:lang
 * Read the full itinerary data (ui + days) for a language
 */
app.get('/api/itinerary/:lang', (req, res) => {
  try {
    const data = readDb(req.params.lang);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/days/:lang
 * Read only the days array for a language
 */
app.get('/api/days/:lang', (req, res) => {
  try {
    const data = readDb(req.params.lang);
    res.json(data.dias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/days/:lang/:dayId
 * Update a full day (all its activities). Requires API key.
 */
app.put('/api/days/:lang/:dayId', requireApiKey, async (req, res) => {
  try {
    const lang = req.params.lang;
    const dayId = Number(req.params.dayId);
    const data = readDb(lang);

    const dayIndex = data.dias.findIndex(d => d.id === dayId);
    if (dayIndex === -1) {
      return res.status(404).json({ error: `Day with id ${dayId} not found.` });
    }

    // Sanitize all activities in the updated day
    const updatedDay = req.body;
    if (updatedDay.actividades && Array.isArray(updatedDay.actividades)) {
      updatedDay.actividades = updatedDay.actividades.map(sanitizeActivity);
    }

    // Sanitize day-level string fields
    if (updatedDay.tituloPrincipal) {
      updatedDay.tituloPrincipal = sanitizeStr(updatedDay.tituloPrincipal);
    }
    if (updatedDay.fecha) {
      updatedDay.fecha = sanitizeStr(updatedDay.fecha);
    }

    // Preserve the original day id
    updatedDay.id = dayId;
    data.dias[dayIndex] = updatedDay;

    await writeDb(lang, data);
    res.json({ ok: true, day: data.dias[dayIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/days/:lang/:dayId/activities
 * Add a new activity to a specific day. Requires API key.
 */
app.post('/api/days/:lang/:dayId/activities', requireApiKey, async (req, res) => {
  try {
    const lang = req.params.lang;
    const dayId = Number(req.params.dayId);
    const data = readDb(lang);

    const day = data.dias.find(d => d.id === dayId);
    if (!day) {
      return res.status(404).json({ error: `Day with id ${dayId} not found.` });
    }

    const newActivity = sanitizeActivity(req.body);

    if (!newActivity.titulo) {
      return res.status(400).json({ error: 'Activity title is required.' });
    }

    day.actividades.push(newActivity);
    // Sort activities by time
    day.actividades.sort((a, b) => a.hora.localeCompare(b.hora));

    await writeDb(lang, data);
    res.status(201).json({ ok: true, activity: newActivity, day });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/days/:lang/:dayId/activities/:actIndex
 * Delete an activity by its index within a day. Requires API key.
 */
app.delete('/api/days/:lang/:dayId/activities/:actIndex', requireApiKey, async (req, res) => {
  try {
    const lang = req.params.lang;
    const dayId = Number(req.params.dayId);
    const actIndex = Number(req.params.actIndex);
    const data = readDb(lang);

    const day = data.dias.find(d => d.id === dayId);
    if (!day) {
      return res.status(404).json({ error: `Day with id ${dayId} not found.` });
    }

    if (actIndex < 0 || actIndex >= day.actividades.length) {
      return res.status(400).json({ error: `Invalid activity index: ${actIndex}` });
    }

    const removed = day.actividades.splice(actIndex, 1);
    await writeDb(lang, data);
    res.json({ ok: true, removed: removed[0], day });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🌍 Barcelona Travel Planner running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   GET    /api/itinerary/:lang`);
  console.log(`   GET    /api/days/:lang`);
  console.log(`   PUT    /api/days/:lang/:dayId`);
  console.log(`   POST   /api/days/:lang/:dayId/activities`);
  console.log(`   DELETE /api/days/:lang/:dayId/activities/:actIndex\n`);
});
