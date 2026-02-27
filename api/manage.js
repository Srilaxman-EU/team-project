export default async function handler(req, res) {
    const token = process.env.GH_TOKEN;
    const owner = 'Srilaxman-EU'; // REPLACE
    const repo = 'team-project';       // REPLACE
    const path = 'files';
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = { 
        Authorization: `token ${token}`, 
        'Content-Type': 'application/json',
        'User-Agent': 'Team-Project-Hub'
    };

    // LIST FILES
    if (req.method === 'GET') {
        const r = await fetch(baseUrl, { headers });
        const d = await r.json();
        return res.status(200).json(Array.isArray(d) ? d : []);
    }

    // UPLOAD / MODIFY
    if (req.method === 'POST') {
        const { fileName, content } = req.body;
        
        // 1. Check if exists to get SHA for updates
        const checkRes = await fetch(`${baseUrl}/${fileName}`, { headers });
        const checkData = await checkRes.json();
        
        // 2. Perform PUT (Create or Update)
        const putRes = await fetch(`${baseUrl}/${fileName}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Portal Sync: ${fileName}`,
                content,
                sha: checkData.sha || undefined
            })
        });
        return res.status(putRes.ok ? 200 : 500).json({ ok: putRes.ok });
    }

    // DELETE
    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        const delRes = await fetch(`${baseUrl}/${file}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                message: `Portal Delete: ${file}`,
                sha: sha
            })
        });
        return res.status(delRes.ok ? 200 : 500).json({ ok: delRes.ok });
    }
}
