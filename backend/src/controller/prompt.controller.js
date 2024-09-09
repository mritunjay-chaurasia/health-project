

const fs = require('fs');
const path = require('path');
const { generateAlteredSummary } = require('../utils');

async function promptRetriever(req, res) {
    try {
        const jsonFilePath = path.resolve(__dirname, '../json/prompts.json');
        const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
        res.status(200).json({ status: true, prompt: JSON.parse(fileContent) });
    } catch (error) {
        res.status(200).json({ status: false, prompt: "", message: "Something went wrong !!" });
    }
}


async function promptUpdater(req, res) {
    try {
        const jsonFilePath = path.resolve(__dirname, '../json/prompts.json');
        const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
        const prompts = JSON.parse(fileContent);

        // Update prompts with data from request
        const updatedPrompts = req.body;

        // Update only the keys present in the request body
        for (const key in updatedPrompts) {
            if (updatedPrompts.hasOwnProperty(key)) {
                prompts[key] = updatedPrompts[key];
            }
        }

        // Write the updated data back to the JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(prompts, null, 2), 'utf-8');

        res.status(200).json({ status: true, message: 'Prompts updated successfully' });
    } catch (error) {
        console.error('Error updating prompts:', error);
        res.status(500).json({ status: false, message: 'Failed to update prompts' });
    }
}





async function regenerateSummary(req, res) {
    try {
        const data = req.body;

        if (data) {
            const summary = await generateAlteredSummary(data)
            const parsedSummary = summary?.choices[0]?.message?.content ? JSON.parse(summary?.choices[0]?.message?.content) : "";
            if (parsedSummary) {
                return res.status(200).json({ status: true, summary: parsedSummary });
            }
        }
        return res.status(200).json({ status: false });
    } catch (error) {
        return res.status(200).json({ status: false });
    }
}

module.exports = {
    promptRetriever,
    promptUpdater,
    regenerateSummary
}