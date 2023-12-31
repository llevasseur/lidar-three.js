

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var params = {
    projection: 'normal',
    background: false,
    exposure: 1.0,
    bloomStrength: 1.5,
    bloomThreshold: 0.85,
    bloomRadius: 0.4
};
var camera, scene, renderer, controls, objects = [];
var effectFXAA, bloomPass, renderScene;
var hdrCubeMap;
var composer;
var standardMaterial;
var hdrCubeRenderTarget;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 0.0, 35, 35 * 3.5 );

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setClearColor( new THREE.Color( 0x111111 ) );
    renderer.toneMapping = THREE.LinearToneMapping;

    standardMaterial = new THREE.MeshStandardMaterial( {
        map: null,
        color: 0xffffff,
        metalness: 1.0,
        shading: THREE.SmoothShading
    } );

    var geometry = new THREE.TorusKnotGeometry( 18, 8, 150, 20 );;
    var torusMesh1 = new THREE.Mesh( geometry, standardMaterial );
    torusMesh1.position.x = 0.0;
    torusMesh1.castShadow = true;
    torusMesh1.receiveShadow = true;
    scene.add( torusMesh1 );
    objects.push( torusMesh1 );

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load( "./textures/roughness_map.jpg", function( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 9, 2 );
        standardMaterial.roughnessMap = map;
        standardMaterial.bumpMap = map;
        standardMaterial.needsUpdate = true;
    } );

    var genCubeUrls = function( prefix, postfix ) {
        return [
            prefix + 'px' + postfix, prefix + 'nx' + postfix,
            prefix + 'py' + postfix, prefix + 'ny' + postfix,
            prefix + 'pz' + postfix, prefix + 'nz' + postfix
        ];
    };

    var hdrUrls = genCubeUrls( "./textures/cube/pisaHDR/", ".hdr" );
    new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrUrls, function ( hdrCubeMap ) {

        var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
        pmremGenerator.update( renderer );

        var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
        pmremCubeUVPacker.update( renderer );

        hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    } );
    // Lights

    scene.add( new THREE.AmbientLight( 0x222222 ) );

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 50, 100, 50 );
    spotLight.angle = Math.PI / 7;
    spotLight.penumbra = 0.8
    spotLight.castShadow = true;
    scene.add( spotLight );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    renderScene = new THREE.RenderPass(scene, camera);

    // renderScene.clear = true;
    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

    var copyShader = new THREE.ShaderPass(THREE.CopyShader);
    copyShader.renderToScreen = true;

    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);//1.0, 9, 0.5, 512);
    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    composer.addPass(effectFXAA);
    composer.addPass(bloomPass);
    composer.addPass(copyShader);
    //renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    stats = new Stats();
    container.appendChild( stats.dom );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();

    gui.add( params, 'exposure', 0.1, 2 );
    gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function(value) {
    bloomPass.threshold = Number(value);
});
    gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function(value) {
    bloomPass.strength = Number(value);
});
    gui.add( params, 'bloomRadius', 0.0, 1.0 ).onChange( function(value) {
    bloomPass.radius = Number(value);
});
    gui.open();

}

function onWindowResize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );
}

//

function animate() {

    requestAnimationFrame( animate );

    stats.begin();
    render();
    stats.end();

}

function render() {

    if ( standardMaterial !== undefined ) {

        standardMaterial.roughness = 1.0;
        standardMaterial.bumpScale = - 0.05;

        var newEnvMap = standardMaterial.envMap;
        newEnvMap = hdrCubeRenderTarget ? hdrCubeRenderTarget.texture : null;

        if( newEnvMap !== standardMaterial.envMap ) {

            standardMaterial.envMap = newEnvMap;
            standardMaterial.needsUpdate = true;

        }

    }

    renderer.toneMappingExposure = Math.pow( params.exposure, 4.0 );

    var timer = Date.now() * 0.00025;

    camera.lookAt( scene.position );

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var object = objects[ i ];
        object.rotation.y += 0.005;

    }

    // renderer.render( scene, camera );
    composer.render();
}