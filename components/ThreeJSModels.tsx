import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense } from "react";
import React, { useRef } from "react";

const Model = ({ modelPath, position, scale, rotationSpeed }) => {
  const gltf = useLoader(GLTFLoader, modelPath);
  const myMesh = useRef();

  useFrame(({ clock }) => {
    myMesh.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
  });

  return (
    <mesh ref={myMesh} position={position}>
      <primitive object={gltf.scene} scale={scale} />
      <primitive object={gltf.scene.clone()} scale={scale}/>
      
    </mesh>
  );
};

export default function ThreeJSModels() {

  return (
    <div className="opacity-0 lg:opacity-100 z-1 ">
    <div className="absolute  lg:-left-16 2xl:left-0">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }} // Adjust camera position and fov
        style={{ width: "20vw", height: "60rem" }} // Adjust Canvas size
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} /> {/* Move the ambient light outside the models */}
          <Model
            modelPath="./Videogame.glb"
            position={[0, 5, 0]}
            scale={[0.3, 0.3, 0.3]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./VideogameController.glb"
            position={[0, 1, 0]}
            scale={[0.1, 0.1, 0.1]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./Videogame.glb"
            position={[0, -6, 0]}
            scale={[0.3, 0.3, 0.3]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./VideogameController.glb"
            position={[0, -10, 0]}
            scale={[0.1, 0.1, 0.1]}
            rotationSpeed={0.6}
          />
          
        </Suspense>
      </Canvas>
    </div>
    <div className="absolute lg:-right-16 2xl:right-0">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }} // Adjust camera position and fov
        style={{ width: "20vw", height: "60rem" }} // Adjust Canvas size
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} /> {/* Move the ambient light outside the models */}
          <Model
            modelPath="./Videogame.glb"
            position={[0, 5, 0]}
            scale={[0.3, 0.3, 0.3]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./VideogameController.glb"
            position={[0, 1, 0]}
            scale={[0.1, 0.1, 0.1]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./Videogame.glb"
            position={[0, -6, 0]}
            scale={[0.3, 0.3, 0.3]}
            rotationSpeed={0.6}
          />
          <Model
            modelPath="./VideogameController.glb"
            position={[0, -10, 0]}
            scale={[0.1, 0.1, 0.1]}
            rotationSpeed={0.6}
          />
          
        </Suspense>
      </Canvas>
    </div>
    </div>
  );
}
