export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const REPO_OWNER = 'YOUR_GITHUB_USERNAME'; // REPLACE THIS
    const REPO_NAME = 'YOUR_REPO_NAME';       // REPLACE THIS
    const FOLDER_PATH = 'files';
    const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER_PATH}`;

    // 1. LIST FILES (GET)
    if (req.method === 'GET') {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const data = await response.json();
        return res.status(200).json(Array.isArray(data) ? data : []);
    }

    // 2. UPLOAD & UPDATE (POST)
    if (req.method === 'POST') {
        const { fileName, content } = req.body;
        
        // Overwrite logic: Check if file exists to get its SHA
        const check = await fetch(`${API_URL}/${fileName}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const existingFile = await check.json();
        const sha = existingFile.sha || null;

        const response = await fetch(`${API_URL}/${fileName}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Mani Team Sync: ${fileName}`,
                content: content,
                sha: sha // Including SHA makes GitHub overwrite the file
            })
        });
        return res.status(response.ok ? 200 : 500).json({ success: response.ok });
    }

    // 3. DELETE (DELETE)
    if (req.method === 'DELETE') {
        const { file, sha } = req.query;
        const response = await fetch(`${API_URL}/${file}`, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Mani Team Delete: ${file}`,
                sha: sha
            })
        });
        return res.status(response.ok ? 200 : 500).json({ success: response.ok });
    }
}