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
        this.sunlight.shadow.camera.far = 50
        this.sunlight.shadow.camera.width = 15
        this.sunlight.shadow.camera.top = 10;
        this.sunlight.shadow.camera.bottom = -10;
        this.sunlight.shadow.camera.left = -20;
        this.sunlight.shadow.camera.right = 20;
        this.sunlight.shadow.mapSize.set(2048, 2048)
        this.sunlight.shadow.normalBias = 0.05
        this.sunlight.position.set(25, 10, - 1.25)
        this.scene.add(this.sunlight)

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.sunlight, 'intensity', 0, 10, 0.001).name('sunlightIntensity');
            this.debugFolder
                .add(this.sunlight.position, 'x', -30, 30, 0.001).name('sunlightX');
            this.debugFolder
                .add(this.sunlight.position, 'y', -30, 30, 0.001).name('sunlightY');
            this.debugFolder
                .add(this.sunlight.position, 'z', -30, 30, 0.001).name('sunlightZ');
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