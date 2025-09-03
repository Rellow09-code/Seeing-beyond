require('dotenv').config();
const express = require('express');
const analyzeImage = require('./components/imageAnalyst');
const app = express();
const PORT = process.env.PORT || 3000;
const synthesizeSpeech = require('./components/textToSpeech');
const { swaggerUi, specs } = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());

/**
 * @swagger
 * /image:
 *   post:
 *     summary: Analyze an image and generate captions
 *     description: Accepts an image link, analyzes it, and returns a JSON response with image captions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageLink
 *             properties:
 *               imageLink:
 *                 type: string
 *                 description: The URL of the image to analyze
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Successfully generated captions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageDescription:
 *                   type: string
 *                   example: "cat, sitting, table"
 *       400:
 *         description: Bad request (missing parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing imageLink in request body"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "internal server error"
 */


app.post('/image', async (req, res) => {
    try{
        const {imageLink} = req.body
        const captions = await analyzeImage(imageLink);
        res.status(200).json({imageDescription: `${captions.join(', ')}`});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:'internal server error'});
    }
    
});

/**
 * @swagger
 * /speak:
 *   post:
 *     summary: Convert text to speech
 *     description: Accepts text and returns a WAV audio buffer containing the synthesized speech.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to be converted into speech
 *                 example: "Hello world"
 *     responses:
 *       200:
 *         description: Successfully generated speech audio
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing text in request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing \"text\" in request body"
 *       500:
 *         description: Error synthesizing speech
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error synthesizing speech: some internal error"
 */

app.post('/speak', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({error:'Missing "text" in request body'});

    try {
        const audioBuffer = await synthesizeSpeech(text);
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length
        });
        res.status(200).send(audioBuffer);
    } catch (err) {
        res.status(500).json({error:`Error synthesizing speech: ${err}`});
    }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Server health check
 *     description: Returns a confirmation message that the server is running and ready.
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: "The server is running perfectly, ready to serve. whether your request is about images or speech"
 */


app.get('/', async (req, res) => {
    res.status(200).json({response:`The server is running perfectly, ready to serve. whether your request is about images or speech`});
});

//export app as a serverless app for vercel.
module.exports = app;