export default async function handler(req, res) {
    const token = process.env.GH_TOKEN;
    const owner = 'Srilaxman-EU'; // REPLACE
    const repo = 'team-project';       // REPLACE
    const path = 'files';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = { Authorization: `token ${token}`, 'Content-Type': 'application/json' };

    if (req.method === 'GET') {
        const r = await fetch(url, { headers });
        const d = await r.json();
        return res.status(200).json(Array.isArray(d) ? d : []);
    }

    if (req.method === 'POST') {
        const { fileName, content } = req.body;
        // Check if exists to get SHA for update
        const check = await fetch(`${url}/${fileName}`, { headers });
        const existing = await check.json();
        const r = await fetch(`${url}/${fileName}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ 
                message: `Team Project Update: ${fileName}`, 
                content, 
                sha: existing.sha || null 
            })
        });
        return res.status(200).json({ ok: r.ok });
    }

    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        const r = await fetch(`${url}/${file}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ message: `Team Project Delete: ${file}`, sha })
        });
        return res.status(200).json({ ok: r.ok });
    }
}

