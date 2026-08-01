const fs = require('fs');
const buffer = fs.readFileSync("public/characters/M2lutador.glb");
const jsonLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonLength);
const gltf = JSON.parse(jsonBuffer.toString("utf8"));
console.log("extensionsRequired:", gltf.extensionsRequired);
console.log("extensionsUsed:", gltf.extensionsUsed);
