import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          if (headBone) {
            // Create glasses
            const glassesGroup = new THREE.Group();
            const material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
            const glassMaterial = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              transmission: 0.9,
              opacity: 1,
              metalness: 0,
              roughness: 0,
              ior: 1.5,
              thickness: 0.01,
            });
            
            // Rims
            const rimGeometry = new THREE.TorusGeometry(0.04, 0.0015, 16, 32);
            const leftRim = new THREE.Mesh(rimGeometry, material);
            leftRim.position.set(-0.055, 0, 0);
            const rightRim = new THREE.Mesh(rimGeometry, material);
            rightRim.position.set(0.055, 0, 0);

            // Lenses
            const lensGeometry = new THREE.CylinderGeometry(0.038, 0.038, 0.001, 32);
            const leftLens = new THREE.Mesh(lensGeometry, glassMaterial);
            leftLens.rotation.x = Math.PI / 2;
            leftLens.position.set(-0.055, 0, 0);
            const rightLens = new THREE.Mesh(lensGeometry, glassMaterial);
            rightLens.rotation.x = Math.PI / 2;
            rightLens.position.set(0.055, 0, 0);
            
            // Bridge
            const bridgeGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 8);
            const bridge = new THREE.Mesh(bridgeGeometry, material);
            bridge.rotation.z = Math.PI / 2;
            
            // Arms pointing backwards into the hair at the temples (not ears)
            const armGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.1, 8); 
            armGeometry.rotateX(Math.PI / 2); // Align with Z axis
            armGeometry.translate(0, 0, -0.05); // Move pivot to the front tip

            const leftArm = new THREE.Mesh(armGeometry, material);
            leftArm.position.set(-0.095, 0, 0); // Attach to left rim
            leftArm.rotation.set(0, 0.15, 0); // No pitch, slighter Yaw OUTWARDS (+0.15)

            const rightArm = new THREE.Mesh(armGeometry, material);
            rightArm.position.set(0.095, 0, 0); // Attach to right rim
            rightArm.rotation.set(0, -0.15, 0); // No pitch, slighter Yaw OUTWARDS (-0.15)
            
            glassesGroup.add(leftRim, rightRim, leftLens, rightLens, bridge, leftArm, rightArm);
            
            // Adjust scale, position and rotation relative to the head bone.
            // A scale of 9 and properly spaced lenses should fit better
            glassesGroup.scale.set(9, 9, 9);
            glassesGroup.position.set(0, 1.25, 1.15); // Raised Y slightly and pushed Z to sit nicely on the nose
            // Rotate slightly if needed depending on bone orientation
            // glassesGroup.rotation.x = -Math.PI / 16;
            
            headBone.add(glassesGroup);
          }
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, character)
          );
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
