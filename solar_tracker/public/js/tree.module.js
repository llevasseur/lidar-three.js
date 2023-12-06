import * as THREE from 'three'
import { ObjectFromMTLOBJModel, ObjectAndMeshFromGLTFModel } from './loaders.module.js'
import { VertexNormalsHelper } from 'three/addons/VertexNormalsHelper.js'

import { menuSettings } from './menu.module.js'
import { sky, stats } from './scene.module.js'
import { time, dt } from './vis.module.js'

let treeParams = menuSettings.objects.trees

/**
 * Constructs a Tree from PolyCam
 * @constructor
 * 
 */
class Tree {

    constructor(scene, name) {
        this.scene = scene
        this.params = treeParams
        this.name = name
        
        this.createTree()
    }
    
    transformAndLabel() {
        this.scale()
        this.rotate()
        this.position()

        this.createIntensityBar()
        this.labelIntensity()
    }

    async createTree() {
        let gltfMesh

        
        ObjectAndMeshFromGLTFModel(this.name, './models/trees/', 'scene.gltf')
            .then((result) => {
                this.tree = result[0]
                gltfMesh = result[1]

                this.helper = new VertexNormalsHelper( result[1], 100, 0xff0000 );
                this.helper.matrixAutoUpdate = true

                this.scene.add(this.tree, this.helper)

                this.transformAndLabel()
                this.getNormal()

            })

        
    }

    scale() {
        this.tree.scale.set( 4, 4, 4 )
    }

    rotate() {
        /*
        this.tree.rotation.x = this.params.rotX
        this.helper.rotation.x = this.params.rotX

        this.tree.rotation.y = this.params.rotY
        this.helper.rotation.y = this.params.rotY

        this.tree.rotation.z = this.params.rotZ
        this.helper.rotation.z = this.params.rotZ*/
    }

    getNormal() {
        let normalMatrix = new THREE.Matrix3().getNormalMatrix( this.tree.matrixWorld )
        this.normal = new THREE.Vector3(
            normalMatrix.elements[3],
            normalMatrix.elements[4],
            normalMatrix.elements[5]
        ) 
    }

    position() {
        /*
        this.tree.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )
        this.helper.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )
        */
    }

    animate() {

    }
}

export {Tree}