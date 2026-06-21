'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 120; // Slightly closer separation for denser visual look
		const AMOUNTX = 55;     // Increased from 40 for higher density
		const AMOUNTY = 75;     // Increased from 60 for higher density

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x000000, 2000, 10000); // Black fog to blend into black background

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 355, 1220);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, 0);

		containerRef.current.appendChild(renderer.domElement);

		// Create particles
		const positions: number[] = [];
		const colors: number[] = [];

		// Create geometry for all particles
		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; // Will be animated
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				
				// White/light-gray particles to stand out beautifully on black background
				colors.push(255, 255, 255); 
			}
		}

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// Create material
		const material = new THREE.PointsMaterial({
			size: 8,
			vertexColors: true,
			transparent: true,
			opacity: 0.8,
			sizeAttenuation: true,
		});

		// Create points object
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let animationId: number;

		// Animation function using performance.now() for guaranteed time-based motion
		const animate = () => {
			try {
				animationId = window.requestAnimationFrame(animate);

				const positionAttribute = geometry.attributes.position;
				if (!positionAttribute) return;

				const positionsArray = positionAttribute.array as Float32Array;
				const time = performance.now() * 0.001; // Current elapsed time in seconds

				let i = 0;
				for (let ix = 0; ix < AMOUNTX; ix++) {
					for (let iy = 0; iy < AMOUNTY; iy++) {
						const index = i * 3;

						// Animate Y position with sine waves using a faster time multiplier (4.0 instead of 1.5) for speed
						positionsArray[index + 1] =
							Math.sin((ix + time * 4.0) * 0.3) * 50 +
							Math.sin((iy + time * 4.0) * 0.5) * 50;

						i++;
					}
				}

				positionAttribute.needsUpdate = true;

				renderer.render(scene, camera);
			} catch (err) {
				console.error('Error in DottedSurface animation frame:', err);
			}
		};

		// Handle window resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		// Start animation
		animate();

		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);
			window.cancelAnimationFrame(animationId);

			// Clean up Three.js objects
			scene.traverse((object) => {
				if (object instanceof THREE.Points) {
					object.geometry.dispose();
					if (Array.isArray(object.material)) {
						object.material.forEach((mat) => mat.dispose());
					} else {
						object.material.dispose();
					}
				}
			});

			renderer.dispose();

			if (containerRef.current && renderer.domElement) {
				containerRef.current.removeChild(renderer.domElement);
			}
		};
	}, []); // Empty dependency array ensures it initializes only ONCE on mount

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed inset-0 -z-10', className)}
			{...props}
		/>
	);
}
