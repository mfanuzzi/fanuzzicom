$(function () {

    var container, stats;
    var camera, cameraTarget, scene, renderer;

    init();
    initnav();
    animate();

    $(window).scroll(function () {
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(pageCalc, 250));
    });

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

    var orientation = {
        TOP: 1,
        BOTTOM: 2
    };
    var plist = [
        { page: 1, anchor: orientation.TOP, offset: 0, element: 'canvas' },
        { page: 2, anchor: orientation.TOP, offset: -4, element: '#work' },
        { page: 3, anchor: orientation.BOTTOM, offset: 6, element: '#work li:eq(0) > div' },
        { page: 4, anchor: orientation.BOTTOM, offset: 6, element: '#work li:eq(1) > div' },
        { page: 5, anchor: orientation.BOTTOM, offset: 6, element: '#work li:eq(2) > div' },
        { page: 6, anchor: orientation.BOTTOM, offset: 6, element: '#work li:eq(3) > div' },
        { page: 7, anchor: orientation.BOTTOM, offset: 6, element: '#work li:eq(4) > div' },
    ];
    var page = 0;
    function initnav() {
        $("#cls-3").click(function () { pageto(1) });
        $("#cls-2").click(function () { pageto(-1) });
    }
    function calcPlistPos(i) {
        var dest = $(plist[i].element).offset().top;
        if (plist[i].anchor == orientation.BOTTOM) {
            dest += $(plist[i].element).outerHeight();
            dest -= $(window).height();
        }

        //var offset = $(window).width() * (plist[i].offset / 100.0);
        var offset = convertRem(plist[i].offset);
        dest += offset;

        return Math.round(dest);
    }
    function pageCalc() {
        // calculate what page we're actually at
        var x = 0;
        while (x < plist.length - 1) {
            if (calcPlistPos(x) >= $(window).scrollTop()) {
                //if ($(window).scrollTop() !== calcPlistPos(x))
                break;
            }
            ++x;
        }

        page = x - 1;

        if (calcPlistPos(x) == $(window).scrollTop()) {
            ++page;
        }

        if (page == plist.length - 2) {
            if ($(window).scrollTop() > calcPlistPos(x)) {
                ++page;
            }
        }

        $("body").attr('data-page', page);
        if (page == 0)
            $("body").removeClass('page-last').addClass('page-first');
        else if (page == (plist.length - 1))
            $("body").removeClass('page-first').addClass('page-last');
        else
            $("body").removeClass('page-first').removeClass('page-last');

    }
    function pageto(amt) {
        pageCalc();

        var i = page + amt;

        if (i < 0)
            i = 0;
        if (i > (plist.length - 1))
            i = (plist.length - 1);

        var dest = calcPlistPos(i);

        $("html,body").animate(
            {
                scrollTop: dest
            }, 700, "easeOutCirc"
        );

        page = i;

}
    function getRootElementFontSize() {
        // Returns a number
        return parseFloat(
            // of the computed font-size, so in px
            getComputedStyle(
                // for the root <html> element
                document.documentElement
            )
            .fontSize
        );
    }
    function convertRem(value) {
        return value * getRootElementFontSize();
    }
});

$.easing.jswing = $.easing.swing;

$.extend($.easing,
{
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert($.easing.default);
        return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});