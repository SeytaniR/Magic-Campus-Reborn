const fs = require('fs');
// we need to use three to parse the gltf, but it's hard to do without a proper loader in node.
// let's just parse the json part of the gltf.
const buffer = fs.readFileSync("public/characters/M2lutador.glb");
const jsonLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonLength);
const gltf = JSON.parse(jsonBuffer.toString("utf8"));
const nodes = gltf.nodes;
const meshes = gltf.meshes;
const accessors = gltf.accessors;
console.log(accessors.map(a => a.max));
