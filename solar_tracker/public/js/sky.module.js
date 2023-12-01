/**
 * @todo make timezone module
 */
import * as THREE from 'three'
import { Sky } from 'three/addons/SkyShader.module.js'

import {RAD, months, radius, pi} from './common.module.js'
import {menuSettings} from './menu.module.js'

let params = menuSettings.sky.sun
let groundParams = menuSettings.terrain.ground


class MySky {
    constructor(scene) {
        this.scene = scene

        this.initMySky()
    }

    initMySky() {
        this.sky = new Sky()
        this.scene.add( this.sky.mesh )

        // Add Sun Helper
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 7000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        )
        this.sunSphere.position.y = - 700000
        this.sunSphere.visible = false
        this.scene.add( this.sunSphere )

        this.sun = new THREE.DirectionalLight(0xFFFFFF, 0.5)
        this.sun.castShadow = true
        this.scene.add(this.sun)

        // Sun Shadow Properties (How detailed the shadow is)

        this.sun.shadow.mapSize.width = 512;  // default;
        this.sun.shadow.mapSize.height = 512; // default;
        this.sun.shadow.camera.near = 0.5;    // default;
        this.sun.shadow.camera.far = 500;     // default;

        this.distance = 400000
    }

    setDateAndPosition() {
        // User data
        this.date = new Date(menuSettings.sky['date'])
        this.long = menuSettings.sky['long']
        this.lat = menuSettings.sky['lat']
        this.setHTMLDate()
    }

    getTimes() {
        let height = 0 // adjust if significantly above sea level
        let times = SunCalc.getTimes(this.date, this.lat, this.long, height)
        this.solarNoon = times['solarNoon']
        this.sunrise = times['sunrise']
        this.sunsetStart = times['sunsetStart']
        this.sunriseEnd = times['sunriseEnd']
        this.sunset = times['sunset']

        

    }

    calcSunTimes() {
        this.getTimes()

        this.getDiffractionValues()

        if (this.date > this.sunrise && this.date < this.sunriseEnd) {
            // sun rising
            this.isSunrise = true
            let period = this.sunriseEnd - this.sunrise
            let offset = this.date - this.sunrise
            this.intensityStep = 1 / period
            let intensity = this.intensityStep * offset
        } else {
            this.isSunrise = false
        }

        if (this.date > this.sunriseEnd && this.date < this.sunset) {
            this.isDay = true
            this.intensity = 1
            this.tomorrow = null
        } else {
            this.isDay = false
        }

        if (this.date > this.sunset && this.date < this.sunsetStart) {
            // sun going down
            this.isSunset = true
            let period = this.sunsetStart - this.sunset
            let offset = this.sunsetStart - this.date
            this.intensityStep = 1 / period
            let intensity = this.intensityStep * offset
        } else {
            this.isSunset = false
        }

        if (this.date > this.sunset || this.date < this.sunrise) {
            // night
            this.isNight = true
            this.intensity = 0
            if (!this.tomorrow) {
                this.tomorrow = new Date(this.date.getTime() + 43200000) // + ~12hr
                let times = SunCalc.getTimes(this.tomorrow, this.lat, this.long)
                this.tomorrowSunrise = times['sunrise']
            } else {
                /**
                 * Make shift way to stop animation at midnight
                 */
                let tmpDate = new Date(this.date.getTime() - 25200000)
                if ( tmpDate.getUTCDate() === this.tomorrow.getUTCDate() ) {
                    menuSettings.animation = false
                }
            }
            
        } else {
            this.isNight = false
        }
    }

    calcSunAngles() {
        // calculate this.angles['azimuth'] && this.angles['altitude']
        this.angles = SunCalc.getPosition(this.date, this.lat, this.long)

        if (this.date > this.solarNoon) {
            // Correct for azimuth after solar noon
            this.angles['azimuth'] = 2 * pi - this.angles['azimuth']
        }

    }

    setHTMLDate() {
        let month = months[this.date.getUTCMonth()]
        let tmpDate = new Date(this.date.getTime() - 25200000)
        let day = tmpDate.getUTCDate()
        let year = this.date.getUTCFullYear()
        let hour = this.date.getHours()
        let min = this.date.getMinutes()
        let second = this.date.getSeconds()
        let colour = (this.isDay ? 'black' : 'white')
        if (hour.toString().length === 1) hour = '0'+hour
        if (min.toString().length === 1) min = '0'+min
        if (second.toString().length === 1) second = '0'+second
        document.getElementById('info-date').innerHTML =
            month+' '+day+', '+year+' '+hour+':'+min+':'+second
        document.getElementById('info').style.color = colour
    } 

    update() {

        if (!this.date) {
            this.setDateAndPosition()
        } else {
            if (menuSettings.animation) {
                let oldDate = new Date(this.date.getTime())
                this.date = new Date(this.date.getTime()+20000)
                
                this.setHTMLDate()
                
            }
        }
        // Determine sun properties based on user data (long, lat, date)
        this.calcSunTimes()
        this.calcSunAngles()
        this.diffraction = this.getCurrentDiffraction()

        let uniforms = this.sky.uniforms
        uniforms.turbidity.value = params.turbidity
        uniforms.rayleigh.value = params.rayleigh
        uniforms.luminance.value = params.luminance
        uniforms.mieCoefficient.value = params.mieCoefficient
        uniforms.mieDirectionalG.value = params.mieDirectionalG

        // Use sun position calculated based on date
        // North = -z, East = +x, Up = +y
        let theta = this.angles['azimuth']
        let phi = this.angles['altitude']

        // Adjust (theta, phi) -> (x,y,z) based on our  North (-z)
        this.sunSphere.position.x = this.distance * Math.cos(phi) * Math.sin(theta) 
        this.sunSphere.position.z = -this.distance * Math.cos(phi) * Math.cos(theta) 
        this.sunSphere.position.y = this.distance * Math.sin(phi)

        // Update skyBox.sun
        this.sun.position.x = this.sunSphere.position.x
        this.sun.position.y = this.sunSphere.position.y
        this.sun.position.z = this.sunSphere.position.z

        this.sunSphere.visible = params.sun

        this.sky.uniforms.sunPosition.value.copy( this.sunSphere.position )

        this.sunDirection = this.sun.position.normalize()
    }
    getDiffractionValues() {
        this.daylight = this.sunset - this.sunrise
        this.sunriseEquilibrium = this.daylight * 0.25
        this.sunsetEquilibrium = this.daylight * 0.25
    }

    getCurrentDiffraction() {
        // Determine current diffraction based on time (and this.date)
        let diffraction

        

        if ( this.date < this.solarNoon ) {
            diffraction = 1 - (this.date.getTime() - this.sunrise.getTime()) / this.sunriseEquilibrium
        } else {
            diffraction = 1 - (this.sunset.getTime() - this.date.getTime()) / this.sunsetEquilibrium
            
        }
        if ( diffraction > 1 ) diffraction = 1
        else if ( diffraction < 0 ) diffraction = 0
        return diffraction
    }

}

export {MySky}