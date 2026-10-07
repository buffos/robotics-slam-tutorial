import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineLoop,
  LineSegments,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { robotTransform } from "./robot-transform";
import { cameraFieldOfView } from "./camera-framing";
import type { RobotPose } from "../simulation/robot-state";
import type { WorldDefinition } from "../simulation/world";

export type CameraView = "perspective" | "top";

export class ArenaView {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private readonly renderer: WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly robot = new Group();
  private readonly resizeObserver: ResizeObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    world: WorldDefinition,
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.scene.background = new Color(0x112934);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 38;
    this.controls.minPolarAngle = 0.00001;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.setCamera("perspective");

    this.addLighting(world);
    this.addFloor(world);
    this.addLandmarks(world);
    this.addRobot(world.robot.radius);
    this.scene.add(this.robot);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  setCamera(view: CameraView): void {
    // Flush damping before a preset so a previous drag cannot move the new view.
    this.controls.enableDamping = false;
    this.controls.update();
    this.controls.target.set(0, 0, 0);
    if (view === "top") {
      this.camera.position.set(0, 22, 0.001);
    } else {
      this.camera.position.set(11, 14, 13);
    }
    this.controls.enableRotate = view === "perspective";
    this.controls.update();
    this.controls.enableDamping = true;
  }

  render(pose: RobotPose): void {
    // Read the simulator's finished pose and move the mesh to match it.
    // Mesh positions and OrbitControls never feed back into robot state.
    const transform = robotTransform(pose);
    this.robot.position.set(transform.x, transform.y, transform.z);
    this.robot.rotation.y = transform.rotationY;
    // This control updates the inspection camera, independently of driving.
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    this.controls.dispose();
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    this.scene.traverse((object) => {
      if ("geometry" in object && object.geometry instanceof BufferGeometry) {
        geometries.add(object.geometry);
      }
      if ("material" in object) {
        const value = object.material;
        if (value instanceof Material) materials.add(value);
        else if (Array.isArray(value))
          value.forEach((material: Material) => materials.add(material));
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => {
      if ("map" in material && material.map instanceof Texture)
        material.map.dispose();
      material.dispose();
    });
    this.renderer.dispose();
  }

  private resize(): void {
    const width = Math.max(this.canvas.clientWidth, 1);
    const height = Math.max(this.canvas.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.fov = cameraFieldOfView(this.camera.aspect);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private addLighting(world: WorldDefinition): void {
    this.scene.add(new AmbientLight(0xffffff, 0.5));
    this.scene.add(new HemisphereLight(0xcce9ff, 0x223c46, 2));
    const light = new DirectionalLight(0xfff2dc, 3);
    light.position.set(-4, 14, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -world.width;
    light.shadow.camera.right = world.width;
    light.shadow.camera.top = world.height;
    light.shadow.camera.bottom = -world.height;
    light.shadow.normalBias = 0.025;
    this.scene.add(light);
  }

  private addFloor(world: WorldDefinition): void {
    const floor = new Mesh(
      new BoxGeometry(world.width, 0.12, world.height),
      new MeshStandardMaterial({ color: 0x2a4653, roughness: 0.9 }),
    );
    floor.position.y = -0.06;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const halfWidth = world.width / 2;
    const halfHeight = world.height / 2;
    const vertices: number[] = [];
    for (let x = -halfWidth; x <= halfWidth; x++) {
      vertices.push(x, 0.006, -halfHeight, x, 0.006, halfHeight);
    }
    for (let z = -halfHeight; z <= halfHeight; z++) {
      vertices.push(-halfWidth, 0.006, z, halfWidth, 0.006, z);
    }
    const grid = new BufferGeometry();
    grid.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.scene.add(
      new LineSegments(
        grid,
        new LineBasicMaterial({
          color: 0x5b7b87,
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );

    const border = new BufferGeometry();
    border.setAttribute(
      "position",
      new Float32BufferAttribute(
        [
          -halfWidth,
          0.015,
          -halfHeight,
          halfWidth,
          0.015,
          -halfHeight,
          halfWidth,
          0.015,
          halfHeight,
          -halfWidth,
          0.015,
          halfHeight,
        ],
        3,
      ),
    );
    this.scene.add(
      new LineLoop(border, new LineBasicMaterial({ color: 0xa8c5cd })),
    );
  }

  private addLandmarks(world: WorldDefinition): void {
    const material = new MeshStandardMaterial({
      color: 0xeeb98b,
      roughness: 0.55,
    });
    const ringMaterial = new MeshStandardMaterial({
      color: 0xeeb98b,
      emissive: 0x67402a,
      roughness: 0.5,
    });
    const postGeometry = new CylinderGeometry(0.12, 0.18, 0.8, 20);
    const capGeometry = new SphereGeometry(0.17, 20, 12);
    const ringGeometry = new TorusGeometry(0.36, 0.02, 8, 32);
    for (const landmark of world.landmarks) {
      const marker = new Group();
      marker.position.set(landmark.x, 0, -landmark.y);
      const post = new Mesh(postGeometry, material);
      post.position.y = 0.4;
      post.castShadow = true;
      marker.add(post);
      const cap = new Mesh(capGeometry, material);
      cap.position.y = 0.88;
      cap.castShadow = true;
      marker.add(cap);
      const ring = new Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.025;
      marker.add(ring);
      const label = this.label(landmark.id);
      label.position.y = 1.4;
      marker.add(label);
      this.scene.add(marker);
    }
  }

  private addRobot(radius: number): void {
    const bodyMaterial = new MeshStandardMaterial({
      color: 0xe4efeb,
      roughness: 0.4,
      metalness: 0.1,
    });
    const body = new Mesh(
      new CylinderGeometry(radius * 0.88, radius * 0.88, 0.22, 40),
      bodyMaterial,
    );
    body.position.y = 0.24;
    body.castShadow = true;
    this.robot.add(body);

    const deck = new Mesh(
      new CylinderGeometry(radius * 0.7, radius * 0.7, 0.08, 32),
      new MeshStandardMaterial({ color: 0x55c5ae, roughness: 0.45 }),
    );
    deck.position.y = 0.39;
    deck.castShadow = true;
    this.robot.add(deck);

    const wheelGeometry = new CylinderGeometry(0.14, 0.14, 0.08, 24);
    const wheelMaterial = new MeshStandardMaterial({
      color: 0x182d34,
      roughness: 0.9,
    });
    for (const side of [-1, 1]) {
      const wheel = new Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(0, 0.14, side * 0.3);
      wheel.castShadow = true;
      this.robot.add(wheel);
    }

    const nose = new Mesh(
      new ConeGeometry(0.09, 0.28, 3),
      new MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x274e45,
        roughness: 0.4,
      }),
    );
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(0.2, 0.49, 0);
    this.robot.add(nose);
    const ring = new Mesh(
      new TorusGeometry(radius - 0.015, 0.01, 8, 40),
      new MeshStandardMaterial({ color: 0x8ee4ce, emissive: 0x2f7663 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    this.robot.add(ring);
  }

  private label(text: string): Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("A 2D canvas context is required for landmark labels.");
    context.fillStyle = "#142d38";
    context.beginPath();
    context.roundRect(4, 4, 120, 56, 12);
    context.fill();
    context.fillStyle = "#f1c49e";
    context.font = "600 36px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 64, 32);
    const texture = new CanvasTexture(canvas);
    const sprite = new Sprite(
      new SpriteMaterial({ map: texture, transparent: true }),
    );
    sprite.scale.set(0.8, 0.4, 1);
    return sprite;
  }
}
