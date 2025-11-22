import { Router } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        // Handle errors
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            res.status(500).json({ message: 'Error downloading file' });
        });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

export default router;
