/**
 * @file Class for house in SPIC3D.
 * @module house
 * @author Leevon Levasseur <wisertechleevon@gmail.com>
 * @version 0.0.1
 * @copyright Wisertech
 * 
 * @todo Make position, rotation, scale modular
 */

/** Imports */
import * as THREE from 'three'
import { ObjectFromGLTFModel } from './loaders.module.js'
import { menuSettings } from './menu.module.js'

let params = menuSettings.objects.house
/**
 * Create a house for a THREEjs world.
 * @constructor
 */
class House {

    constructor(scene, name) {
        this.scene = scene
        this.name = name
        this.createGLTFHouse()

    }


    createGLTFHouse() {
        let scale = new THREE.Vector3( 18.5, 18, 22 )
        let rotation = new THREE.Vector3( 0, -0.02, 0 )
        let position = new THREE.Vector3( 152, 205, -198 )
        ObjectFromGLTFModel(this.name, './models/house_v_1/', 'scene.gltf', scale, rotation, position)
            .then((result) => {
                this.house = result
                this.scene.add(this.house)
            })
        
    }

}

export{ House }