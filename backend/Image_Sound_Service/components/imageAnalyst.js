const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');

const key = process.env.AZURE_CV_KEY;
const endpoint = process.env.AZURE_CV_ENDPOINT;

const client = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }),
  endpoint
);

async function analyzeImage(imageUrl) {
  const result = await client.analyzeImage(imageUrl, {
    visualFeatures: ['Description', 'Tags']
  });
  return result.description.captions.map(c => c.text);
}

module.exports = analyzeImage;