import { pi } from './common.module.js'
import { sky } from './scene.module.js'

let canvas = document.getElementById("clock")
let ctx = canvas.getContext("2d")
let radius = canvas.height / 2
ctx.translate(radius, radius)
radius = radius * 0.90

function drawClock() {
    drawFace( ctx, radius )
    drawNumbers( ctx, radius )
    drawTime( ctx, radius )
}

function drawFace( ctx, radius ) {
    let grad
    ctx.beginPath()
    ctx.arc( 0, 0, radius, 0, 2 * pi )
    ctx.fillStyle = 'white'
    ctx.fill()
    grad = ctx.createRadialGradient( 0, 0, radius * 0.95, 0, 0, radius * 1.05 )
    grad.addColorStop( 0, '#333' )
    grad.addColorStop( 0.5, 'white' )
    grad.addColorStop( 1, '#333' )
    ctx.strokeStyle = grad
    ctx.lineWidth = radius * 0.1
    ctx.stroke()
    ctx.beginPath()
    ctx.arc( 0, 0, radius * 0.1, 0, 2 * pi )
    ctx.fillStyle = '#333'
    ctx.fill()
}

function drawNumbers( ctx, radius ) {
    let ang
    let num
    ctx.font = radius * 0.15 + "px arial"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    for ( num = 1; num < 13; num++ ) {
        ang = num * pi / 6
        ctx.rotate( ang )
        ctx.translate( 0, -radius * 0.85 )
        ctx.rotate( -ang )
        ctx.fillText( num.toString(), 0, 0 )
        ctx.rotate( ang )
        ctx.translate( 0, radius * 0.85 )
        ctx.rotate( -ang )
    }
}

function drawTime( ctx, radius ){
    let now = sky.date
    let hour = now.getHours()
    let minute = now.getMinutes()
    let second = now.getSeconds()
    //hour
    hour = hour % 12
    hour = ( hour * pi / 6 ) +
           ( minute * pi / ( 6 * 60 ) ) +
           ( second * pi / ( 360 * 60 ) )
    drawHand( ctx, hour, radius * 0.5, radius * 0.07 )
    //minute
    minute = ( minute * pi / 30 ) + ( second * pi / ( 30 * 60 ) )
    drawHand( ctx, minute, radius * 0.8, radius * 0.07 )
    // second (remove for fast animations)
    /*second = ( second * pi / 30 )
    drawHand( ctx, second, radius * 0.9, radius * 0.02 )*/
}

function drawHand( ctx, pos, length, width ) {
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.lineCap = "round"
    ctx.moveTo( 0, 0 )
    ctx.rotate( pos )
    ctx.lineTo( 0, -length )
    ctx.stroke()
    ctx.rotate( -pos )
}

export { drawClock }