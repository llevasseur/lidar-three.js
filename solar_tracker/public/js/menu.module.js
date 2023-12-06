/**
 * Modular script to set up GUI menu for Three.js renderer
 * @todo Modularize objects in menu
 * @todo Modularize max, min ( rotation, position )
 * @todo Add scale option for object
 */
import { GUI } from 'three/addons/dat.gui.module.js'
import { scene, sky, ground, tree } from './scene.module.js'

export let menu

export let menuSettings = {
    status: 'status',
    animation: false,
    sceneContent: undefined,
    behaviour: undefined,
    sky: undefined,
    terrain: undefined,
    objects: undefined,
    reset: reset
}

menuSettings.sky = {
    sun: {
        "showSun": false,
        "turbidity": 10,
        "rayleigh": 2,
        "mieCoefficient": 0.005,
        "mieDirectionalG": 0.7,
        "luminance": 1,
        "altitude": 0.564,
        "azimuth": -5.254
    },
    date: "June 21, 2022 5:40:00",
    lat: 48.87618,
    long: -123.69301
}
//long: "-123.69301",
    //lat: "48.87618",

let sunParams = menuSettings.sky.sun

menuSettings.terrain = {
    ground: {
        "showGround": false,
        "wireframe": false,
        "heightMap": "Halalt3DTiny.jpg",
        "widthSeg": 200,
        "heightSeg": 200,
        "dispScale": 2500,
        "horText": 1,
        "vertText": 1,
        "x": 1210,
        "y": 12,
        "z": 440,
        "rotZ": 0
    }
}

let groundParams = menuSettings.terrain.ground

menuSettings.objects = {
    tree: {}
}

let guiInput, dateController

function initMenu() {
    menu = new GUI()

    let animFolder = menu.addFolder('Animation')
    animFolder.add(menuSettings, 'animation').name('Run Animation')
    animFolder.add(menuSettings, 'reset').name('Reset')

    let skyFolder = menu.addFolder('Sky')
    let sunFolder = skyFolder.addFolder('Sun')
    sunFolder.add(sunParams, 'showSun').name('Toggle Sun').onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'turbidity', 0.0, 20.0, 0.1 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'rayleigh', 0.0, 4, 0.001 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'luminance', 0.0, 2.0 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'altitude', -6.28, 6.28, 0.001 ).onChange( () => {
        sky.update()
    })
    sunFolder.add(sunParams, 'azimuth', -6.28, 6.28, 0.001 ).onChange( () => {
        sky.update()
    })
    //dateController = skyFolder.add(menuSettings.sky, 'date', {}).name('Date')
    skyFolder.add(menuSettings.sky, 'date', { 
        Dec_21_2022_7am: 'December 21, 2022 07:00:00', 
        Dec_21_2022_9am: 'December 21, 2022 09:00:00', 
        Dec_21_2022_12pm: 'December 21, 2022 12:00:00', 
        Dec_21_2022_4pm: 'December 21, 2022 16:00:00', 
        Dec_21_2022_9pm: 'December 21, 2022 21:00:00',
        June_21_2022_5am: 'June 21, 2022 05:00:00',
        June_21_2022_7am: 'June 21, 2022 07:00:00',
        June_21_2022_9am: 'June 21, 2022 09:00:00', 
        June_21_2022_12pm: 'June 21, 2022 12:00:00', 
        June_21_2022_4pm: 'June 21, 2022 16:00:00',
        June_21_2022_9pm: 'June 21, 2022 21:00:00',
        February_21_2023_7am: 'February 21, 2023 07:00:00'}).name('Date').onChange(() => {
            document.getElementById('info-date').textContent = menuSettings.sky['date']
            sky.date = null
            sky.update()
    })
    skyFolder.add(menuSettings.sky, 'long', 90, 180, 0.1).name('Longitude').onChange(() => {
        sky.update()
    })
    skyFolder.add(menuSettings.sky, 'lat', 0, 60, 0.1).name('Latitude').onChange(() => {
        sky.update()
    })

    /*
    guiInput = $(skyFolder.domElement).find("input").eq(0)
    let datePickerOptions = {"onHide": function(handler){ fnbSetGuiDate() } }

    guiInput.appendDtpicker(datePickerOptions).handleDtpicker('show')

    fnSetGuiDate()
    */

    let terrainFolder = menu.addFolder('Terrain')
    let groundFolder = terrainFolder.addFolder('Ground')
    groundFolder.add(groundParams, 'showGround').name('Toggle Ground').onChange( () => {
        if (groundParams.showGround) {
            if (groundParams.wireframe) {
                scene.remove(ground.mountain)
                ground.update()
            }
            else scene.add(ground.mountain)
            scene.getObjectByName( 'static_base' ).visible = false
            scene.getObjectByName( 'seaCan_base' ).visible = false
            scene.getObjectByName( 'grid' ).visible = false
        } else {
            scene.remove(ground.mountain)
            scene.getObjectByName( 'static_base' ).visible = true
            scene.getObjectByName( 'seaCan_base' ).visible = true
            scene.getObjectByName( 'grid' ).visible = true
        }
    })
    groundFolder.add(groundParams, 'wireframe').name('Wireframe').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'heightMap', {heightmap: 'heightmap.jpeg', common: 'common_hm.png', Halalt: 'HalaltFNHeightMap.png', HalaltLines: 'halalt_maplines.png', Victoria: 'victoria.png', NewHalalt1: "Halalt3Dheightmap.png", NewHalaltSmall: "Halalt3DheightmapSmall.png", NewHalaltBig: "Halalt3DBig.jpg", NewHalaltTiny: "Halalt3DTiny.jpg", HalaltTest: "Halalt3DTinyTest.jpg"}).name('Map').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'widthSeg', 0, 1000, 1).name('Ground Width').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'heightSeg', 0, 1000, 1).name('Ground Height').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'dispScale', 0, 10000, 10).name('Displacement').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'horText', 1, 10, 1).name('Number Hor.').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'vertText', 1, 10, 1).name('Number Vert.').onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'x', -10000.0, 10000.0, 0.5).onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'y', -200.0, 100.0, 0.5).onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'z', -10000.0, 10000.0, 0.5).onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })
    groundFolder.add(groundParams, 'rotZ', -Math.PI/2, Math.PI/2, 0.1).onChange( () => {
        if (groundParams.showGround) {
            scene.remove(ground.mountain)
            ground.update()
        }
    })

    let objectFolder = menu.addFolder('Objects')
    let treeFolder = objectFolder.addFolder('Trees')
    
    //menu.add(menuSettings, 'reset').name('Reset View')

    menu.open()
}

function reset() {
    sky.date = null
    sky.update()

}

export {initMenu}