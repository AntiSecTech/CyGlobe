let scene, camera, renderer, globe, particles, controls;
let points = [];
let lines = [];
let activeSignals = [];

const AttackTypes = {
    MALWARE: {
        name: 'Malware',
        color: 0xff0000,
        severity: 3
    },
    DDOS: {
        name: 'DDoS',
        color: 0xff6600,
        severity: 4
    },
    PHISHING: {
        name: 'Phishing',
        color: 0xffff00,
        severity: 2
    },
    RANSOMWARE: {
        name: 'Ransomware',
        color: 0xff00ff,
        severity: 5
    },
    BRUTEFORCE: {
        name: 'Brute Force',
        color: 0x00ffff,
        severity: 1
    }
};

class Attack {
    constructor(source, target, type, timestamp) {
        this.source = source; // { lat, lng, country, city }
        this.target = target; // { lat, lng, country, city }
        this.type = type;    // One of AttackTypes
        this.timestamp = timestamp;
        this.id = crypto.randomUUID();
    }

    getIntensity() {
        return this.type.severity / 5;
    }
}

function addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);
}

function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function createConnections() {
    // Example locations (add more as needed)
    const locations = [
        { lat: 40.7128, lng: -74.0060, name: "New York" },
        { lat: 51.5074, lng: -0.1278, name: "London" },
        { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
        { lat: -33.8688, lng: 151.2093, name: "Sydney" },
        { lat: 48.8566, lng: 2.3522, name: "Paris" },
        { lat: 55.7558, lng: 37.6173, name: "Moscow" },
        { lat: -22.9068, lng: -43.1729, name: "Rio" },
        { lat: 31.2304, lng: 121.4737, name: "Shanghai" },
        { lat: -1.2921, lng: 36.8219, name: "Nairobi" },
        { lat: 25.2048, lng: 55.2708, name: "Dubai" },
        { lat: 19.4326, lng: -99.1332, name: "Mexico City" },
        { lat: -34.6037, lng: -58.3816, name: "Buenos Aires" },
        { lat: 37.5665, lng: 126.9780, name: "Seoul" }
    ];

    // Create location markers
    locations.forEach(loc => {
        const point = latLngToVector3(loc.lat, loc.lng, 2.1);
        const markerGeometry = new THREE.SphereGeometry(0.015, 8, 8); // Smaller markers
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.6
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(point);
        scene.add(marker);
        points.push(point);
    });

    // Create connections between locations
    for(let i = 0; i < locations.length; i++) {
        for(let j = i + 1; j < locations.length; j++) {
            const pointA = latLngToVector3(locations[i].lat, locations[i].lng, 2.1);
            const pointB = latLngToVector3(locations[j].lat, locations[j].lng, 2.1);

            // Create curved line between points
            const midPoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
            midPoint.normalize().multiplyScalar(2.5); // Curve peak height

            const curve = new THREE.QuadraticBezierCurve3(pointA, midPoint, pointB);
            const points = curve.getPoints(50);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            lines.push(line);
        }
    }
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const positions = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i += 3) {
        const radius = 3 + Math.random() * 7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    // Draw a circular gradient
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    const sprite = new THREE.Texture(canvas);
    sprite.needsUpdate = true;

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.8,
        map: sprite,
        transparent: true,
        opacity: 0.4,
        color: 0x888888,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: 0x000066,
        transparent: true,
        opacity: 0.8,
        emissive: 0x153604,
    });
    
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
}

function createSignalLines() {
    function createNewSignal(attack) {
        if (!attack) {
            console.log('No attack data provided to createNewSignal');
            return null;
        }

        // Convert lat/lng to Vector3 positions on globe surface
        const sourcePoint = latLngToVector3(attack.source.lat, attack.source.lng, 2.1);
        const targetPoint = latLngToVector3(attack.target.lat, attack.target.lng, 2.1);

        // Create curve for smooth arc
        const midPoint = sourcePoint.clone().add(targetPoint).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(2.5); // Adjust arc height by changing this multiplier

        const curve = new THREE.QuadraticBezierCurve3(
            sourcePoint,
            midPoint,
            targetPoint
        );

        // Create line geometry
        const points = curve.getPoints(50);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: attack.type.color,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);

        // Create dot geometry
        const dotGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: attack.type.color,
            transparent: true,
            opacity: 0.8
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.copy(sourcePoint);

        // Add log entry
        const logContent = document.getElementById('log-content');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span style="color: #${attack.type.color.toString(16)}">
                ${attack.type.name}
            </span>: 
            ${attack.source.country} → ${attack.target.country}
            (${new Date().toLocaleTimeString()})
        `;
        logContent.insertBefore(logEntry, logContent.firstChild);

        // Limit log entries
        if (logContent.children.length > 50) {
            logContent.removeChild(logContent.lastChild);
        }

        scene.add(line);
        scene.add(dot);

        const startTime = Date.now();
        const duration = 2000; // 2 seconds for the dot animation
        const fadeDuration = 1000; // 1 second for fading out

        return {
            dot,
            line,
            curve,
            startTime,
            duration,
            update: function() {
                const now = Date.now();
                const progress = (now - startTime) / duration;

                if (progress >= 1) {
                    // Calculate fade progress after dot reaches target
                    const fadeProgress = (now - (startTime + duration)) / fadeDuration;
                    
                    if (fadeProgress >= 1) {
                        // Remove completely after fade
                        scene.remove(line);
                        scene.remove(dot);
                        return false;
                    }
                    
                    // Fade out both line and dot
                    line.material.opacity = Math.max(0, 0.8 * (1 - fadeProgress));
                    dot.material.opacity = Math.max(0, 0.8 * (1 - fadeProgress));
                    return true;
                }

                // Update dot position along curve
                const point = curve.getPoint(progress);
                dot.position.copy(point);
                return true;
            }
        };
    }

    function animateSignals() {
        const now = Date.now();

        // Remove completed signals
        activeSignals = activeSignals.filter(signal => {
            const progress = (now - signal.startTime) / signal.duration;
            if (progress >= 1) {
                scene.remove(signal.dot);
                return false;
            }
            return true;
        });

        // Animate existing signals
        activeSignals.forEach(signal => {
            const progress = (now - signal.startTime) / signal.duration;
            const point = signal.curve.getPoint(progress);
            signal.dot.position.copy(point);
        });

        requestAnimationFrame(animateSignals);
    }

    // Start the animation loop
    animateSignals();

    // Make createNewSignal available globally
    window.createNewSignal = createNewSignal;
}

function updateAttackStats(attack) {
    const statsEl = document.getElementById('attackTypes');
    statsEl.innerHTML = `
        <div class="attack-entry" style="color: #${attack.type.color.toString(16)}">
            ${attack.type.name}: ${attack.source.country} → ${attack.target.country}
        </div>
        ${statsEl.innerHTML}
    `.slice(0, 5); // Keep last 5 attacks
}

class AttackDataService {
    constructor() {
        this.cache = new Map();
        this.isPolling = false;
    }

    async startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('Starting attack data polling...');
        await this.pollData();
    }

    async pollData() {
        if (!this.isPolling) return;

        try {
            console.log('Fetching attack data...');
            const attacks = await this.fetchRecentAttacks();
            
            if (attacks && attacks.length > 0) {
                console.log(`Processing ${attacks.length} attacks`);
                for (const attackData of attacks) {
                    const sourceLocation = await this.getLocationForIP(attackData.ipAddress);
                    const targetLocation = this.getRandomLocation(); // Random target for demo
                    
                    const attack = new Attack(
                        sourceLocation,
                        targetLocation,
                        this.categorizeAttack(attackData.abuseConfidenceScore),
                        new Date(attackData.lastReportedAt)
                    );
                    
                    const signal = window.createNewSignal(attack);
                    if (signal) {
                        scene.add(signal.dot);
                        activeSignals.push(signal);
                    }
                }
                
                // Update stats
                document.getElementById('activeAttacks').textContent = activeSignals.length;
            }
        } catch (error) {
            console.error('Error polling attack data:', error);
        }

        // Schedule next poll
        setTimeout(() => this.pollData(), 5000);
    }

    async fetchRecentAttacks() {
        console.log('Fetching from API...');
        const response = await fetch('http://localhost:3000/api/attacks');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    }

    async getLocationForIP(ip) {
        if (this.cache.has(ip)) {
            return this.cache.get(ip);
        }

        try {
            const response = await fetch(`http://localhost:3000/api/location/${ip}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const location = {
                lat: data.latitude,
                lng: data.longitude,
                country: data.country_name || 'Unknown',
                city: data.city || 'Unknown'
            };

            this.cache.set(ip, location);
            return location;
        } catch (error) {
            console.error('Error fetching IP location:', error);
            return null;
        }
    }

    getRandomLocation() {
        const locations = [
            { lat: 40.7128, lng: -74.0060, country: "USA", city: "New York" },
            { lat: 51.5074, lng: -0.1278, country: "UK", city: "London" },
            { lat: 35.6762, lng: 139.6503, country: "Japan", city: "Tokyo" },
            { lat: -33.8688, lng: 151.2093, country: "Australia", city: "Sydney" },
            { lat: 48.8566, lng: 2.3522, country: "France", city: "Paris" }
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    categorizeAttack(confidenceScore) {
        if (confidenceScore > 90) return AttackTypes.RANSOMWARE;
        if (confidenceScore > 80) return AttackTypes.DDOS;
        if (confidenceScore > 70) return AttackTypes.MALWARE;
        if (confidenceScore > 60) return AttackTypes.PHISHING;
        return AttackTypes.BRUTEFORCE;
    }
}

async function addCountryBorders() {
    try {
        // Load GeoJSON data (you can host this file locally)
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const data = await response.json();
        
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });

        data.features.forEach(feature => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates.forEach(coordinates => {
                    drawPolygon(coordinates, material);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon.forEach(coordinates => {
                        drawPolygon(coordinates, material);
                    });
                });
            }
        });
    } catch (error) {
        console.error('Error loading country borders:', error);
    }
}

function drawPolygon(coordinates, material) {
    const points = [];
    coordinates.forEach(coord => {
        const [lng, lat] = coord;
        const point = latLngToVector3(lat, lng, 2.01); // Slightly above globe surface
        points.push(point);
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#globeCanvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 2.3;
    controls.maxDistance = 9.2;

    createGlobe();
    createParticles();
    addLights();
    addCountryBorders();
    createSignalLines();

    // Initialize and start attack data service
    const attackService = new AttackDataService();
    attackService.startPolling().catch(console.error);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    if (controls) {
        controls.update();
    }

    // Update globe rotation
    if (globe) {
        globe.rotation.y += 0.002;
    }

    // Update particles
    if (particles) {
        particles.rotation.y += 0.0005;
    }

    // Update active signals
    activeSignals = activeSignals.filter(signal => signal.update());

    // Render
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init(); 
