import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense } from "react";
import React from "react";

const Model = () => {
  const gltf = useLoader(GLTFLoader, "./Videogame.glb");
  const myMesh = React.useRef();

  useFrame(({ clock }) => {
    myMesh.current.rotation.y = clock.getElapsedTime();
  });

  return (
    <mesh ref={myMesh}>
      <primitive object={gltf.scene} scale={[0.4, 0.4, 0.4]} /> {/* Adjust the scale vector */}
      <ambientLight intensity={1.5} />
    </mesh>
  );
};

export default function App() {
  return (
    <div className="absolute left-28 top-40">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }} // Adjust camera position and fov
        style={{ width: "20vw", height: "100vh" }} // Adjust Canvas size
      >
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}
