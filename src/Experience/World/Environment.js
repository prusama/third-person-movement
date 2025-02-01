import Experience from "../Experience.js";
import * as THREE from "three";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment');
        }

        this.setSunLight();
        this.setEnvironmentMap();
    }

    setSunLight() {
        this.sunlight = new THREE.DirectionalLight('#ffffff', 4)
        this.sunlight.castShadow = true
        this.sunlight.shadow.camera.far = 15
        this.sunlight.shadow.camera.width = 15
        this.sunlight.shadow.mapSize.set(1024, 1024)
        this.sunlight.shadow.normalBias = 0.05
        this.sunlight.position.set(3.5, 2, - 1.25)
        this.scene.add(this.sunlight)

        const lightHelper = new THREE.CameraHelper(this.sunlight.shadow.camera);
        this.scene.add(lightHelper);

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.sunlight, 'intensity', 0, 10, 0.001).name('sunlightIntensity');
            this.debugFolder
                .add(this.sunlight.position, 'x', -5, 5, 0.001).name('sunlightX');
            this.debugFolder
                .add(this.sunlight.position, 'y', -5, 5, 0.001).name('sunlightY');
            this.debugFolder
                .add(this.sunlight.position, 'z', -5, 5, 0.001).name('sunlightZ');
        }
    }

    setEnvironmentMap() {
        this.environmentMap = {};
        this.environmentMap.intensity = 0.4;
        this.environmentMap.texture = this.resources.items['environmentMapTexture'];
        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

        this.scene.environment = this.environmentMap.texture;

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child.isMesh && child.material.isMeshStandardMaterial) {
                    child.material.envMap = this.environmentMap.texture;
                    child.material.envMapIntensity = this.environmentMap.intensity;
                    child.material.needsUpdate = true;
                }
            });
        };

        this.environmentMap.updateMaterials();

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.environmentMap, 'intensity', 0, 4, 0.001).name('envMapIntensity')
                .onChange(() => {
                    this.environmentMap.updateMaterials()
                });
        }
    }
}