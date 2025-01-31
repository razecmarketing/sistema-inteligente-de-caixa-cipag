class HeaderParticles {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / 200, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, 200);
    this.container.appendChild(this.renderer.domElement);

    this.particles = [];
    this.createParticles();

    this.camera.position.z = 5;
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 500; i++) {  
      positions.push(
        Math.random() * 15 - 7.5,  
        Math.random() * 3 - 1.5,   
        Math.random() * 15 - 7.5   
      );

      colors.push(
        0.2 + Math.random() * 0.8,  
        0.2 + Math.random() * 0.8,  
        0.2 + Math.random() * 0.8   
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,      
      vertexColors: true,
      transparent: true,
      opacity: 0.9  
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.particleSystem.rotation.y += 0.002;  
    this.particleSystem.rotation.x += 0.001;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / 200;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, 200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HeaderParticles('header-particles');
});