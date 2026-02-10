const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const crypto = require('crypto');
const app = express();

// Use the Environment Variable you set in Render
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

app.use(express.json());
// Serves the public folder (where index.html is)
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
    try {
        await client.connect();
        const db = client.db("sandboxDB"); 
        const collection = db.collection("projects");
        console.log("Connected to MongoDB!");

        // SAVE ROUTE: Stores code in DB
        app.post('/save', async (req, res) => {
            try {
                const { filename, code } = req.body;
                const randomId = crypto.randomBytes(2).toString('hex');
                const slug = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${randomId}`;

                await collection.insertOne({ slug, code, createdAt: new Date() });
                res.json({ url: `/${slug}` });
            } catch (err) {
                res.status(500).json({ error: "DB Save Error" });
            }
        });

        // VIEW ROUTE: Loads code from DB
        app.get('/:slug', async (req, res) => {
            try {
                const project = await collection.findOne({ slug: req.params.slug });
                if (project) {
                    res.send(project.code);
                } else {
                    res.status(404).send("<h1>404: Not Found</h1><a href='/'>Editor</a>");
                }
            } catch (err) {
                res.status(500).send("DB Fetch Error");
            }
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Live on port ${PORT}`));
    } catch (e) {
        console.error("Connection Failed:", e);
    }
}

startServer();
