
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');
const path = require('path');

const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';

async function synthesizeSpeech(text) {
    return new Promise((resolve, reject) => {
        const filePath = path.join('/tmp', 'output.wav');
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(text,
            result => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    fs.readFile(filePath, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                } else {
                    reject(result.errorDetails);
                }
                synthesizer.close();
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

module.exports = synthesizeSpeech;