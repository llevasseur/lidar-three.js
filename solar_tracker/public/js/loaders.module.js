/**
 * Modular script to handle all loaders with THREE.js
 */

import * as THREE from 'three'
import { OBJLoader } from 'three/addons/OBJLoader.js'
import { MTLLoader } from 'three/addons/MTLLoader.js'
import { GLTFLoader } from 'three/addons/GLTFLoader.js'
import { manager } from './scene.module.js'

function ObjectFromOBJModel (name, path, objFile, scale) {
    return new Promise((resolve, reject) => {
        let object = new THREE.Object3D()
        new OBJLoader( manager )
          .setPath(path)
          .load(objFile,
            (newObject) => {
              newObject.name = name
              newObject.scale.set(scale, scale, scale)
              object.copy(newObject)
              resolve(object)

            }, undefined, (error) => {
              reject(error)
          })

    })
}

function ObjectFromMTLOBJModel (name, path, mtlFile, objFile, scale, rotation, position) {
    return new Promise((resolve, reject) => {
        let object = new THREE.Object3D()
        new MTLLoader( manager )
          .setPath(path)
          .load(mtlFile,
            (materials) => {
              materials.preload()

              new OBJLoader( manager )
              .setMaterials(materials)
              .setPath(path)
              .load(objFile,
                (newObject) => {
                  newObject.name = name
                  if (scale) newObject.scale.set(scale, scale, scale)
                  if (rotation) newObject.rotation.set(rotation.x, rotation.y, rotation.z)
                  if (position) newObject.position.set(position.x, position.y, position.z)
                  object.copy(newObject)
                  resolve(object)
                }, undefined, (error) => {
                  reject(error)
              })

            }, undefined, (error) => {
              reject(error)
          })
    })
}

function ObjectFromGLTFModel (name, path, gltfFile, scale, rotation, position) {
    return new Promise((resolve, reject) => {
        let object = new THREE.Object3D()
        new GLTFLoader( manager )
          .setPath(path)
          .load(gltfFile,
            (gltf) => {
              gltf.scene.traverse( function(child) {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
              })
              let newObject = gltf.scene 
              newObject.name = name
              if (scale) newObject.scale.set(scale.x, scale.y, scale.z)
              if (rotation) newObject.rotation.set(rotation.x, rotation.y, rotation.z)
              if (position) newObject.position.set(position.x, position.y, position.z)
              object.copy(newObject)
              resolve(object)

            }, undefined, (error) => {
              reject(error)
          })
    })
}

function ObjectAndMeshFromGLTFModel (name, path, gltfFile, scale, rotation, position) {
    return new Promise((resolve, reject) => {
        let object = new THREE.Object3D()
        let bufferMesh = new THREE.Mesh()
        new GLTFLoader( manager )
          .setPath(path)
          .load(gltfFile,
            (gltf) => {
              gltf.scene.traverse( function(child) {
                if (child.isMesh) {
                    bufferMesh.copy(child)
                    child.castShadow = true
                    child.receiveShadow = true
                }
              })
              let newObject = gltf.scene 
              newObject.name = name
              if (scale) newObject.scale.set(scale, scale, scale)
              if (rotation) newObject.rotation.set(rotation.x, rotation.y, rotation.z)
              if (position) newObject.position.set(position.x, position.y, position.z)
              object.copy(newObject)
              resolve([object, bufferMesh])

            }, undefined, (error) => {

              reject(error)
          })
    })
}


export {ObjectFromOBJModel, ObjectFromMTLOBJModel, ObjectFromGLTFModel, ObjectAndMeshFromGLTFModel}