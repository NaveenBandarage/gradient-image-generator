"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Scene3DProps {
  colors: string[];
  angle?: number;
  pattern?: string;
  noiseEnabled?: boolean;
  noiseType?: string;
  noiseIntensity?: number;
  noiseScale?: number;
}

export default function Scene3D({
  colors,
  angle = 45,
  pattern = "Linear",
  noiseEnabled = false,
  noiseType = "perlin",
  noiseIntensity = 0.3,
  noiseScale = 50,
}: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Create gradient plane
    const geometry = new THREE.PlaneGeometry(10, 10);
    const gradientTexture = createGradientTexture(colors);
    const material = new THREE.MeshBasicMaterial({
      map: gradientTexture,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      gradientTexture.dispose();
    };
  }, []);

  // Update gradient when colors change
  useEffect(() => {
    if (!sceneRef.current) return;
    const plane = sceneRef.current.children[0] as THREE.Mesh;
    const gradientTexture = createGradientTexture(colors);
    (plane.material as THREE.MeshBasicMaterial).map = gradientTexture;
    (plane.material as THREE.MeshBasicMaterial).needsUpdate = true;
  }, [
    colors,
    angle,
    pattern,
    noiseEnabled,
    noiseType,
    noiseIntensity,
    noiseScale,
  ]);

  // Helper function to create gradient texture
  const createGradientTexture = (colors: string[]) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    let gradient;
    switch (pattern) {
      case "Radial":
        gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2
        );
        break;
      case "Conic":
        // First rotate the canvas for the angle
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Create conic gradient
        const conicGradient = ctx.createConicGradient(
          0,
          canvas.width / 2,
          canvas.height / 2
        );
        gradient = conicGradient;
        break;
      case "Wave":
        // Create base gradient
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        break;
      default: // Linear
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    }

    // Add color stops
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add wave pattern if selected
    if (pattern === "Wave") {
      // Add wavy pattern overlay
      const waveFrequency = 20;
      const waveAmplitude = 10;
      ctx.globalCompositeOperation = "overlay";

      for (let x = 0; x < canvas.width; x += 2) {
        const y = Math.sin(x / waveFrequency) * waveAmplitude;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(x, y + canvas.height / 2, 2, 2);
      }
      ctx.globalCompositeOperation = "source-over";
    }

    // Add noise if enabled
    if (noiseEnabled) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseIntensity * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }

      ctx.putImageData(imageData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  return <div ref={containerRef} className="w-full h-full" />;
}
