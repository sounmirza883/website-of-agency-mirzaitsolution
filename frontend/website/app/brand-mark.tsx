"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SEED_DEFS = [
  { r: 0.16, color: 0xf6a06b, x: 1.15, y: 0.45, z: 0.35 },
  { r: 0.11, color: 0xccdbb2, x: -0.95, y: -0.35, z: 0.6 },
  { r: 0.13, color: 0xffc6a5, x: 0.55, y: -0.75, z: -0.85 },
  { r: 0.09, color: 0xaebf92, x: -0.6, y: 0.85, z: -0.55 },
];

export function BrandMark() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(2.6, 1.9, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);

    const group = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0xc67139, roughness: 0.75, metalness: 0.05 })
    );
    core.scale.set(1, 0.86, 1);
    group.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.16, 32, 128),
      new THREE.MeshStandardMaterial({ color: 0x7a8a5e, roughness: 0.7, metalness: 0.05 })
    );
    ring.rotation.x = Math.PI / 2.4;
    ring.rotation.y = Math.PI / 10;
    group.add(ring);

    const seeds = SEED_DEFS.map((s) => {
      const seed = new THREE.Mesh(
        new THREE.SphereGeometry(s.r, 32, 32),
        new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.8, metalness: 0.03 })
      );
      seed.position.set(s.x, s.y, s.z);
      group.add(seed);
      return seed;
    });

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
      t += 0.006;
      core.rotation.y = t * 0.6;
      core.position.y = Math.sin(t * 1.3) * 0.05;
      ring.rotation.z = t * 0.4;
      seeds.forEach((seed, i) => {
        seed.position.y = SEED_DEFS[i].y + Math.sin(t * 1.6 + i) * 0.08;
      });
      group.rotation.y = t * 0.12;
      renderer.render(scene, camera);
      if (!reduceMotion) frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      core.geometry.dispose();
      ring.geometry.dispose();
      (core.material as THREE.Material).dispose();
      (ring.material as THREE.Material).dispose();
      seeds.forEach((seed) => {
        seed.geometry.dispose();
        (seed.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="hero-mark" aria-hidden="true" />;
}
