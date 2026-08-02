const fs = require('fs');

function getAnims(file) {
  try {
    const buffer = fs.readFileSync(file);
    const jsonLength = buffer.readUInt32LE(12);
    const jsonBuffer = buffer.slice(20, 20 + jsonLength);
    const gltf = JSON.parse(jsonBuffer.toString("utf8"));
    if (gltf.animations) {
      console.log(file, "Animations:", gltf.animations.map(a => a.name));
    } else {
      console.log(file, "No animations found");
    }
  } catch(e) {
    console.error("Error reading", file, e.message);
  }
}

getAnims('public/monstros/cogumelo.glb');
getAnims('public/monstros/slime.glb');
getAnims('public/monstros/coelhogangster.glb');
