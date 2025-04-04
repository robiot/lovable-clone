require('dotenv').config();
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in .env file');
}

app.post('/api/create', async (req, res) => {
  try {
    const { id, token } = req.body;
    
    if (!id || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const envContent = `# https://github.com/vercel/next.js/tree/canary/examples/cms-sanity#using-the-sanity-cli
NEXT_PUBLIC_SANITY_PROJECT_ID=${id}
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=${token}`;

    const envPath = path.join(__dirname, 'sanity-next', '.env.local');
    
    await fs.writeFile(envPath, envContent);
    
    res.json({ success: true, message: 'Environment variables updated successfully' });
  } catch (error) {
    console.error('Error updating env file:', error);
    res.status(500).json({ error: 'Failed to update environment variables' });
  }
});

app.post('/api/change', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Read the current Hero.tsx file
    const heroPath = path.join(__dirname, "sanity-next", 'src', 'components', 'sections', 'Hero.tsx');
    const currentContent = await fs.readFile(heroPath, 'utf-8');

    // Create a prompt for OpenAI
    const aiPrompt = `Given this React TypeScript component:

${currentContent}

Make the following changes to the component based on this request: "${prompt}"
Return ONLY the modified code, maintaining TypeScript types and React best practices.`;

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "user", 
          content: aiPrompt 
        }
      ],
    });

    const modifiedCode = completion.choices[0].message.content;

    // Write the modified code back to the file
    await fs.writeFile(heroPath, modifiedCode);

    res.json({ 
      success: true, 
      message: 'Hero component updated successfully',
      modifications: modifiedCode
    });

  } catch (error) {
    console.error('Error updating Hero component:', error);
    res.status(500).json({ error: 'Failed to update Hero component' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
