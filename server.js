
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.json());
// Serve your editor from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const PROJECTS_DIR = path.join(__dirname, 'projects');
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR);

// SAVE ROUTE
app.post('/save', (req, res) => {
    const { filename, code } = req.body;
    const cleanName = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const randomId = crypto.randomBytes(2).toString('hex'); 
    const finalFilename = `${cleanName}-${randomId}.html`;

    fs.writeFile(path.join(PROJECTS_DIR, finalFilename), code, (err) => {
        if (err) return res.status(500).json({ error: "Storage error" });
        res.json({ url: `/${finalFilename.replace('.html', '')}` });
    });
});

// VIEW ROUTE
app.get('/:slug', (req, res) => {
    const filePath = path.join(PROJECTS_DIR, `${req.params.slug}.html`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // If it's not a saved file, send them back to the editor or a 404
        res.status(404).send("<h1>404: Page not found</h1><a href='/'>Go to Editor</a>");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
