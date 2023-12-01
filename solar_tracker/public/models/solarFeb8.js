import * as THREE from 'three'
import { ObjectFromMTLOBJModel, ObjectAndMeshFromGLTFModel } from './loaders.module.js'
import { VertexNormalsHelper } from 'three/addons/VertexNormalsHelper.js'
import { ProgressBar } from './progress.module.js'
import { makeTextSprite } from './common.module.js'
import { menuSettings } from './menu.module.js'

let staticSolarParams = menuSettings.objects.panels.static
let trackingSolarParams = menuSettings.objects.panels.tracking

let X_ROT_INC = 0.001
let Z_ROT_INC = 0.001
/**
 * Constructs a Solar Panel Assembly using Wisertech assets (obj / mtl)
 * @constructor
 */
class Solar {

    constructor(scene, parameterFile, name, hasBase = false) {
        this.scene = scene
        if (parameterFile === "staticSolarParams") {
            this.params = staticSolarParams
            this.type = "static"
            this.intensity = { value: 0.81 }
            this.color = {r: 255, g: 255, b: 255, a: 1.0}
            this.intensityTextColor = {r: 255, g: 255, b: 255, a: 1.0}
        } else {
            this.params = trackingSolarParams
            this.type = "tracking"
            this.intensity = { value: 0.99 }
            this.color = {r: 255, g: 255, b: 255, a: 1.0}
            this.intensityTextColor = {r: 0, g: 0, b: 0, a: 1.0}
        }
        this.name = name
        this.hasBase = hasBase
        
        //this.intensity = { value: 0.8 }
        this.createSolar()
    }

    createSolar() {
        this.panel = null
        this.base = null

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
                console.log(gltfMesh.geometry)

                this.helper = new VertexNormalsHelper( result[1], 100, 0xff0000 );
                this.helper.needsUpdate = true

                if (this.params.showNormal) this.scene.add(this.panel, this.helper)
                else this.scene.add(this.panel)

                if (this.hasBase) this.createBase()
                else this.transformAndLabel()

                this.panel.up.set(0,1,0)
                this.getNormal()
            })

        
    }

    createBase() {
        this.base = ObjectFromMTLOBJModel(this.name, './models/', 'Base_for_Altitude.mtl', 'Base_for_Altitude.obj')
        ObjectFromMTLOBJModel(this.name+'_base', './models/', 'Base_for_Altitude.mtl', 'Base_for_Altitude.obj')
            .then((result) => {
                this.base = result
                this.scene.add(this.base)
                this.transformAndLabel()
            })
    }

    scale() {
        this.panel.scale.set( 4, 4, 4 )

        if (this.hasBase) this.base.scale.set(0.03, 0.03, 0.03)
    }

    rotate() {
        console.log("first", this.helper)
        this.panel.rotation.x = this.params.rotX
        this.helper.rotation.x = this.params.rotX

        this.panel.rotation.y = this.params.rotY
        this.helper.rotation.y = this.params.rotY

        this.panel.rotation.z = this.params.rotZ
        this.helper.rotation.z = this.params.rotZ
        
        console.log("second", this.helper)
        if (this.hasBase) this.base.rotation.x = Math.PI / 2
    }

    getNormal() {
        this.helper.updateMatrixWorld()
        this.normal = new THREE.Vector3(
            this.helper.normalMatrix.elements[3],
            this.helper.normalMatrix.elements[4],
            this.helper.normalMatrix.elements[5]
        ).normalize() // actually already normalized

        console.log(this.normal, this.type)
        console.log(this.helper.normalMatrix)
    }

    position() {
        this.panel.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )
        /*this.helper.position.set(
            this.params.x,
            this.params.y,
            this.params.z
        )*/
        if (this.hasBase) {
            this.base.position.set(
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

    labelIntensity() {
        this.label = makeTextSprite("         "+this.name+"       ", {"fontsize": 24, "textColor": this.color})
        this.label.scale.set(100, 50)

        this.intLabel = makeTextSprite("                   ~"+(this.intensity.value*100).toString()+"%       ", {"fontsize": 24, "textColor": this.color})
        this.intLabel.scale.set(100, 50)

        this.positionLabel()

        this.scene.add(this.label, this.intLabel)
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

        this.intLabel.position.set(
            this.panel.position.x  + 50,
            this.panel.position.y * 1.4,
            this.panel.position.z
        ) 
    }

    animate() {

        // follow sun
        console.log(Math.abs(this.panel.rotation.x))
        if (this.type === "tracking") {
            if (Math.abs(this.panel.rotation.x) >= Math.PI / 2 - 0.4) X_ROT_INC *= -1
            if (Math.abs(this.panel.rotation.z) >= Math.PI / 2 - 0.4) Z_ROT_INC *= -1    
            this.panel.rotation.x += X_ROT_INC
            this.panel.rotation.z += Z_ROT_INC
        }
        this.intensity.value -= 0.01

        //THREE.rotateAboutPoint(this.panel, new THREE.Vector3(100,30,300), 'x')
    }

    calculate(sunDir) {
        // Calculate the intensity of the sun rays by 
        // calculating the incident angle of the sun on the panel
        // calculate theta = 90 - phi
        // phi = cos^-1(a dot b / |a| |b|)
        // if the sun is directly above the panel, phi is 0 so theta = 90
        // intensity = theta / 90

        this.getNormal()
        let phi = sunDir.angleTo(this.normal)

        console.log("PHI is:", phi)
        console.log("sunDir:", sunDir, "normal:", this.normal)

        //this.intensity.value = 
    }

    setLookAt() {
        if (this.panel) {
            this.panel.lookAt(this.params.lookAtX, this.params.lookAtY, this.params.lookAtZ)
            //this.rotate()
            //this.panel.lookAt(651, -1406, -268)

            // x = 334665
            // y = 20804
            // z = -218097
        }
    }
}

export {Solar}