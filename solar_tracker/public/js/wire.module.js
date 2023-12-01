import * as THREE from 'three'

class Wire {
    constructor(scene, indices) {
        this.scene = scene
        this.indices = indices

        this.makeWire()
    }

    makeWire() {
        this.curve = new THREE.CatmullRomCurve3( this.indices )
        this.points = this.curve.getPoints( 50 )

        const geometry = new THREE.BufferGeometry().setFromPoints( this.points )
        const material = new THREE.LineBasicMaterial( { color: 0x000000 })

        this.wire = new THREE.Line( geometry, material )
        //this.scene.add(this.wire) 
    }
}

export { Wire }