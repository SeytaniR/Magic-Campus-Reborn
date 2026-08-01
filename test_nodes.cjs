const fs = require('fs');

function getNodes(file) {
  const buffer = fs.readFileSync(file);
  const jsonLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + jsonLength);
  const gltf = JSON.parse(jsonBuffer.toString("utf8"));
  return gltf.nodes.map(n => n.name);
}

const charNodes = getNodes("public/characters/M2lutador.glb");
const animNodes = getNodes("public/animations/idle_normal.glb");

console.log("Char nodes sample:", charNodes.slice(0, 10));
console.log("Anim nodes sample:", animNodes.slice(0, 10));

const charSet = new Set(charNodes);
const missingInChar = animNodes.filter(n => !charSet.has(n));
console.log("Nodes in animation missing in character:", missingInChar.length);
