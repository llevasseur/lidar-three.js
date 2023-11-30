import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import GUI from "three/addons/libs/lil-gui.module.min.js"
//import gsap from "gsap"

const carPath = "../assets/models/glb/burnt-car-v1.glb"

class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene()

        this.container = options.dom
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height)
        this.renderer.setClearColor(0xeeeeee, 1)
        this.renderer.physicallyCorrectLights = true
        this.renderer.outputEncoding = THREE.sRGBEncoding
        
        this.container.appendChild(this.renderer.domElement)

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        )

        this.loader = new GLTFLoader()
        
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath("https://unpkg.com/three@0.158.0/examples/jsm/libs/draco/")
        this.loader.setDRACOLoader(this.dracoLoader)

        this.loader.load(carPath, (gltf) => {
            console.log(gltf)

            this.car = gltf.scene
            this.scene.add(this.car)
        })

        this.camera.position.set(0, 0, 2)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0
        
        this.isPlaying = true

        this.addObjects()
        this.resize()
        this.render = this.render.bind(this)
        this.render()
        this.setupResize()
        this.addLights()
        //this.settings()
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.3)
        this.scene.add( light1 )

        this.light2 = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI)
        this.light2.castShadow = true
        this.light2.shadow.camera.near = 0.1
        this.light2.shadow.camera.far = 20
        this.light2.shadow.bias = -0.01
        this.light2.shadow.camera.right = 10
        this.light2.shadow.camera.left = -10
        this.light2.shadow.camera.top = 10
        this.light2.shadow.camera.bottom = -10

        this.light2.shadow.mapSize.width = 2048
        this.light2.shadow.mapSize.height = 2048
        this.light2.position.set(2.7, 3, 0) // ~60 degrees
        this.scene.add( this.light2 )
    }

    settings() {
        this.settings = {
            progress: 0,
        }
        this.gui = new GUI()
        this.gui.add(this.settings, "progress")
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this))
    }

    resize() {
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer.setSize(this.width, this.height)
        this.camera.aspect = this.width / this.height

        this.camera.updateProjectionMatrix()
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#ectension GL_OES_standar_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            // wireframe: true,
            // transparent: true,
            // vertexShader: vertex,
            // fragmentShader: fragment
        })

        this.geometry = new THREE.PlaneGeometry()

        this.plane = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.plane)
    }

    render() {
        //requestAnimationFrame( this.render )
        this.renderer.render( this.scene, this.camera )
    }


}

new Sketch({
    dom: document.getElementById("container")
})