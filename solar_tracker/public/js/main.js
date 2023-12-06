/**
 * Module main script to schedule all scripts
 */

// Import all modular scripts
import * as Scene from './scene.module.js'
import {animate} from './vis.module.js'
import {initMenu} from './menu.module.js'

function main() {
    Scene.initScene()

    // init sky/sun
    Scene.initSky()

    // init terrain
    Scene.initTerrain()

    // init objects
    Scene.initTree()
    //Scene.connectTrackingToHouse()

    // init menu
    initMenu()

    
    // call animate
    // Note: must not call animate until everything (including composer) is set
    animate()
}

main()

//export {main}
