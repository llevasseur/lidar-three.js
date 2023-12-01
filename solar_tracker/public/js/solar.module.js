import * as THREE from 'three'
import { ObjectFromMTLOBJModel, ObjectAndMeshFromGLTFModel } from './loaders.module.js'
import { VertexNormalsHelper } from 'three/addons/VertexNormalsHelper.js'
import { ProgressBar } from './progress.module.js'
import { MAX_WATT, pi, makeTextSprite, findProgressInfo } from './common.module.js'
import { menuSettings } from './menu.module.js'
import { sky, stats, house } from './scene.module.js'
import { Base } from './base.module.js'
import { EnergyFlow } from './energyFlow.module.js'
import { time, dt } from './vis.module.js'

let staticSolarParams = menuSettings.objects.panels.static
let trackingSolarParams = menuSettings.objects.panels.tracking

let MAX_Y_ROT = pi/8
let MAX_Z_ROT = pi/8

let MAX_CAPACITY = 14000

let NIGHT_MODE_PERIOD = 1

/**
 * Constructs a Solar Panel Assembly using Wisertech assets (obj / mtl)
 * @constructor
 * 
 */
class Solar {

    constructor(scene, parameterFile, name, hasStand = false) {
        this.scene = scene
        if (parameterFile === "staticSolarParams") {
            this.params = staticSolarParams
            this.type = "static"
            this.intensity = { value: 0.0 }
            this.color = {r: 255, g: 255, b: 255, a: 1.0}
        } else {
            this.params = trackingSolarParams
            this.type = "tracking"
            this.intensity = { value: 0.0 }
            this.color = {r: 255, g: 255, b: 255, a: 1.0}
        }
        this.name = name
        this.hasStand = hasStand
        this.capacity = 0
        this.frameCount = 0
        
        this.createSolar()
    }

    createSolar() {
        this.panel = null
        this.stand = null
        this.nightMode = false

        this.createPanel()
    }
    
    transformAndLabel() {
        this.scale()
        this.rotate()
        this.position()

        this.createIntensityBar()
        this.labelIntensity()
    }

    async createPanel() {
        let gltfMesh

        
        ObjectAndMeshFromGLTFModel(this.name, './models/solar_panel/', 'scene.gltf')
            .then((result) => {
                this.panel = result[0]
                gltfMesh = result[1]

                this.helper = new VertexNormalsHelper( result[1], 100, 0xff0000 );
                this.helper.matrixAutoUpdate = true

                if (this.params.showNormal) this.scene.add(this.panel, this.helper)
                else this.scene.add(this.panel)

                if (this.hasStand) this.createStand() // also calls transformAndLabel and getNormal, after model rendered
                else {
                    this.transformAndLabel()
                    this.getNormal()
                }

            })

        
    }

    createStand() {
        //this.stand = ObjectFromMTLOBJModel(this.name, './models/', 'Base_for_Altitude.mtl', 'Base_for_Altitude.obj')
        ObjectFromMTLOBJModel(this.name+'_stand', './models/', 'Base_for_Altitude.mtl', 'Base_for_Altitude.obj')
            .then((result) => {
                this.stand = result
                this.scene.add(this.stand)
                this.transformAndLabel()
                this.getNormal()
                this.base = new Base( this.scene, this.stand, 300, 300, 'static_base' )
                if (!this.params.showBase) this.scene.remove(this.base.base)
                this.createFlow()
                //this.setLookAt() // instead, set lookAt at every animation frame
            })
    }

    scale() {
        this.panel.scale.set( 4, 4, 4 )

        if (this.hasStand) this.stand.scale.set(0.03, 0.03, 0.03)
    }

    rotate() {
        this.panel.rotation.x = this.params.rotX
        this.helper.rotation.x = this.params.rotX

        this.panel.rotation.y = this.params.rotY
        this.helper.rotation.y = this.params.rotY

        this.panel.rotation.z = this.params.rotZ
        this.helper.rotation.z = this.params.rotZ
        
        if (this.hasStand) this.stand.rotation.x = Math.PI / 2
    }

    getNormal() {
        let normalMatrix = new THREE.Matrix3().getNormalMatrix( this.panel.matrixWorld )
        this.normal = new THREE.Vector3(
            normalMatrix.elements[3],
            normalMatrix.elements[4],
            normalMatrix.elements[5]
        ) 
    }

    position() {
        this.panel.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )
        this.helper.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )
        if (this.hasStand) {
            this.stand.position.set(
                this.params.x,
                this.params.y -40,
                this.params.z
            )
        }
    }

    createIntensityBar() {
        this.intensityBar = new ProgressBar(this.intensity)
        this.intensityBar.scale.set(80,8)

        this.positionBar()

        this.scene.add(this.intensityBar)
        this.intensityBar.needsUpdate = true
    }

    positionBar() {
        this.intensityBar.position.set(
            this.panel.position.x,
            this.panel.position.y * 1.4,
            this.panel.position.z
        )
    }
    
    updatePercentIntensity() {
        /*if (this.intLabel) this.scene.remove(this.intLabel)
        this.intLabel = makeTextSprite("                   ~"+(this.intensity.value*100).toString()+"%       ", {"fontsize": 24, "textColor": this.color})
        this.intLabel.scale.set(100, 50)
        this.positionPercentage()
        this.scene.add(this.intLabel)*/

        let htmlPercent = document.getElementById(this.type+'HudPercent')
        htmlPercent.innerHTML = (Math.round(100 * this.intensity.value)).toString() + '%'

        let wattage = Math.round(MAX_WATT * this.intensity.value)
        let wattageRate = Math.round(100 * (wattage / MAX_WATT))
        let wattageRateInfo = findProgressInfo(wattageRate)
        let wattageRateColour = wattageRateInfo['color']
        let face = wattageRateInfo['face']

        let htmlWattRate = document.getElementById(this.type+'WattRate')
        htmlWattRate.innerHTML = ' ' + (wattage).toString() + ' '
        
        let htmlEfficiencyBar = document.getElementById(this.type+'BarEfficiency')
        htmlEfficiencyBar.style.width = (wattageRate).toString() + '%'
        htmlEfficiencyBar.style.backgroundColor = wattageRateColour

        let htmlFace = document.getElementById(this.type+'Emoji')
        htmlFace.innerHTML = '&'+face+';'

        if (menuSettings.animation) {
            let htmlWattCapacity = document.getElementById(this.type+'WattCapacity')
            this.capacity += (dt * wattage)
            if (this.capacity > MAX_CAPACITY) this.capacity = MAX_CAPACITY
            //console.log("capcacity:", this.capacity, wattage, "frame COUNT:", this.frameCount)
            htmlWattCapacity.innerHTML = (Math.round(this.capacity)).toString()
            // 2187
            // 2409

            let htmlCapacityBar = document.getElementById(this.type+'BarCapacity')
            let capacityRate = Math.round(100 * Math.round(this.capacity) / MAX_CAPACITY)
            let capacityColour = findProgressInfo(capacityRate)['color']
            htmlCapacityBar.style.width = (capacityRate).toString() + '%'
            htmlCapacityBar.style.backgroundColor = capacityColour 
        }
    }

    labelIntensity() {
        this.label = makeTextSprite("         "+this.name+"       ", {"fontsize": 24, "textColor": this.color})
        this.label.scale.set(100, 50)

        //this.updatePercentIntensity()

        this.positionLabel()

        this.scene.add(this.label)
        this.label.needsUpdate = true
    }
    /* labelIntensity() {
        this.label = makeTextSprite("                   "+(this.intensity.value*100).toString()+"%       ", {"fontsize": 24, "textColor": this.color})
        this.label.scale.set(100, 50)

        this.intLabel = makeTextSprite("      "+(this.intensity.value*100).toString()+"%       ", {"fontsize": 24, "textColor": this.intensityTextColor})

        console.log(this.intLabel, this.label, (this.intensity.value*100).toString()+"%")
        this.positionLabel()

        this.scene.add(this.label, this.intLabel)
        this.label.needsUpdate = true
    } */

    positionLabel() {
        this.label.position.set(
            this.panel.position.x,
            this.panel.position.y *1.35,
            this.panel.position.z
        )
    }
    positionPercentage() {
        this.intLabel.position.set(
            this.panel.position.x  + 50,
            this.panel.position.y * 1.4,
            this.panel.position.z
        ) 
    }

    animate() {

        // follow sun
        if (this.type === "tracking") {
            if (this.panel) {
                this.setLookAt()
                this.calculate()
            }
        } else {
            if (this.panel) {
                this.calculate()
            }
        }
        //this.intensity.value -= 0.01

        //THREE.rotateAboutPoint(this.panel, new THREE.Vector3(100,30,300), 'x')
    }

    calculate() {
        // Calculate the intensity of the sun rays by 
        // calculating the incident angle of the sun on the panel

        if (sky.isNight) {
            this.intensity.value = 0.0
            this.capacity = 0
            if (this.capacity < 0) this.capacity = 0
            this.updatePercentIntensity()
        } else {
            this.getNormal()
            let directionToSun = this.getDirectionToSun()

            let theta = this.getIncidentAngle(directionToSun)

            let newIntensity = Math.round((1 - (2 * theta / pi)) * (1 - sky.diffraction) * 100) / 100
            if (newIntensity != this.intensity.value) {
                if (sky.isSunset) {
                    newIntensity -= (sky.intensityStep)
                }
                this.intensity.value = newIntensity
                if (this.intensity.value < 0.0) this.intensity.value = 0.0
            }
            if (menuSettings.animation) this.updatePercentIntensity()
        }

    }

    setLookAt() {
        if (this.panel) {
            // First, check if it's night
            if (sky.isNight) {
                // Skip the rest and begin animation to tomorrowSunrise position
                
                if (!this.nightMode) {
                    this.nightMode = true
                    NIGHT_MODE_PERIOD = sky.tomorrowSunrise - sky.date
                }
                

            } else {
                this.nightMode = false

                // Use sky.sunSphere.position as lookAt
                let sunPosition = new THREE.Vector3()
                sunPosition.copy( sky.sunSphere.position ) 
                if (sunPosition.y < 200000) sunPosition.y = 200000
                // Initialize a spherical coordinate reference
                let spherical = new THREE.Spherical()
                // Point z-axis towards sun
                this.panel.lookAt(sunPosition.x, sunPosition.y, sunPosition.z)
                this.helper.lookAt(sunPosition.x, sunPosition.y, sunPosition.z)

                // Rotate about x so that y-axis points towards sun (using a quaternion)
                this.panel.rotateX( pi/2 )
                this.helper.rotateX( pi/2 )

            }
            
        }
    }

    getDirectionToSun() {
        let sunPosition = new THREE.Vector3()
        sunPosition.copy(sky.sunSphere.position)
        return sunPosition.sub(this.panel.position).normalize()
    }

    getIncidentAngle(directionToSun) {
        return this.normal.angleTo(directionToSun)
    }

    createFlow() {
        this.flow = new EnergyFlow( this.scene )
        console.log(this.base)
        let firstVertex = new THREE.Vector3( 
            this.base.base.position.x, this.base.base.position.y + 3, this.base.base.position.z)
        let secondVertex = new THREE.Vector3()
        secondVertex.copy(firstVertex)
        secondVertex.x += 40
        //secondVertex.z -= 5
        let seaCan = menuSettings.objects.seaCan
        let lastVertex = new THREE.Vector3(
            seaCan.x - 300, seaCan.y, seaCan.z - 75
        )
        let secondLastVertex = new THREE.Vector3()
        secondLastVertex.copy(lastVertex)
        secondLastVertex.x -= 40
        //secondLastVertex.z -= 100

        this.flow.createPath( [
            firstVertex,
            secondVertex,
            secondLastVertex,
            lastVertex
        ] )
    }
}

export {Solar}