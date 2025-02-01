import Experience from "./Experience.js";
import * as THREE from "three";

export default class Controls {
    currentAction;
    toggleRun = true;

    constructor() {
        this.experience = new Experience();
        this.time = this.experience.time;
        this.camera = this.experience.camera;

        // Setup
        this.keyPressed = {};
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuaternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();

        this.fadeDuration = 0.2;
        this.runVelocity = 0.01;
        this.walkVelocity = 0.004;

        this.setControlListeners();
    }

    setControlListeners() {

        document.addEventListener('keydown', (event) => {
            if (event.shiftKey) {
                this.switchRunToggle();
            } else {
                this.keyPressed[event.key.toLowerCase()] = true;
            }
        }, false);

        document.addEventListener('keyup', (event) => {
            this.keyPressed[event.key.toLowerCase()] = false;
        }, false);
    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun;
    }

    update(delta, keyPressed) {
        const fox = this.experience.world.fox;
        const directionPressed = ['w', 'a', 's', 'd'].some(key => keyPressed[key] === true);

        let action = '';

        if (directionPressed && this.toggleRun) {
            action = 'running';
        } else if (directionPressed) {
            action = 'walking';
        } else {
            action = 'idle';
        }

        if (this.currentAction !== action) {

            fox?.animation.play(action);

            this.currentAction = action;
        }

        if (this.currentAction === 'running' || this.currentAction === 'walking') {
            // Calculate towards camera position
            const angleYCameraDirection = Math.atan2(
                (this.camera.instance.position.x - fox.model.position.x),
                (this.camera.instance.position.z - fox.model.position.z)
            )

            // diagonal movement angle offset
            const directionalOffset = this.directionOffset(keyPressed);

            // rotate model
            this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionalOffset);
            fox.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);

            // calculate direction
            this.camera.instance.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionalOffset);

            // Run walk velocity
            const velocity = this.currentAction === 'running' ? this.runVelocity : this.walkVelocity;

            // move model and camera
            const moveX = this.walkDirection.x * velocity * delta;
            const moveZ = this.walkDirection.z * velocity * delta;
            fox.model.position.x -= moveX;
            fox.model.position.z -= moveZ;
            this.updateCameraTarget(moveX, moveZ, fox.model);
        }
    }

    updateCameraTarget(moveX, moveZ, targetModel) {
        // move camera
        this.camera.instance.position.x -= moveX;
        this.camera.instance.position.z -= moveZ;

        // update camera target
        this.cameraTarget.x = targetModel.position.x;
        this.cameraTarget.y = targetModel.position.y + 1;
        this.cameraTarget.z = targetModel.position.z;
        this.camera.controls.target = this.cameraTarget;
    }

    directionOffset(keysPressed) {
        var directionOffset = 0 // w

        if (keysPressed['w']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed['d']) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed['s']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed['a']) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed['d']) {
            directionOffset = - Math.PI / 2 // d
        }

        console.log(keysPressed);
        console.log(directionOffset);
        return directionOffset + Math.PI;
    }
}