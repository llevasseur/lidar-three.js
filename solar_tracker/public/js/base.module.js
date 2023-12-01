/**
 * A template white base rectangle geometry to place objects on top of
 */
import * as THREE from 'three'
import {menuSettings} from './menu.module.js'


class Base {
    constructor(scene, parentObject, width = 300, height = 300, name) {
        this.scene = scene
        this.parentObject = parentObject
        this.name = name
        
        this.createBase(width, height)
    }

    createBase(width, height) {
        let geometry = new THREE.BoxBufferGeometry( width, height, 10 )
        let material = new THREE.MeshPhongMaterial( { color: 0x808080 })
        this.base = new THREE.Mesh( geometry, material )
        this.base.receiveShadow = true

        this.base.position.set(
            this.parentObject.position.x,
            this.parentObject.position.y - 6,
            this.parentObject.position.z
        )

        this.base.rotation.x -= Math.PI/2
        console.log("Adding Base")
        this.base.name = this.name
        this.scene.add(this.base)
    }
}

export {Base}