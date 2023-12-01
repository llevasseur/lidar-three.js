/**
 * Modular script to update front end stats.
 * @todo Make modular for any project
 */
import {latest} from './connection.module.js'


function updateNumVis() {
    console.log('updateNumVis called!')
    console.log('Latest:', latest)
}

export {updateNumVis}