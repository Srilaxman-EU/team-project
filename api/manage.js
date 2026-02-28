export default async function handler(req, res) {
    const token = process.env.GH_TOKEN;
    const owner = 'Srilaxman-EU'; // <--- CHANGE THIS
    const repo = 'team-project';        // <--- CHANGE THIS
    const path = 'files';
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = { 
        'Authorization': `token ${token}`, 
        'Content-Type': 'application/json',
        'User-Agent': 'Team-Project-Portal'
    };

    if (req.method === 'GET') {
        const r = await fetch(baseUrl, { headers });
        const d = await r.json();
        return res.status(200).json(Array.isArray(d) ? d : []);
    }

    if (req.method === 'POST') {
        const { fileName, content } = req.body;
        
        // 1. Check if file exists to get SHA (for updates)
        let sha = undefined;
        try {
            const check = await fetch(`${baseUrl}/${fileName}`, { headers });
            if (check.ok) {
                const existing = await check.json();
                sha = existing.sha;
            }
        } catch (e) { /* File doesn't exist, ignore */ }

        // 2. Upload or Update
        const response = await fetch(`${baseUrl}/${fileName}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Portal Sync: ${fileName}`,
                content: content,
                sha: sha // If undefined, GitHub creates a new file
            })
        });

        const result = await response.json();
        if (response.ok) {
            return res.status(200).json({ ok: true });
        } else {
            // Return the actual GitHub error to the frontend for debugging
            return res.status(response.status).json({ message: result.message });
        }
    }

    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        const r = await fetch(`${baseUrl}/${file}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ message: `Portal Delete: ${file}`, sha })
        });
        return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
}
