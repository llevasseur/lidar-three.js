import * as THREE from 'three'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'

export default class Sketch{

    constructor(){

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        document.getElementById("container").appendChild( this.renderer.domElement )

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

        this.camera.position.z = 5

        this.addMesh()

        this.time = 0
        this.render()
        
    }

    addMesh(){
        this.geometry = new THREE.PlaneGeometry( 1, 1 )
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                progress: {type: "f", value: 0}
            },
            side: THREE.DoubleSide
        })
        this.cube = new THREE.Mesh( this.geometry, this.material )
        this.scene.add( this.cube )
    }

    render() {
        this.time++
        this.cube.rotation.x += 0.01
	    this.cube.rotation.y += 0.01
        //console.log(this.time)
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch()