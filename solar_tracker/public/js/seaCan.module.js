/**
 * @file Class for seaCan in SPIC3D.
 * @module seaCan
 * @author Leevon Levasseur <wisertechleevon@gmail.com>
 * @version 0.0.1
 * @copyright Wisertech
 * 
 * @todo Create Base
 */

/** Imports */
import * as THREE from 'three'
import { ObjectFromGLTFModel } from './loaders.module.js'
import { menuSettings } from './menu.module.js'
import { Base } from './base.module.js'

let params = menuSettings.objects.seacan
/**
 * Create a SeaCan for a THREEjs world.
 * @constructor
 */
class SeaCan {

    constructor(scene, name) {
        this.scene = scene
        this.name = name
        this.createGLTFSeaCan()

    }


    createGLTFSeaCan() {
        let scale = new THREE.Vector3( 20, 20, 20 )
        let rotation = new THREE.Vector3( 0, 0, 0 )
        let position = new THREE.Vector3( 600, 75, 225 )
        ObjectFromGLTFModel(this.name, './models/seacan_v_1/', 'scene.gltf', scale, rotation, position)
            .then((result) => {
                this.seacan = result
                this.scene.add(this.seacan)

                //create base
                this.base = new Base( this.scene, this.seacan, 600, 300, 'seaCan_base' )
                this.base.base.position.y += 5
                this.base.base.position.z -= 75

                
            })
        
    }

}

export{ SeaCan }