$(function () {

    var container, stats;
    var camera, cameraTarget, scene, renderer;

    init();
    animate();

    function init() {

        WebFont.load({
            google: {
                families: ['Josefin Sans', 'Reem Kufi']
            }
        });

        container = document.getElementById('mf');

        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 15);
        camera.position.set(3, 0.15, 3);
        cameraTarget = new THREE.Vector3(0, -0, 0);

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xf0f4f0, 2, 15);

        // Ground
        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(40, 40),
            new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x101010 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        scene.add(plane);
        plane.receiveShadow = true;
        // ASCII file
        var loader = new THREE.STLLoader();

        var material = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x111111, shininess: 200 });
        var txloader = new THREE.TextureLoader();

        txloader.load('L60-1653.jpg', function (tx) {
            tx.wrapS = THREE.RepeatWrapping;
            tx.wrapT = THREE.RepeatWrapping;
            //tx.repeat.set( 4, 1 );
            console.log(tx);

            material = new THREE.MeshPhongMaterial({
                map: tx,
                color: 0xd8eb4f,
                shininess: 200
            });

            //material.side = THREE.DoubleSide;
            loader.load('mf.stl', function (geometry) {
                //THREE.BufferGeometryUtils.computeTangents(geometry);
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(0, 0.37, -0.6);
                mesh.rotation.set(-Math.PI / 2.5, 0, 0);
                mesh.scale.set(.003, .003, .003);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add(mesh);
            });

        });

        //Lights
        scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
        addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true/*, alpha: true */ });
        renderer.setClearColor(scene.fog.color/*, 0*/);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.renderReverseSided = false;
        container.appendChild(renderer.domElement);
        // stats
        //stats = new Stats();
        //container.appendChild(stats.dom);
        //
        window.addEventListener('resize', onWindowResize, false);
    }
    function addShadowedLight(x, y, z, color, intensity) {
        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z);
        scene.add(directionalLight);
        directionalLight.castShadow = true;
        var d = 1;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 4;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.bias = -0.005;
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function animate() {
        requestAnimationFrame(animate);
        render();
        //stats.update();
    }
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    var ran = 3.0;
    function render() {
        var timer = Date.now() * 0.00009;
        //var rana = getRandomArbitrary(-4000, 3000) / 1000;
        //ran += rana;
        //console.log(ran);
        camera.position.x = Math.cos(timer) * ran;
        camera.position.z = Math.atan(timer) * ran;
        camera.lookAt(cameraTarget);
        renderer.render(scene, camera);
    }

});