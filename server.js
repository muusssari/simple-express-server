const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3011;
const timeoutDuration = 5000; // 5 seconds

app.use(express.json());

// Helper function to generate random IDs
function generateRandomIds(requestedAmount) {
    const numberOfIds = Math.max(1, Math.floor(requestedAmount / 4)); // Ensure at least 1 ID
    const ids = [];

    for (let i = 0; i < numberOfIds; i++) {
        // Generate a random 8-character alphanumeric ID
        const id = `id-${Math.random().toString(36).substr(2, 8)}`;
        ids.push(id);
    }

    return ids;
}


// Endpoint to return a JSON object with fake IDs
app.post("/api/ids", (req, res) => {
    const items = req.body;

    if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Request body must be an array" });
    }
    const requestedAmount = parseInt(items.length, 10) || 100;
    setTimeout(() => {
        const data = {
            ids: generateRandomIds(requestedAmount),
        };
        res.json(data);
    }, timeoutDuration);
    //res.json(req.body)
});

// Endpoint to return a PDF with ID and type provided as query parameters
app.get("/api/download", (req, res) => {
    const { id, type } = req.query;

    if (!id || !type) {
        return res.status(400).json({ error: "Both 'id' and 'type' query parameters are required." });
    }

    setTimeout(() => {
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `${id}.pdf`);
        
        // Create a write stream for the PDF
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        
        // Add content to the PDF
        doc.text(`PDF content for ID: ${id}`);
        doc.text(`Type: ${type}`);
        doc.end();

        // Wait for the PDF file to be completely written
        writeStream.on("finish", () => {
            res.download(filePath, `${id}.pdf`, (err) => {
                if (err) {
                    console.log("Error sending file:", err);
                }
                // Delete the file after sending to keep the folder clean
                fs.unlinkSync(filePath);
            });
        });

        // Handle any errors in the file writing process
        writeStream.on("error", (err) => {
            console.log("Error writing PDF file:", err);
            res.status(500).send("Failed to generate PDF");
        });
    }, timeoutDuration);
});

// Start server
app.listen(port, () => {
    console.log(`Fake server running with a 5-second delay at http://localhost:${port}`);
});