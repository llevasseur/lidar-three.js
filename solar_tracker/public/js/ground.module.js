/**
 * @file Class for ground component in THREEJS.
 * @module ground
 * @author Leevon Levasseur <wisertechleevon@gmail.com>
 * @version 0.0.1
 * @copyright Wisertech
 * 
 * @todo Create constructor
 * @todo Test jsdoc 3 for a module/class
 * @todo Add functions to get,set,delete,rename,etc
 */

/** Imports */
import * as THREE from 'three'
import {menuSettings} from './menu.module.js'
import {pi} from './common.module.js'

let params = menuSettings.terrain.ground

/**
 * Create a ground plane with a height map mountain for a THREEjs world.
 * @constructor
 */
class Ground {

    constructor(scene) {
        this.scene = scene

        this.update()
    }
    
    update() {

        this.createMountain()
        //this.createGround()
    }

    createMountain() {
        let mountainGeo = new THREE.PlaneGeometry(10000, 10000, params.widthSeg, params.heightSeg)

        let disMap = new THREE.TextureLoader()
            .setPath("./images/") // folder where height map images are
            .load(params.heightMap)  // heightmap filename from dat.gui choice
        // horizontal and vertical texture can repeat on object surface
        //disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping
        //disMap.repeat.set(params.horText, params.vertText)

        let textureMountain = new THREE.TextureLoader().load(
            "/images/terrain/Halalt3Dterrain3800.jpg"
        )
        textureMountain.wrapS = THREE.RepeatWrapping
        textureMountain.wrapT = THREE.RepeatWrapping
        textureMountain.repeat.set(1, 1)

        const mountainMat = new THREE.MeshStandardMaterial({
            color: 0x999999,
            wireframe: params.wireframe,
            displacementMap: disMap, // affects position of mesh vertices, white = highest, black = lowest
            displacementScale: params.dispScale, // how much disMap affects mesh (def = 1)
            map: textureMountain,
            side: THREE.DoubleSide,
            //vertexShader: document.getElementById('vertexShader').textContent,
            //fragmentShader: document.getElementById('fragmentShader').textContent,
        })

        this.mountain = new THREE.Mesh(mountainGeo, mountainMat)
        this.mountain.rotation.x = - pi / 2
        this.mountain.rotation.z = params.rotZ
        this.mountain.position.x = params.x
        this.mountain.position.y = params.y
        this.mountain.position.z = params.z
        this.mountain.receiveShadow = true 

        if (params.showGround) {
            this.scene.add(this.mountain)
            this.toggleGrid( false, 'grid' )
        } else {
            this.toggleGrid( true, 'grid' )
        }
    }

    positionMountain() {
        this.mountain.position.x = params.x
        this.mountain.position.y = params.y
        this.mountain.position.z = params.z
    }

    toggleGrid( show, name ) {
        let gridInScene = this.scene.getObjectByName( 'grid' )
        if ( gridInScene ) {
            if ( show ) { gridInScene.visible = true }
            else {
                gridInScene.visible = false
            }
            return
        }

        const grid = new THREE.GridHelper( 30000, 100, 0x888888, 0x444444 )
        grid.name = name
        grid.position.set( 0, 70, 0 )
        grid.material.transparent = true
        grid.material.opacity = 0.5

        if ( ! show ) grid.visible = false
        this.scene.add( grid )
    }

    createGround() {

        let groundGeo = new THREE.PlaneGeometry(16000, 16000)

        let textureGround = new THREE.TextureLoader().load(
            "/images/terrain/grasslight-big.jpeg"
        )
        textureGround.wrapS = THREE.RepeatWrapping
        textureGround.wrapT = THREE.RepeatWrapping
        textureGround.repeat.set(1, 1)

        let material = new THREE.MeshLambertMaterial({ 
            map: textureGround,
            color: 0x999999,
            side: THREE.DoubleSide,
        })

        this.ground = new THREE.Mesh( groundGeo, material )

        this.ground.rotation.x = - pi / 2
        this.ground.position.y = -0.5
        this.ground.material.map.repeat.set( 256, 256 )
        this.ground.material.map.wrapS = THREE.RepeatWrapping
        this.ground.material.map.wrapT = THREE.RepeatWrapping
        this.ground.material.map.encoding = THREE.sRGBEncoding
        this.ground.receiveShadow = true

        this.scene.add(this.ground)
        
    }
}

export{ Ground }