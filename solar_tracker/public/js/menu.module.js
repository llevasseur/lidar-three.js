/**
 * Modular script to set up GUI menu for Three.js renderer
 * @todo Modularize objects in menu
 * @todo Modularize max, min ( rotation, position )
 * @todo Add scale option for object
 */
import { GUI } from 'three/addons/dat.gui.module.js'
import { scene, sky, ground, staticSolar, trackingSolar, house } from './scene.module.js'

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
    panels: {
        static: {
            "showPanel": true,
            "x": 150, //-43
            "y": 150, 
            "z": -118, // 70
            "rotX": 0.67, // 0.9
            "rotY": 0.03, //-0.45
            "rotZ": -0.04, //0.5
            "showNormal": false,
            "showBase": false
        },
        tracking: {
            "showPanel": true,
            "x": -150, //100
            "y": 120, //127
            "z": 150, //300
            "rotX": 0.0,
            "rotY": 0,
            "rotZ": 0.0,
            "showNormal": false,
            "showBase": true,
            "lookAtX": 0,
            "lookAtY": 0,
            "lookAtZ": 0,
            "upX": 0,
            "upY": 1,
            "upZ": 0
        }
    },
    house: {
        "showHouse": true,
        "x": -50,
        "y": 80,
        "z": 85,
        "rotY": -0.7
    },
    seaCan: {
        "showSeaCan": true,
        "x": 600,
        "y": 75,
        "z": 225
    }
}

let guiInput, dateController

let staticParams = menuSettings.objects.panels.static
let trackingParams = menuSettings.objects.panels.tracking

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
    let panelFolder = objectFolder.addFolder('Panels')

    let staticFolder = panelFolder.addFolder('Static')
    staticFolder.add(staticParams, 'showPanel').name('Toggle Panel').onChange( () => {
        if (staticParams.showPanel) {
            scene.add(staticSolar.panel, staticSolar.intensityBar, staticSolar.label)
        } else {
            scene.remove(staticSolar.panel, staticSolar.intensityBar, staticSolar.label)
        }
    })
    staticFolder.add(staticParams, 'x', -10000, 10000, 1).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.position()
            staticSolar.positionBar()
            staticSolar.positionLabel()
        }
    })
    staticFolder.add(staticParams, 'y', -1000, 1000, 1).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.position()
            staticSolar.positionBar()
            staticSolar.positionLabel()
        }
    })
    staticFolder.add(staticParams, 'z', -1000, 1000, 1).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.position()
            staticSolar.positionBar()
            staticSolar.positionLabel()
        }
    })
    staticFolder.add(staticParams, 'rotX', -3, 3, 0.01).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.rotate()
        }
    })
    staticFolder.add(staticParams, 'rotY', -3, 3, 0.01).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.rotate()
        }
    })
    staticFolder.add(staticParams, 'rotZ', -3, 3, 0.01).onChange( () => {
        if (staticParams.showPanel) {
            staticSolar.rotate()
        }
    })
    staticFolder.add(staticParams, 'showNormal').onChange( () => {
        if (staticParams.showPanel) {
            if (staticParams.showNormal) {
                scene.add(staticSolar.helper)
            } else {
                scene.remove(staticSolar.helper)
            }
        }
    })
    staticFolder.add(staticParams, 'showBase').onChange( () => {
        /*if (staticParams.showPanel) {
            if (staticParams.showBase) {
                scene.add(staticSolar.base.base)
            } else {
                scene.remove(staticSolar.base.base)
            }
        }*/
    })

    let trackingFolder = panelFolder.addFolder('Tracking')
    trackingFolder.add(trackingParams, 'showPanel').name('Toggle Panel').onChange( () => {
        if (trackingParams.showPanel) {
            scene.add(trackingSolar.panel, trackingSolar.base, trackingSolar.intensityBar, trackingSolar.label)
        } else {
            scene.remove(trackingSolar.panel, trackingSolar.base, trackingSolar.intensityBar, trackingSolar.label)
        }
    })
    trackingFolder.add(trackingParams, 'x', -10000, 10000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.position()
            trackingSolar.positionBar()
            trackingSolar.positionLabel()
        }
    })
    trackingFolder.add(trackingParams, 'y', -1000, 1000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.position()
            trackingSolar.positionBar()
            trackingSolar.positionLabel()
        }
    })
    trackingFolder.add(trackingParams, 'z', -1000, 1000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.position()
            trackingSolar.positionBar()
            trackingSolar.positionLabel()
        }
    })
    trackingFolder.add(trackingParams, 'rotX', -1.57, 1.57, 0.1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.rotate()
        }
    })
    trackingFolder.add(trackingParams, 'rotY', -1.57, 1.57, 0.1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.rotate()
        }
    })
    trackingFolder.add(trackingParams, 'rotZ', -1.57, 1.57, 0.1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.rotate()
        }
    })
    trackingFolder.add(trackingParams, 'showNormal').onChange( () => {
        if (trackingParams.showPanel) {
            if (trackingParams.showNormal) {
                console.log(trackingSolar.helper)
                scene.add(trackingSolar.helper)
            } else {
                scene.remove(trackingSolar.helper)
            }
        }
    })
    trackingFolder.add(trackingParams, 'showBase').onChange( () => {
        if (trackingParams.showPanel) {
            if (trackingParams.showBase) {
                scene.add(trackingSolar.base.base)
            } else {
                scene.remove(trackingSolar.base.base)
            }
        }
    })
    trackingFolder.add(trackingParams, 'lookAtX', -400000, 400000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })
    trackingFolder.add(trackingParams, 'lookAtY', -10000000, 10000000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })
    trackingFolder.add(trackingParams, 'lookAtZ', -400000, 400000, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })
    trackingFolder.add(trackingParams, 'upX', -1, 1, 0.01).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })
    trackingFolder.add(trackingParams, 'upY', -1, 1, 0.01, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })
    trackingFolder.add(trackingParams, 'upZ', -1, 1, 0.01, 1).onChange( () => {
        if (trackingParams.showPanel) {
            trackingSolar.setLookAt()
        }
    })

    //menu.add(menuSettings, 'reset').name('Reset View')

    menu.open()
}

function reset() {
    sky.date = null
    sky.update()
    trackingSolar.capacity = 0
    staticSolar.capacity = 0
}

/*function fnSetGuiDate() {
    let date = guiInput.handleDtpicker('getDate')
    let strDate =   date.getFullYear() + "-" + 
                    fnFormat(date.getMonth() + 1) + "-" + 
                    fnFormat(date.getDate()) + " " + 
                    fnFormat(date.getHours()) + ":" + 
                    fnFormat(date.getMinutes())

    dateController.setValue(strDate)

    function fnFormat(mnthOrDate) {
        return mnthOrDate < 10 ? "0" + mnthOrDate : mnthOrDate;
    }
}*/

export {initMenu}