import * as THREE from 'three'

export const pi = 3.14159265

export const xa = new THREE.Vector3(1, 0, 0).normalize()
export const ya = new THREE.Vector3(0, 1, 0).normalize()
export const za = new THREE.Vector3(0, 0, 1).normalize()

export const RAD = pi/180
export let radius = window.innerWidth / 0.001

export const MAX_WATT = 880

const progressGradient = {
    0:  {
        'color': '#f63a0f', // dark orange (0, 20)
        'face': '#128534', // Sad face
        }, 
    20: {
        'color': '#f27011', // orange [20, 40) 
        'face': '#128533'  // Frown
        },
    40: {
        'color': '#f2b01e', // light orange [40, 60)
        'face': '#128528'  // Neutral
        }, 
    60: {'color': '#f2d31b', // yellow [60, 80)
         'face': '#128522'  // Smiley
        },
    80: {'color': '#86e01e', // lime green [80, 100] 
         'face': '#128513'  // Wide Grin
        }
}

export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    /* context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

    
    context.fillText( message, borderThickness, fontsize + borderThickness); */
    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    context.fillText( message, 0, fontsize)

    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(0.002 * canvas.width, 0.0025 * canvas.height);
    return sprite;  
}

7
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }

function angleCheck (angle) {
    if (angle >= 0 && angle < 360) return angle
    else if (angle < 0) return angleCheck(angle + 360)
    else return angleCheck(angle - 360)
}

function findProgressInfo(num) {
    let keys = Object.keys(progressGradient)
    for (let i = 0; i < keys.length - 1; i++) {
        // determine if value falls between two keys. If so, return first colour
        if (parseInt(keys[i]) <= num && num < parseInt(keys[i+1])) return progressGradient[keys[i]]
    }
    // Determined to be final key
    return progressGradient[keys[keys.length - 1]]
}

export {makeTextSprite, angleCheck, findProgressInfo}