/**
 * Modular script to control the visualization in three.js
 * @todo Set up animation for objects on catmull-rom spline
 */
import * as THREE from 'three'
import { scene, camera, renderer, controls, stats, staticSolar, trackingSolar, composer, sky, status} from './scene.module.js'
import { menuSettings } from './menu.module.js'
import { drawClock } from './analogClock.module.js'

let clock = new THREE.Clock(true)
let previous = 0

export let time, dt

function animate() {
    requestAnimationFrame(animate)
    update()
    if (sky) sky.update()
    if (trackingSolar) trackingSolar.animate()
    if (staticSolar) staticSolar.animate()
    if (composer) render()
    //stats.update()
    drawClock()
}

function render() {
    composer.render()
    
    // Test catmull-rom spline path animation
    if (menuSettings.animation) {

    }
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