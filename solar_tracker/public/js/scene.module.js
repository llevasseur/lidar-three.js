/**
 * Modular script to set up a three.js scene
 * @todo Make camera position modular
 * @todo Test other forms of pointers with outline pass
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/OrbitControls.js'
import WebGL from 'three/addons/WebGL.js'
import Stats from 'three/addons/stats.module.js'
import { EffectComposer } from 'three/addons/EffectComposer.js'
import { RenderPass } from 'three/addons/RenderPass.js'
import { OutlinePass } from 'three/addons/OutlinePass.js'
import { ShaderPass } from 'three/addons/ShaderPass.js'
import { FXAAShader } from 'three/addons/FXAAShader.js'
import {render} from './vis.module.js'
import { MySky } from './sky.module.js'
import { Ground } from './ground.module.js'
import { Solar } from './solar.module.js'
import { House } from './house.module.js'
import { Wire } from './wire.module.js'
import { EnergyFlow } from './energyFlow.module.js'
import { SeaCan } from './seaCan.module.js'

export let scene, camera, renderer, controls, container, stats, sky
export let ground, staticSolar, trackingSolar, house, trackingWire
export let flow, seaCan
export let manager, composer, status=false

let effectFXAA, outlinePass
let mouse = new THREE.Vector2()
let raycaster = new THREE.Raycaster()
let selectedObjects = []

/** Determines if browser can host webGL 2 */
if ( WebGL.isWebGL2Available() === false ) {

    document.body.appendChild( WebGL.getWebGL2ErrorMessage() )

}

function initScene() {
    setTimeout(() => {
        status = true
    }, 10000)
    container = document.getElementById( 'container' )
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap
    //renderer.shadowMap.renderSingleSided = false // default is true
    //renderer.toneMapping = THREE.ACESFilmicToneMapping
    container.appendChild( renderer.domElement )
    //renderer.outputEncoding = THREE.sRGBEncoding
    

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 2000000 )
    camera.position.set( -700, 250, 0 ) // Make modular
    camera.up = new THREE.Vector3(0, 1, 0)
    //camera.lookAt(100, 0, 0)

    scene = new THREE.Scene()
    scene.background = new THREE.Color( 'light grey' )

    let ambientLight = new THREE.AmbientLight( 0xffffff, 0.25 )

    scene.add( ambientLight )

    controls = new OrbitControls( camera, renderer.domElement )
    //controls.maxPolarAngle = Math.PI * 0.5;
    controls.target.set( 20, 10, 20 )
    controls.minDistance = 4.0
    controls.maxDistance = 20000.0
    controls.update()

    stats = new Stats()
    //container.appendChild( stats.dom )

    

    // Use a load manager (utilized by loader.module.js) 
    // to determine when objects are loaded
    manager = new THREE.LoadingManager() 

    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total )

    }

    manager.onLoad = function() {
        postProcessing()
    }
    
}

function postProcessing() {
    composer = new EffectComposer( renderer )
    const renderPass = new RenderPass( scene, camera )
    composer.addPass( renderPass )

    /*outlinePass = new OutlinePass( 
        new THREE.Vector2( window.innerWidth, window.innerHeight ), 
        scene, camera 
    )
    composer.addPass( outlinePass )

    const textureLoader = new THREE.TextureLoader()

    textureLoader.load( '../images/textures/tri_pattern.jpg', function( texture) {
        outlinePass.patternTexture = texture
        texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
    })*/

    window.addEventListener( 'resize', onWindowResize )

    renderer.domElement.style.touchAction = 'none'
    //renderer.domElement.addEventListener( 'pointermove', onPointerMove )

}

function initSky() {
    sky = new MySky( scene )
    sky.update()
}

function initTerrain() {
    ground = new Ground( scene )
}

function initSolar() {
    staticSolar = new Solar( scene, 'staticSolarParams', '  Static Panel' )
    
    trackingSolar = new Solar( scene, 'trackingSolarParams', 'Tracking Panel', true )

}

function initHouse() {
    house = new House( scene, 'house1' )
}

function initSeaCan() {
    seaCan = new SeaCan( scene, 'seacan1' )
}

function connectTrackingToHouse() {
    trackingWire = new Wire( scene, [
        new THREE.Vector3( -10, 0, 10 ),
        new THREE.Vector3( -5, 5, 5 ),
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 5, -5, 5 ),
        new THREE.Vector3( 10, 0, 10 )
    ])
}

/*function createFlow() {
    flow = new EnergyFlow( scene )
}*/


function onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize( width, height )
    composer.setSize( width, height )
}

function onPointerMove( event ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

    checkIntersection()

}

function addSelectedObject( object ) { 
    selectedObjects = []
    selectedObjects.push( object )
}

function checkIntersection() {
    raycaster.setFromCamera( mouse, camera )

    // Intersects children of Scene (not children of children)
    const intersects = raycaster.intersectObject( scene, true )

    if ( intersects.length > 0 ) {
        // Expect a grouped mesh to be here
        const selectedObject = intersects[ 0 ].object
        addSelectedObject( selectedObject )
        outlinePass.selectedObjects = selectedObjects
    } 
}


export {
    initScene, initSky, initTerrain, 
    initSolar, initHouse, connectTrackingToHouse,
    postProcessing, initSeaCan
}