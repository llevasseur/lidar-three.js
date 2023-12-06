/**
 * Modular script to control the visualization in three.js
 * @todo Set up animation for objects on catmull-rom spline
 */
import * as THREE from 'three'
import { scene, camera, renderer, controls, stats, composer, sky, status} from './scene.module.js'
import { menuSettings } from './menu.module.js'

let clock = new THREE.Clock(true)
let previous = 0

export let time, dt

function animate() {
    requestAnimationFrame(animate)
    update()
    if (sky) sky.update()
    if (composer) render()
    //stats.update()
}

function render() {
    composer.render()
    
}

function update() {
    time = getTime()
    dt = time - previous
    previous = time
}

function getTime () {
    return clock.getElapsedTime()
}

export {animate, render}