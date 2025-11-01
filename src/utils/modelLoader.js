// src/utils/modelLoader.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;
const MODEL_URL = '/models'; // Path from the 'public' folder

export async function loadModels() {
  if (modelsLoaded) {
    return; // Don't load them twice
  }
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Models pre-loaded successfully');
  } catch (error) {
    console.error('Error pre-loading FaceAPI models:', error);
  }
}