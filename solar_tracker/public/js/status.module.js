/**
 * Module script to be used by other scripts to output status
 */

// update visualizer status
function stat (message) {
    console.log(message)
    //$('span#status').html(message)
}

// update connection status
function conn (message) {
    console.log(message)
    //$('span#connectionStatus').html(message)
}

export {stat, conn}