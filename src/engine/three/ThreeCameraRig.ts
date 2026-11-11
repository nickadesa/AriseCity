import * as THREE from 'three';

export class ThreeCameraRig {
  public camera: THREE.OrthographicCamera;
  public target: THREE.Vector3 = new THREE.Vector3(12, 1.5, 8); // Centered on Arise HQ (24x16m)
  
  // Mathematical Isometric Angles (True Dimetric / Isometric 35.264° / 45°)
  private readonly EL: number = Math.atan(1 / Math.SQRT2);
  public az: number = Math.PI / 4;
  public taz: number = Math.PI / 4;
  private distance: number = 80;
  private viewHeight: number = 32;

  private raycaster = new THREE.Raycaster();
  private mouseVec = new THREE.Vector2();

  constructor() {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 400);
    this.updateCameraTransform();
  }

  public handleResize(width: number, height: number) {
    const aspect = width / height;
    this.viewHeight = Math.max(26, 50 / aspect);
    this.camera.left = (-this.viewHeight * aspect) / 2;
    this.camera.right = (this.viewHeight * aspect) / 2;
    this.camera.top = this.viewHeight / 2;
    this.camera.bottom = -this.viewHeight / 2;
    this.camera.updateProjectionMatrix();
  }

  public setZoom(zoomFactor: number) {
    this.camera.zoom = THREE.MathUtils.clamp(zoomFactor, 0.4, 7.5);
    this.camera.updateProjectionMatrix();
  }

  public zoomBy(ratio: number) {
    this.setZoom(this.camera.zoom * ratio);
  }

  public pan(dx: number, dy: number, screenHeight: number) {
    const k = this.viewHeight / this.camera.zoom / screenHeight;
    const sn = Math.sin(this.az);
    const cs = Math.cos(this.az);

    this.target.x += -cs * dx * k - sn * dy * k * 1.732;
    this.target.z += sn * dx * k - cs * dy * k * 1.732;

    // Keep target within world bounds
    this.target.x = THREE.MathUtils.clamp(this.target.x, -40, 80);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -40, 80);
  }

  public rotateLeft() {
    this.taz -= Math.PI / 2;
  }

  public rotateRight() {
    this.taz += Math.PI / 2;
  }

  public flyTo(x: number, z: number, y: number = 1.5, targetZoom?: number) {
    this.target.set(x, y, z);
    if (targetZoom !== undefined) {
      this.setZoom(targetZoom);
    }
  }

  public update(deltaTime: number) {
    // Smooth angle interpolation towards target azimuth
    this.az += (this.taz - this.az) * Math.min(1, deltaTime * 8);
    this.updateCameraTransform();
  }

  private updateCameraTransform() {
    const cosEL = Math.cos(this.EL);
    const sinEL = Math.sin(this.EL);
    const sinAz = Math.sin(this.az);
    const cosAz = Math.cos(this.az);

    this.camera.position.set(
      this.target.x + sinAz * cosEL * this.distance,
      this.target.y + sinEL * this.distance,
      this.target.z + cosAz * cosEL * this.distance
    );
    this.camera.lookAt(this.target);
  }

  public getRaycaster(screenX: number, screenY: number, screenW: number, screenH: number): THREE.Raycaster {
    this.mouseVec.x = (screenX / screenW) * 2 - 1;
    this.mouseVec.y = -(screenY / screenH) * 2 + 1;
    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    return this.raycaster;
  }
}
