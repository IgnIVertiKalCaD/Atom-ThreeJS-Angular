import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {ArcballControls} from "three/examples/jsm/controls/ArcballControls";
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.createThreeJsBox();
  }

  createThreeJsBox(): void {
    let kernelOpt = {
      kernelRadius: 40
    }

    let protons = 73;
    let neitrons = 73;

    const assets_protons = {
      color: 0x0096FF,
      radius: 10,
      WSegments: 8,
      HSegments: 8
    }

    const assets_neitrons = {
      color: 0xFF0000,
      radius: 10,
      WSegments: 8,
      HSegments: 8
    }

    const levels_electrons = [
      {radius: 60, electrons: 2},
      {radius: 90, electrons: 8},
      {radius: 120, electrons: 18},
      {radius: 150, electrons: 32},
      {radius: 180, electrons: 21},
      {radius: 210, electrons: 9},
      {radius: 240, electrons: 2},
    ]

    function getRandomArbitrary(radius: number) {
      const r = Math.random() * radius;

      const azimuthalAngle = Math.random() * Math.PI * 2;

      const polarAngle = Math.random() * Math.PI - Math.PI / 2;

      const x = r * Math.cos(azimuthalAngle) * Math.cos(polarAngle);
      const y = r * Math.sin(azimuthalAngle) * Math.cos(polarAngle);
      const z = r * Math.sin(polarAngle);

      return {x, y, z};
    }
    function getRandomInt(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    function minusPercent(number: number, percent: number) {
      return number - (number * (percent/100));
    }

    let renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1); //default; light shining from top
    light.castShadow = true; // default false
    scene.add(light);

    let camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 10000
    );
    camera.position.z = 155;
    camera.position.y = 0;
    scene.add(camera);

    const controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.addEventListener('change', function () {
      // console.log(camera.position)
    });
    controls.update();

    function createElectrons(radius: number, electrons: number) {
      for (let i = 0; i < electrons; i++) {
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(4, 4, 4),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
          })
        )

        let speed = getRandomInt(0.001, 0.0001);

        // const random_boolean = Math.random() < 0.5;
        // if (random_boolean) {
        //   speed = speed * -1;
        // }

        let add_rand_z = getRandomInt(0.1, 1);

        (function anim() {
          requestAnimationFrame(anim);
          const angle = performance.now() * speed;

          electron.position.x = radius * Math.cos(angle);
          electron.position.y = radius * Math.sin(angle);
          // electron.position.z = radius * (Math.cos(angle) * Math.sin(angle)) + add_rand_z;
          electron.position.z = minusPercent((electron.position.y + electron.position.x), 70);
        })()

        scene.add(electron)
      }
    }

    levels_electrons.forEach(el => {
      createElectrons(el.radius, el.electrons)
    });

    (function createKernel() {
      for (let i = 0; i < neitrons; i++) {
        const neitron = new THREE.Mesh(
          new THREE.SphereGeometry(assets_protons.radius, assets_neitrons.WSegments, assets_neitrons.HSegments),
          new THREE.MeshStandardMaterial({
            color: assets_neitrons.color,
          })
        )

        let x = getRandomArbitrary(kernelOpt.kernelRadius).x
        let y = getRandomArbitrary(kernelOpt.kernelRadius).y
        let z = getRandomArbitrary(kernelOpt.kernelRadius).z

        neitron.castShadow = true;
        neitron.receiveShadow = false;

        neitron.position.x = x
        neitron.position.y = y
        neitron.position.z = z

        scene.add(neitron)
      }

      for (let i = 0; i < protons; i++) {
        const proton = new THREE.Mesh(
          new THREE.SphereGeometry(assets_protons.radius, assets_protons.WSegments, assets_protons.HSegments),
          new THREE.MeshStandardMaterial({
            color: assets_protons.color,
          })
        )

        let x = getRandomArbitrary(kernelOpt.kernelRadius).x
        let y = getRandomArbitrary(kernelOpt.kernelRadius).y
        let z = getRandomArbitrary(kernelOpt.kernelRadius).z

        proton.castShadow = true;
        proton.receiveShadow = false;

        proton.position.x = x
        proton.position.y = y
        proton.position.z = z

        scene.add(proton)
      }
    })()

    function createStats() {
      let stats = new Stats();

      stats.dom.style.position = 'absolute';
      stats.dom.style.left = '0';
      stats.dom.style.top = '0';

      stats.dom.className = 'stats';

      return stats;
    }

    const stats = createStats();
    document.body.appendChild( stats.dom );

    const gui = new GUI()
    const kernelOptions = gui.addFolder('kernel')
    kernelOptions.add(kernelOpt, 'kernelRadius',1, 300)
    kernelOptions.open()

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(camera.position, 'z', 100, 400)
    cameraFolder.open()

    setInterval(() => {
    }, 5000)


    setInterval(() => {
      renderer.render(scene, camera);
      stats.update();
    }, 15)
  }

}
