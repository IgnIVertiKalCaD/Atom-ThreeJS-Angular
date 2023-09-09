import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {ArcballControls} from "three/examples/jsm/controls/ArcballControls";
import Stats from 'three/examples/jsm/libs/stats.module';
import {GUI} from 'dat.gui'
import {func} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";

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
      kernelRadius: 25
    }
    //
    let protons = 92;
    let neitrons = 92;

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

    const el_radius = 60;

    const levels_electrons = [
      {radius: el_radius, electrons: 2},
      {radius: el_radius * 2, electrons: 8},
      {radius: el_radius * 3, electrons: 18},
      {radius: el_radius * 4, electrons: 32},
      {radius: el_radius * 5, electrons: 21},
      {radius: el_radius * 6, electrons: 9},
      {radius: el_radius * 7, electrons: 2},
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
      return number - (number * (percent / 100));
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
    light.position.set(1, 0, 0); //default; light shining from top
    light.castShadow = true; // default false
    scene.add(light);

    let camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 10000
    );
    camera.position.z = 0;
    camera.position.x = 200;
    camera.position.y = 0;
    scene.add(camera);

    // The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);

    const controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.addEventListener('change', function () {
      // console.log(camera.position)
    });
    controls.update();

    function createElectrons(radius: number, electrons: number) {
      for (let i = 0; i < electrons; i++) {
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(8, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
          })
        )

        let speed = getRandomInt(0.001, 0.0001);

        // dev
        // let speed = 0.001;

        let add_rotate = getRandomInt(-2, 2);

        let rotate_z = getRandomInt(0, 50);

        let orbit_angle = Math.random() < 0.5;
        let direction = 1;

        if (!orbit_angle) {
          direction = direction * -1;
        }


        (function anim() {

          requestAnimationFrame(anim);
          const angle = performance.now() * speed;

          electron.position.x = (radius * Math.cos(angle + add_rotate)) * direction;
          electron.position.z = (minusPercent((radius * Math.cos(angle - add_rotate)), rotate_z));
          electron.position.y = (radius * Math.sin(angle + add_rotate)) * direction;

        })()

        // setInterval(() => {
        //   console.group()
        //   console.log(electron.position.x)
        //   console.log(electron.position.y)
        //   console.log(electron.position.z)
        //   console.groupEnd()
        // }, 1000)

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
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);

        const x = kernelOpt.kernelRadius * Math.sin(phi) * Math.cos(theta);
        const y = kernelOpt.kernelRadius * Math.sin(phi) * Math.sin(theta);
        const z = kernelOpt.kernelRadius * Math.cos(phi);

        neitron.position.set(x, y, z);

        scene.add(neitron)
      }

      for (let i = 0; i < protons; i++) {
        const proton = new THREE.Mesh(
          new THREE.SphereGeometry(assets_protons.radius, assets_protons.WSegments, assets_protons.HSegments),
          new THREE.MeshStandardMaterial({
            color: assets_protons.color,
          })
        );

        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);

        const x = kernelOpt.kernelRadius * Math.sin(phi) * Math.cos(theta);
        const y = kernelOpt.kernelRadius * Math.sin(phi) * Math.sin(theta);
        const z = kernelOpt.kernelRadius * Math.cos(phi);

        proton.position.set(x, y, z);

        scene.add(proton);
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
    document.body.appendChild(stats.dom);

    const gui = new GUI()
    const kernelOptions = gui.addFolder('kernel')
    // kernelOptions.add(kernelOpt, 'kernelRadius',1, 300)
    kernelOptions.open()

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(camera.position, 'z', 100, 400)
    cameraFolder.open()

    setInterval(() => {
    }, 5000)


    setInterval(() => {
      renderer.render(scene, camera);
      stats.update();
    }, 1)
  }

}
