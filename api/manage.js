export default async function handler(req, res) {
    const token = process.env.GH_TOKEN;
    const owner = 'Srilaxman-EU'; // <--- Double check this!
    const repo = 'team=project';        // <--- Double check this!
    const path = 'files';
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = { 
        'Authorization': `token ${token}`, 
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Team-Project-Portal'
    };

    // 1. Handle GET (List files)
    if (req.method === 'GET') {
        try {
            const r = await fetch(baseUrl, { headers });
            const d = await r.json();
            return res.status(200).json(Array.isArray(d) ? d : []);
        } catch (e) {
            return res.status(500).json({ message: "Failed to connect to GitHub" });
        }
    }

    // 2. Handle POST (Upload/Update)
    if (req.method === 'POST') {
        try {
            const { fileName, content } = req.body;

            if (!token) return res.status(500).json({ message: "Vercel GH_TOKEN is missing" });

            // Step A: Check for existing file SHA
            let sha = undefined;
            const check = await fetch(`${baseUrl}/${fileName}`, { headers });
            if (check.ok) {
                const existing = await check.json();
                sha = existing.sha;
            }

            // Step B: Upload to GitHub
            const response = await fetch(`${baseUrl}/${fileName}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Sync: ${fileName}`,
                    content: content,
                    sha: sha
                })
            });

            const result = await response.json();

            if (response.ok) {
                return res.status(200).json({ ok: true });
            } else {
                return res.status(response.status).json({ message: `GitHub API: ${result.message}` });
            }
        } catch (error) {
            return res.status(500).json({ message: `Server Error: ${error.message}` });
        }
    }

    // 3. Handle DELETE
    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        try {
            const r = await fetch(`${baseUrl}/${file}`, {
                method: 'DELETE',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Delete: ${file}`, sha })
            });
            return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
        } catch (e) {
            return res.status(500).json({ message: "Delete failed" });
        }
    }
}
