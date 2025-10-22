// --- 1. استيراد المكتبات الأساسية من روابط CDN ---
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import * as Multisynq from 'https://cdn.jsdelivr.net/npm/@multisynq/client@latest/bundled/multisynq-client.esm.js';

// --- 2. إعداد المشهد ثلاثي الأبعاد ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // لون السماء
scene.fog = new THREE.Fog(0x87ceeb, 30, 150); // إضافة ضباب لإعطاء إحساس بالعمق

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias لتنعيم الحواف
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // تفعيل الظلال لزيادة الواقعية
document.body.appendChild(renderer.domElement);

// دالة لمعالجة تغيير حجم نافذة المتصفح
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// إعداد الإضاءة
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // إضاءة محيطية خفيفة
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // إضاءة شمس موجهة
directionalLight.position.set(20, 30, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// إنشاء الأرضية الخضراء
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x559020 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// إنشاء الطريق الأسود
const roadGeometry = new THREE.PlaneGeometry(8, 500);
const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01; // نرفعه قليلاً فوق الأرضية لمنع التداخل
road.receiveShadow = true;
scene.add(road);


// --- 3. إضافة عناصر تجميلية للمشهد ---

// دالة لإنشاء شجرة
function createTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 0.75, z);
    trunk.castShadow = true;

    const leavesGeo = new THREE.ConeGeometry(1, 3, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x006400 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 1.5;
    leaves.castShadow = true;
    trunk.add(leaves);

    scene.add(trunk);
}

// دالة لإنشاء جبل
function createMountain(x, z, height, radius) {
    const mountainGeo = new THREE.ConeGeometry(radius, height, 16);
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x969696 });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(x, height / 2, z);
    scene.add(mountain);

    // إضافة قمة ثلجية للجبال الطويلة
    if (height > 25) {
        const snowGeo = new THREE.ConeGeometry(radius * 0.45, height * 0.3, 16);
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const snow = new THREE.Mesh(snowGeo, snowMat);
        snow.position.y = height / 2 - (height * 0.3) / 2 + 0.1;
        mountain.add(snow);
    }
}

// دالة لإنشاء سحابة
function createCloud() {
    const cloud = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(Math.random() * 2 + 1, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });

    for (let i = 0; i < 5; i++) {
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set((Math.random() - 0.5) * 6, Math.random() * 2, (Math.random() - 0.5) * 4);
        cloud.add(sphere);
    }
    cloud.position.set((Math.random() - 0.5) * 200, Math.random() * 10 + 20, (Math.random() - 0.5) * 200);
    scene.add(cloud);
}

// توزيع العناصر بشكل عشوائي في المشهد
for (let i = 0; i < 150; i++) {
    const x = (Math.random() - 0.5) * 250;
    const z = (Math.random() - 0.5) * 250;
    if (Math.abs(x) > 6) createTree(x, z); // لا تضع أشجارًا على الطريق
}
for (let i = 0; i < 20; i++) {
    createMountain((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, Math.random() * 50 + 15, Math.random() * 15 + 8);
}
for (let i = 0; i < 30; i++) createCloud();

// --- 4. كود إنشاء السيارات ---
class SimCar {
    constructor(color) {
        // إنشاء الهيكل الرئيسي للسيارة
        const bodyGeo = new THREE.BoxGeometry(1.5, 0.6, 3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: color });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 0.6;
        this.body.castShadow = true;

        // إنشاء المقصورة
        const cabinGeo = new THREE.BoxGeometry(1.3, 0.5, 1.5);
        const cabinMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.y = 0.55;
        this.body.add(cabin);

        // إنشاء العجلات
        this.wheels = [];
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const wheelPositions = [
            { x: 0.8, z: 1.0 }, { x: -0.8, z: 1.0 },
            { x: 0.8, z: -1.0 }, { x: -0.8, z: -1.0 }
        ];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, -0.3, pos.z);
            this.body.add(wheel);
            this.wheels.push(wheel);
        });
        
        // نقطة وهمية لتتبع الكاميرا
        this.cameraPoint = new THREE.Object3D();
        this.cameraPoint.position.set(0, 4, -9);
        this.body.add(this.cameraPoint);
    }
}

// --- 6. المحاكاة المشتركة (SharedSimulation) باستخدام Multisynq ---
class SharedSimulation {
    constructor() {
        this.cars = {}; // قاموس لتخزين بيانات سيارات كل اللاعبين
    }

    // تُستدعى عند انضمام لاعب جديد
    onPlayerJoin(player) {
        this.cars[player.id] = {
            x: 0, y: 0, z: Math.random() * 4 - 2,
            rz: 0, // دوران السيارة
            color: new THREE.Color(Math.random(), Math.random(), Math.random()).getHex(), // لون عشوائي
            input: { fwd: false, bwd: false, left: false, right: false }
        };
    }

    // تُستدعى عند مغادرة لاعب
    onPlayerLeave(player) {
        delete this.cars[player.id];
    }

    // تُستدعى عند استقبال مدخلات من لاعب
    onPlayerInput(player, input) {
        if (this.cars[player.id]) {
            this.cars[player.id].input = input;
        }
    }

    // دالة التحديث الرئيسية للخادم (تُنفذ 30 مرة في الثانية)
    tick(dt) {
        const speed = 5.0;
        const turnSpeed = 2.5;

        for (const playerId in this.cars) {
            const car = this.cars[playerId];
            const input = car.input;
            let velocity = 0;

            if (input.fwd) velocity = speed;
            if (input.bwd) velocity = -speed / 2;

            if (velocity !== 0) {
                if (input.left) car.rz += turnSpeed * dt;
                if (input.right) car.rz -= turnSpeed * dt;
            }
            
            car.x -= Math.sin(car.rz) * velocity * dt;
            car.z -= Math.cos(car.rz) * velocity * dt;
        }
    }
}

// --- 5. واجهة المستخدم والتحكم (SimInterface) ---
class SimInterface {
    constructor(session) {
        this.session = session;
        this.carInstances = {}; // لتخزين كائنات السيارات ثلاثية الأبعاد
        this.input = { fwd: false, bwd: false, left: false, right: false };

        this.setupKeyboardControls();
        this.setupTouchControls();
    }

    // إعداد التحكم عبر لوحة المفاتيح
    setupKeyboardControls() {
        const keyMap = { 'KeyW': 'fwd', 'ArrowUp': 'fwd', 'KeyS': 'bwd', 'ArrowDown': 'bwd', 'KeyA': 'left', 'ArrowLeft': 'left', 'KeyD': 'right', 'ArrowRight': 'right' };
        
        const handler = (isPressed) => (e) => {
            if (keyMap[e.code]) {
                this.input[keyMap[e.code]] = isPressed;
                this.session.input(this.input);
            }
        };

        document.addEventListener('keydown', handler(true));
        document.addEventListener('keyup', handler(false));
    }

    // إعداد التحكم عبر أزرار اللمس
    setupTouchControls() {
        const controls = { 'btn-fwd': 'fwd', 'btn-bwd': 'bwd', 'btn-left': 'left', 'btn-right': 'right' };
        for (const [id, key] of Object.entries(controls)) {
            const btn = document.getElementById(id);
            if (btn) {
                const handler = (isPressed) => (e) => {
                    e.preventDefault();
                    this.input[key] = isPressed;
                    this.session.input(this.input);
                };
                btn.addEventListener('touchstart', handler(true), { passive: false });
                btn.addEventListener('touchend', handler(false), { passive: false });
                btn.addEventListener('mousedown', handler(true));
                btn.addEventListener('mouseup', handler(false));
            }
        }
    }

    // دالة التحديث التي تعمل في كل إطار (Frame)
    update() {
        const state = this.session.state;
        if (!state) return;

        // مزامنة السيارات: إضافة سيارات اللاعبين الجدد أو حذف سيارات اللاعبين المغادرين
        for (const playerId in this.carInstances) {
            if (!state.cars[playerId]) {
                scene.remove(this.carInstances[playerId].body);
                delete this.carInstances[playerId];
            }
        }
        for (const playerId in state.cars) {
            if (!this.carInstances[playerId]) {
                this.carInstances[playerId] = new SimCar(state.cars[playerId].color);
                scene.add(this.carInstances[playerId].body);
            }
        }

        // تحديث مواقع ودوران كل السيارات في المشهد
        for (const playerId in state.cars) {
            const carData = state.cars[playerId];
            const carInstance = this.carInstances[playerId];
            if (carInstance) {
                carInstance.body.position.lerp(new THREE.Vector3(carData.x, 0.6, carData.z), 0.2);
                carInstance.body.quaternion.slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, carData.rz, 0)), 0.2);
            }
        }
        
        // تحديث الكاميرا لتتبع سيارة اللاعب الحالي
        const myCar = this.carInstances[this.session.playerId];
        if (myCar) {
            const cameraTargetPos = new THREE.Vector3();
            myCar.cameraPoint.getWorldPosition(cameraTargetPos);
            camera.position.lerp(cameraTargetPos, 0.1);
            
            const carLookAt = myCar.body.position.clone().add(new THREE.Vector3(0, 1, 0));
            camera.lookAt(carLookAt);
        }

        renderer.render(scene, camera);
    }
}

// --- 7. الانضمام إلى جلسة اللعب ---
console.log("جاري الانضمام إلى جلسة اللعبة...");
Multisynq.Session.join({
    // !!! هام جداً: استبدل هذا النص بمفتاح API الخاص بك من موقع multisynq.io
    apiKey: "2XDOLvdMMqSchPO6xQXRB0WpilgSWQIQlaFxTk8DbS",
    name: location.origin + location.pathname, // اسم فريد للجلسة لكل رابط
    password: "none", // جلسة عامة بدون كلمة سر
    model: SharedSimulation, // كلاس منطق اللعبة
    view: SimInterface, // كلاس العرض والتحكم
    debug: [] // يمكن وضع ["writes"] هنا لرؤية بيانات الشبكة في الكونسول
}).then(app => {
    console.log("تم الانضمام بنجاح!");
    const view = app.view || app;
    // حلقة اللعبة الرئيسية (Game Loop)
    const loop = () => {
        view.update();
        requestAnimationFrame(loop);
    };
    loop();
}).catch(err => {
    console.error("فشل الانضمام للجلسة:", err);
    alert("لم نتمكن من الاتصال بالخادم. الرجاء التأكد من صحة مفتاح API ووجود اتصال بالإنترنت.");
});