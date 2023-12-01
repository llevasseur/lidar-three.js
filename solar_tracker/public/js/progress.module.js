import * as THREE from 'three'

class ProgressBar extends THREE.Sprite{

    constructor(_progress){

        super();
        this.scale.set(2, 0.1);
        this.material = new THREE.SpriteMaterial({

          onBeforeCompile: shader => {
              
            shader.uniforms.progress = _progress;
            shader.fragmentShader = `
              #define ss(a, b, c) smoothstep(a, b, c)
              uniform float progress;
              ${shader.fragmentShader}
            `.replace(
              `outgoingLight = diffuseColor.rgb;`,
              `outgoingLight = diffuseColor.rgb;
                vec3 backColor = mix(vec3(0), vec3(0, 0.5, 0), progress);
                float pb = step(progress, vUv.x);
                outgoingLight.rgb = mix(vec3(0, 1, 0), backColor, pb);
              `
            );

          }

        });

        this.material.defines = {"USE_UV" : ""};
        this.center.set(0.5, 0);
      
    }
}

class ProgressObject extends THREE.Object3D {

    constructor(height) {

        super();
        let _progress = { value: 0.5 };

        let og = new THREE.BoxGeometry().translate(0, 0.5, 0);
        let om = new THREE.MeshLambertMaterial();
        let o = new THREE.Mesh(og, om);
        o.scale.y = height;

        let lg = new THREE.EdgesGeometry(new THREE.BoxGeometry());
        lg.translate(0, 0.5, 0);
        lg.scale(1, height, 1);
        let lm = new THREE.LineBasicMaterial({
          color: new THREE.Color(Math.random() * 0xffffff)
            .multiplyScalar(0.5)
            .addScalar(0.5)
        });
        let l = new THREE.LineSegments(lg, lm);

        let pbar = new ProgressBar(_progress);
        pbar.position.y = height * 1.1;

        this.add(o, l, pbar);

        this.update = (val) => {
          _progress.value = noise(val, 0.25) * 0.5 + 0.5;
          o.scale.y = height * _progress.value;
        };

    }

}

export {ProgressBar, ProgressObject}