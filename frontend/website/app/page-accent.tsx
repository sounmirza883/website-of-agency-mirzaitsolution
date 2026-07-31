"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function PageAccentMark() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 0, 3.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.1));
    const key = new THREE.DirectionalLight(0xfff4d6, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    const group = new THREE.Group();

    const gem = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.85, 0),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.65, flatShading: true })
    );
    group.add(gem);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.03, 16, 96),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.6 })
    );
    ring.rotation.x = Math.PI / 2.2;
    group.add(ring);

    scene.add(group);

    const fit = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(mount);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frameId = 0;
    let t = 0;
    const tick = () => {
      t += 0.004;
      gem.rotation.x = t * 0.5;
      gem.rotation.y = t * 0.7;
      ring.rotation.z = t * 0.3;
      group.position.y = Math.sin(t * 1.1) * 0.08;
      renderer.render(scene, camera);
      if (!reduceMotion) frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      gem.geometry.dispose();
      ring.geometry.dispose();
      (gem.material as THREE.Material).dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="hero-accent-mark" aria-hidden="true" />;
}
