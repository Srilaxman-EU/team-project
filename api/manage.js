export default async function handler(req, res) {
    const token = process.env.GH_TOKEN;
    const owner = 'Your_GitHub_Username'; 
    const repo = 'Your_Repo_Name'; 
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/files`;
    const headers = { 
        Authorization: `token ${token}`, 
        'User-Agent': 'Team-Project-Portal',
        'Accept': 'application/vnd.github.v3+json'
    };

    if (req.method === 'GET') {
        const r = await fetch(url, { headers });
        const d = await r.json();
        return res.status(200).json(Array.isArray(d) ? d : []);
    }

    if (req.method === 'POST') {
        const { fileName, content } = req.body;
        // Check for SHA to allow Updates
        const check = await fetch(`${url}/${fileName}`, { headers });
        const existing = await check.json();
        const r = await fetch(`${url}/${fileName}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: 'Update via Portal', 
                content, 
                sha: existing.sha || undefined 
            })
        });
        if (r.ok) return res.status(200).json({ ok: true });
        const err = await r.json();
        return res.status(500).json({ message: err.message });
    }

    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        const r = await fetch(`${url}/${file}`, {
            method: 'DELETE',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Delete via Portal', sha })
        });
        return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
}
