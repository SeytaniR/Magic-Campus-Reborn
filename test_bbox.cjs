const fs = require('fs');
const buffer = fs.readFileSync("public/characters/M2lutador.glb");
const jsonLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonLength);
const gltf = JSON.parse(jsonBuffer.toString("utf8"));
const accessors = gltf.accessors;
console.log(accessors.map(a => a.max).slice(0, 5));
