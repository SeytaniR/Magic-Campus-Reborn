const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { KTX2Loader } = require('three/examples/jsm/loaders/KTX2Loader.js');
const { MeshoptDecoder } = require('three/examples/jsm/libs/meshopt_decoder.module.js');
const gltfLoader = new GLTFLoader();
const ktx2Loader = new KTX2Loader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);
gltfLoader.setKTX2Loader(ktx2Loader);

console.log("Setup complete");
