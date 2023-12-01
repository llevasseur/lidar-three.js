/**
 * EnergyFlow is a module script used by Energized Objects to detail energy transfer
 * 
 * Creates a Catmull Rom Curve to path the energy
 *  - first point should be from one of the sides of the base ( or above it )
 *  - second point so be along the vector created from the first point
 *  - second last point should be along the vector created from the last point
 *  - last point should be the end point
 *  - sec
 * @todo make bars glow electric blue
 */
import * as THREE from 'three'
import { pi } from './common.module.js'

let standardMaterial = new THREE.MeshStandardMaterial( {
    map: null,
    color: 0xADD8E6,
    metalness: 1.0,
    shading: THREE.SmoothShading
} );

class EnergyFlow {
    constructor(scene) {
        this.scene = scene
    }

    makeBar() {
        /**@todo make bars glow electric blue */
        return new THREE.Mesh(
            new THREE.BoxBufferGeometry( 10, 5, 0.5 ),
            standardMaterial
        )
    }

    constructGroup( capacity ) {

        this.group = new THREE.Group()
        if ( ! Number.isInteger( capacity ) || (capacity < 2) ) return
        for ( let i = 0; i < capacity; i++ ) {
            this.group.add( this.makeBar() )
            this.group.children[i].position.set( 
                this.points[i].x, this.points[i].y, this.points[i].z )
        }

        // Orientate bars
        
        for ( let i = 1; i < capacity; i++ ) {
            this.group.children[i-1].lookAt( this.points[i] )
            this.group.children[i-1].rotateX( pi / 2 )
        }
        this.group.children[ this.points.length -1 ].lookAt( this.points[ this.points.length -2 ] )
        this.group.children[ this.points.length -1 ].rotateX( pi / 2 )
        console.log(this.group)

        this.scene.add(this.group)
    }

    createPath ( vertices ) {
        console.log(vertices)
        this.path = new THREE.CatmullRomCurve3( vertices )
        console.log("Path length", this.path.getLength(), Math.round( this.path.getLength() / 7 ))
        this.points = this.path.getPoints( Math.round( this.path.getLength() / 7 ) )
        console.log(`points length: ${this.points.length}`, this.path, this.points)
        this.constructGroup( this.points.length )
    }

    animate() {

    }
}

export { EnergyFlow }