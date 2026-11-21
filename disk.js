
// ==========================================
// OS SCHEDULING VISUALIZER
// DISK SCHEDULING MODULE
// ==========================================

// Initial disk request queue

let requestQueue = [82, 170, 43, 140, 24, 16, 190];

let results = {};
let currentResult = null;
let currentStep = 0;
let autoPlayTimer = null;


// ==========================================
// 1. FCFS - FIRST COME FIRST SERVED
// ==========================================

function fcfs(head, queue) {

    return [head, ...queue];

}


// ==========================================
// 2. SSTF - SHORTEST SEEK TIME FIRST
// ==========================================

function sstf(head, queue) {

    let requests = [...queue];

    let path = [head];

    let current = head;

    while (requests.length > 0) {

        let nearestIndex = 0;

        for (let i = 1; i < requests.length; i++) {

            if (
                Math.abs(requests[i] - current) <
                Math.abs(requests[nearestIndex] - current)
            ) {
                nearestIndex = i;
            }

        }

        current = requests.splice(nearestIndex, 1)[0];

        path.push(current);

    }

    return path;

}


// ==========================================
// 3. SCAN ALGORITHM
// ==========================================

function scan(head, queue, size, direction) {

    let left = queue
        .filter(x => x < head)
        .sort((a, b) => b - a);

    let right = queue
        .filter(x => x >= head)
        .sort((a, b) => a - b);

    let path = [head];

    if (direction === "right") {

        path.push(...right);

        if (path[path.length - 1] !== size - 1) {
            path.push(size - 1);
        }

        path.push(...left);

    } else {

        path.push(...left);

        if (path[path.length - 1] !== 0) {
            path.push(0);
        }

        path.push(...right.reverse());

    }

    return path;

}


// ==========================================
// 4. C-SCAN ALGORITHM
// ==========================================

function cscan(head, queue, size, direction) {

    let left = queue
        .filter(x => x < head)
        .sort((a, b) => a - b);

    let right = queue
        .filter(x => x >= head)
        .sort((a, b) => a - b);

    let path = [head];

    if (direction === "right") {

        path.push(...right);

        if (left.length > 0) {

            if (path[path.length - 1] !== size - 1) {
                path.push(size - 1);
            }

            path.push(0);

            path.push(...left);

        }

    } else {

        path.push(...left.reverse());

        if (right.length > 0) {

            if (path[path.length - 1] !== 0) {
                path.push(0);
            }

            path.push(size - 1);

            path.push(...right.reverse());

        }

    }

    return path;

}


// ==========================================
// 5. LOOK ALGORITHM
// ==========================================

function look(head, queue, direction) {

    let left = queue
        .filter(x => x < head)
        .sort((a, b) => b - a);

    let right = queue
        .filter(x => x >= head)
        .sort((a, b) => a - b);

    let path = [head];

    if (direction === "right") {

        path.push(...right);

        path.push(...left);

    } else {

        path.push(...left);

        path.push(...right.reverse());

    }

    return path;

}


// ==========================================
// 6. DYNAMIC REQUEST QUEUE
// ==========================================

// Display requests on the page

function renderRequestQueue() {

    const list = document.getElementById("requestList");

    const queueInput = document.getElementById("requestQueue");

    queueInput.value = requestQueue.join(", ");

    list.innerHTML = "";

    if (requestQueue.length === 0) {

        list.textContent = "No requests added yet.";

        return;

    }

    requestQueue.forEach((request, index) => {

        const chip = document.createElement("div");

        chip.className = "request-chip";

        const number = document.createElement("span");

        number.textContent = request;

        const removeButton = document.createElement("button");

        removeButton.className = "remove-request";

        removeButton.textContent = "×";

        removeButton.type = "button";

        removeButton.title = "Remove request";

        removeButton.addEventListener("click", function () {

            removeRequest(index);

        });

        chip.appendChild(number);

        chip.appendChild(removeButton);

        list.appendChild(chip);

    });

}


// Add a new disk request

function addRequest() {

    const input = document.getElementById("newRequest");

    const value = input.value.trim();

    const size = Number(
        document.getElementById("diskSize").value
    );

    const cylinder = Number(value);

    if (
        value === "" ||
        !/^\d+$/.test(value) ||
        !Number.isInteger(size) ||
        size < 1 ||
        cylinder < 0 ||
        cylinder >= size
    ) {

        document.getElementById("errorMessage").textContent =
            "Enter a valid cylinder between 0 and disk size - 1.";

        return;

    }

    requestQueue.push(cylinder);

    input.value = "";

    document.getElementById("errorMessage").textContent = "";

    renderRequestQueue();

    stopAutoPlay();

}


// Remove an individual request

function removeRequest(index) {

    requestQueue.splice(index, 1);

    renderRequestQueue();

    stopAutoPlay();

}


// Remove all requests

function clearRequests() {

    requestQueue = [];

    renderRequestQueue();

    stopAutoPlay();

    document.getElementById("errorMessage").textContent = "";

}


// Press Enter to add a request

document.getElementById("newRequest").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addRequest();

        }

    }
);


// ==========================================
// 7. INPUT VALIDATION
// ==========================================

function getInput() {

    let size = Number(
        document.getElementById("diskSize").value
    );

    let head = Number(
        document.getElementById("headPosition").value
    );

    let direction =
        document.getElementById("direction").value;

    if (
        !Number.isInteger(size) ||
        size < 1 ||
        !Number.isInteger(head) ||
        head < 0 ||
        head >= size
    ) {

        throw new Error(
            "Enter a valid disk size and head position."
        );

    }

    if (
        requestQueue.some(x =>
            !Number.isInteger(x) || x < 0 || x >= size
        )
    ) {

        throw new Error(
            "All requests must be within the disk range."
        );

    }

    return {
        size,
        head,
        queue: [...requestQueue],
        direction
    };

}


// ==========================================
// 8. CALCULATE TOTAL HEAD MOVEMENT
// ==========================================

function calculateMovement(path) {

    let total = 0;

    for (let i = 1; i < path.length; i++) {

        total += Math.abs(path[i] - path[i - 1]);

    }

    return total;

}


// ==========================================
// 9. SERVICE SEQUENCE
// ==========================================

function getServiceSequence(path, queue) {

    let remaining = [...queue];

    let sequence = [];

    for (let i = 1; i < path.length; i++) {

        let index = remaining.indexOf(path[i]);

        if (index !== -1) {

            sequence.push(remaining.splice(index, 1)[0]);

        }

    }

    return sequence;

}


// ==========================================
// 10. RUN ALL DISK ALGORITHMS
// ==========================================

function runScheduling() {

    stopAutoPlay();

    try {

        let { size, head, queue, direction } = getInput();

        results = {

            "FCFS": fcfs(head, queue),

            "SSTF": sstf(head, queue),

            "SCAN": scan(head, queue, size, direction),

            "C-SCAN": cscan(head, queue, size, direction),

            "LOOK": look(head, queue, direction)

        };

        document.getElementById("errorMessage").textContent = "";

        displayComparison();

        document.getElementById("algorithm").value = "FCFS";

        loadAlgorithm("FCFS");

    } catch (error) {

        document.getElementById("errorMessage").textContent =
            error.message;

    }

}


// ==========================================
// 11. LOAD SELECTED ALGORITHM
// ==========================================

function selectAlgorithm() {

    stopAutoPlay();

    let algorithm =
        document.getElementById("algorithm").value;

    if (!results[algorithm]) {

        return;

    }

    loadAlgorithm(algorithm);

}


function loadAlgorithm(algorithm) {

    currentResult = {

        path: results[algorithm],

        sequence: null,

        movement: calculateMovement(results[algorithm])

    };

    let queue = getInput().queue;

    currentResult.sequence =
        getServiceSequence(currentResult.path, queue);

    currentStep = 0;

    document.getElementById("serviceSequence").textContent =
        currentResult.sequence.length > 0
            ? currentResult.sequence.join(" → ")
            : "No requests";

    document.getElementById("totalMovement").textContent =
        currentResult.movement;

    document.getElementById("completedRequests").textContent =
        currentResult.sequence.length;

    drawGraph();

    updateStep();

}


// ==========================================
// 12. DRAW DISK SEEK GRAPH
// ==========================================

function drawGraph() {

    let svg = document.getElementById("seekGraph");

    let path = currentResult.path;

    let size = getInput().size;

    let width = 800;

    let height = 340;

    let margin = {
        left: 65,
        right: 35,
        top: 35,
        bottom: 50
    };

    let plotWidth = width - margin.left - margin.right;

    let plotHeight = height - margin.top - margin.bottom;


    function xPosition(index) {

        if (path.length === 1) {

            return margin.left + plotWidth / 2;

        }

        return margin.left +
            (index / (path.length - 1)) * plotWidth;

    }


    function yPosition(value) {

        if (size === 1) {

            return margin.top + plotHeight / 2;

        }

        return margin.top + plotHeight -
            (value / (size - 1)) * plotHeight;

    }


    let html = "";


    // Horizontal grid lines

    for (let i = 0; i <= 4; i++) {

        let value = Math.round((size - 1) * i / 4);

        let y = yPosition(value);

        html += `

            <line
                x1="${margin.left}"
                y1="${y}"
                x2="${width - margin.right}"
                y2="${y}"
                stroke="#263b5b"
                stroke-dasharray="4"
            />

            <text
                x="${margin.left - 12}"
                y="${y + 4}"
                text-anchor="end"
                fill="#94a3b8"
                font-size="12"
            >
                ${value}
            </text>

        `;

    }


    // Axis labels

    html += `

        <text
            x="400"
            y="330"
            fill="#94a3b8"
            text-anchor="middle"
            font-size="12"
        >
            Request Order
        </text>

        <text
            x="16"
            y="170"
            fill="#94a3b8"
            text-anchor="middle"
            font-size="12"
            transform="rotate(-90 16 170)"
        >
            Cylinder Number
        </text>

    `;


    // Movement lines

    for (let i = 1; i < path.length; i++) {

        let x1 = xPosition(i - 1);

        let y1 = yPosition(path[i - 1]);

        let x2 = xPosition(i);

        let y2 = yPosition(path[i]);

        let isWrap =
            (path[i - 1] === 0 && path[i] === size - 1) ||
            (path[i - 1] === size - 1 && path[i] === 0);

        html += `

            <line
                x1="${x1}"
                y1="${y1}"
                x2="${x2}"
                y2="${y2}"
                stroke="${isWrap ? '#f59e0b' : '#60a5fa'}"
                stroke-width="2.5"
                stroke-dasharray="${isWrap ? '6 5' : 'none'}"
                opacity="${i <= currentStep ? 1 : 0.2}"
            />

        `;

    }


    // Cylinder points

    path.forEach((value, index) => {

        let x = xPosition(index);

        let y = yPosition(value);

        let active = index <= currentStep;

        html += `

            <circle
                cx="${x}"
                cy="${y}"
                r="6"
                fill="${active ? '#60a5fa' : '#64748b'}"
                stroke="#ffffff"
                stroke-width="1.5"
            />

            <text
                x="${x}"
                y="${y - 12}"
                fill="${active ? '#ffffff' : '#94a3b8'}"
                font-size="11"
                text-anchor="middle"
            >
                ${value}
            </text>

        `;

    });


    svg.innerHTML = html;

}


// ==========================================
// 13. NEXT STEP
// ==========================================

function nextStep() {

    if (!currentResult) return;

    if (currentStep < currentResult.path.length - 1) {

        currentStep++;

        drawGraph();

        updateStep();

    } else {

        stopAutoPlay();

    }

}


// ==========================================
// 14. PREVIOUS STEP
// ==========================================

function previousStep() {

    if (!currentResult) return;

    if (currentStep > 0) {

        currentStep--;

        drawGraph();

        updateStep();

    }

}


// ==========================================
// 15. UPDATE STEP INFORMATION
// ==========================================

function updateStep() {

    let path = currentResult.path;

    let movement = 0;

    for (let i = 1; i <= currentStep; i++) {

        movement += Math.abs(path[i] - path[i - 1]);

    }

    document.getElementById("stepInfo").textContent =

        `Step ${currentStep} of ${path.length - 1} | ` +
        `Current Head: ${path[currentStep]} | ` +
        `Movement: ${movement} cylinders`;

}


// ==========================================
// 16. AUTO PLAY
// ==========================================

function toggleAutoPlay() {

    if (!currentResult) return;

    if (autoPlayTimer !== null) {

        stopAutoPlay();

        return;

    }

    if (currentStep >= currentResult.path.length - 1) {

        currentStep = 0;

        drawGraph();

        updateStep();

    }

    document.getElementById("playButton").textContent =
        "⏸ Pause";


    autoPlayTimer = setInterval(() => {

        if (currentStep < currentResult.path.length - 1) {

            nextStep();

        } else {

            stopAutoPlay();

        }

    }, 800);

}


function stopAutoPlay() {

    if (autoPlayTimer !== null) {

        clearInterval(autoPlayTimer);

        autoPlayTimer = null;

    }

    document.getElementById("playButton").textContent =
        "▶ Auto Play";

}


// ==========================================
// 17. RESET ANIMATION
// ==========================================

function resetSteps() {

    if (!currentResult) return;

    stopAutoPlay();

    currentStep = 0;

    drawGraph();

    updateStep();

}


// ==========================================
// 18. PERFORMANCE COMPARISON
// ==========================================

function displayComparison() {

    let chart =
        document.getElementById("comparisonChart");

    let movements = {};


    Object.keys(results).forEach(algorithm => {

        movements[algorithm] =
            calculateMovement(results[algorithm]);

    });


    let maximum = Math.max(
        ...Object.values(movements),
        1
    );


    let best = Object.keys(movements).reduce((a, b) => {

        return movements[a] <= movements[b] ? a : b;

    });


    chart.innerHTML = "";


    Object.entries(movements).forEach(([name, value]) => {

        let percentage = (value / maximum) * 100;

        chart.innerHTML += `

            <div class="chart-row">

                <div class="chart-label">
                    ${name}
                </div>

                <div class="chart-track">

                    <div class="chart-bar"
                         style="width:${percentage}%">
                    </div>

                </div>

                <div class="chart-value">
                    ${value}
                </div>

            </div>

        `;

    });


    document.getElementById("comparisonSummary").innerHTML = `

        <p class="best-result">
            Best result for this input:
            ${best} (${movements[best]} cylinders)
        </p>

    `;

}


// ==========================================
// 19. INITIALIZE REQUEST QUEUE
// ==========================================

renderRequestQueue();
