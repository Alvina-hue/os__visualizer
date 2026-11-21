
// ==========================================
// OS SCHEDULING VISUALIZER
// CPU SCHEDULING + LIVE READY QUEUE
// ==========================================

let processes = [
    { id: "P1", arrival: 0, burst: 5, priority: 1 },
    { id: "P2", arrival: 1, burst: 3, priority: 2 },
    { id: "P3", arrival: 2, burst: 4, priority: 3 },
    { id: "P4", arrival: 3, burst: 2, priority: 1 }
];

let cpuSegments = [];
let cpuMetrics = [];

let cpuCurrentStep = 0;
let cpuAutoPlayTimer = null;


// ==========================================
// 1. DISPLAY PROCESS TABLE
// ==========================================

function renderProcessTable() {

    const table = document.getElementById("processTableBody");

    table.innerHTML = "";

    processes.forEach((p, index) => {

        const row = document.createElement("tr");

        [p.id, p.arrival, p.burst, p.priority].forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-process";

        deleteButton.onclick = () => removeProcess(index);

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        table.appendChild(row);

    });

}


// ==========================================
// 2. ADD NEW PROCESS
// ==========================================

function addProcess() {

    const id = document.getElementById("processId").value.trim();

    const arrival = document.getElementById("arrivalTime").value.trim();

    const burst = document.getElementById("burstTime").value.trim();

    const priority = document.getElementById("priority").value.trim();

    if (
        !id ||
        !/^[a-zA-Z0-9_-]+$/.test(id) ||
        processes.some(p => p.id.toLowerCase() === id.toLowerCase()) ||
        arrival === "" ||
        burst === "" ||
        priority === "" ||
        !Number.isInteger(Number(arrival)) ||
        !Number.isInteger(Number(burst)) ||
        !Number.isInteger(Number(priority)) ||
        Number(arrival) < 0 ||
        Number(burst) <= 0 ||
        Number(priority) <= 0
    ) {

        document.getElementById("cpuError").textContent =
            "Enter a unique Process ID, arrival time >= 0, burst time > 0 and priority > 0.";

        return;

    }

    processes.push({

        id: id,

        arrival: Number(arrival),

        burst: Number(burst),

        priority: Number(priority)

    });

    document.getElementById("processId").value = "";

    document.getElementById("arrivalTime").value = "";

    document.getElementById("burstTime").value = "";

    document.getElementById("cpuError").textContent = "";

    renderProcessTable();

    resetCPUOutput();

}


// ==========================================
// 3. REMOVE PROCESS
// ==========================================

function removeProcess(index) {

    processes.splice(index, 1);

    renderProcessTable();

    resetCPUOutput();

}


// ==========================================
// 4. LOAD SAMPLE PROCESSES
// ==========================================

function loadSampleProcesses() {

    processes = [

        { id: "P1", arrival: 0, burst: 5, priority: 1 },

        { id: "P2", arrival: 1, burst: 3, priority: 2 },

        { id: "P3", arrival: 2, burst: 4, priority: 3 },

        { id: "P4", arrival: 3, burst: 2, priority: 1 }

    ];

    renderProcessTable();

    resetCPUOutput();

    document.getElementById("cpuError").textContent = "";

}


// ==========================================
// 5. CLEAR ALL PROCESSES
// ==========================================

function clearProcesses() {

    processes = [];

    renderProcessTable();

    resetCPUOutput();

}


// ==========================================
// 6. SHOW OR HIDE TIME QUANTUM
// ==========================================

function updateQuantumVisibility() {

    const algorithm =
        document.getElementById("cpuAlgorithm").value;

    const quantumGroup =
        document.getElementById("quantumGroup");

    quantumGroup.style.display =
        algorithm === "RR" ? "flex" : "none";

}


// ==========================================
// 7. ADD IDLE TIME SEGMENT
// ==========================================

function addIdleSegment(start, end, completed = []) {

    if (end <= start) return;

    cpuSegments.push({

        id: "IDLE",

        start: start,

        end: end,

        duration: end - start,

        idle: true,

        readyQueue: [],

        completed: [...completed]

    });

}


// ==========================================
// 8. FCFS SCHEDULING
// ==========================================

function fcfsScheduling() {

    cpuSegments = [];

    let sorted = [...processes].sort((a, b) => {

        return a.arrival - b.arrival ||
               a.id.localeCompare(b.id);

    });

    let time = 0;

    const completed = [];

    sorted.forEach((process, index) => {

        if (time < process.arrival) {

            addIdleSegment(time, process.arrival, completed);

            time = process.arrival;

        }

        // Processes that have arrived and are waiting
        const readyQueue = sorted
            .slice(index + 1)
            .filter(p => p.arrival <= time)
            .map(p => p.id);

        let start = time;

        let end = start + process.burst;

        cpuSegments.push({

            id: process.id,

            start: start,

            end: end,

            duration: process.burst,

            idle: false,

            readyQueue: readyQueue,

            completed: [...completed]

        });

        time = end;

        completed.push(process.id);

    });

}


// ==========================================
// 9. ROUND ROBIN SCHEDULING
// ==========================================

function roundRobinScheduling(quantum) {

    cpuSegments = [];

    let sorted = [...processes].sort((a, b) => {

        return a.arrival - b.arrival ||
               a.id.localeCompare(b.id);

    });

    let remaining = {};

    sorted.forEach(p => {

        remaining[p.id] = p.burst;

    });

    let queue = [];

    let completedList = [];

    let time = 0;

    let index = 0;

    let completed = 0;

    while (completed < sorted.length) {

        // Add newly arrived processes
        while (
            index < sorted.length &&
            sorted[index].arrival <= time
        ) {

            queue.push(sorted[index]);

            index++;

        }

        // CPU idle when no process is ready
        if (queue.length === 0) {

            let nextArrival = sorted[index].arrival;

            addIdleSegment(time, nextArrival, completedList);

            time = nextArrival;

            continue;

        }

        // Select first process in ready queue
        let current = queue.shift();

        let readyQueueAtStart = queue.map(p => p.id);

        let executionTime = Math.min(
            quantum,
            remaining[current.id]
        );

        let start = time;

        let end = time + executionTime;

        // Execute process for one time quantum
        cpuSegments.push({

            id: current.id,

            start: start,

            end: end,

            duration: executionTime,

            idle: false,

            readyQueue: [...readyQueueAtStart],

            completed: [...completedList],

            remainingAtStart: remaining[current.id]

        });

        time = end;

        remaining[current.id] -= executionTime;

        // Add processes that arrived during execution
        while (
            index < sorted.length &&
            sorted[index].arrival <= time
        ) {

            queue.push(sorted[index]);

            index++;

        }

        // Check whether process is completed
        if (remaining[current.id] > 0) {

            queue.push(current);

        } else {

            completed++;

            completedList.push(current.id);

        }

    }

}


// ==========================================
// 10. CALCULATE PROCESS METRICS
// ==========================================

function calculateCPUMetrics() {

    cpuMetrics = [];

    processes.forEach(process => {

        let completion = Math.max(
            ...cpuSegments
                .filter(segment => segment.id === process.id)
                .map(segment => segment.end)
        );

        let turnaround = completion - process.arrival;

        let waiting = turnaround - process.burst;

        cpuMetrics.push({

            id: process.id,

            arrival: process.arrival,

            burst: process.burst,

            completion: completion,

            turnaround: turnaround,

            waiting: waiting

        });

    });

    let totalWaiting = cpuMetrics.reduce(
        (sum, p) => sum + p.waiting, 0
    );

    let totalTurnaround = cpuMetrics.reduce(
        (sum, p) => sum + p.turnaround, 0
    );

    document.getElementById("avgWaiting").textContent =
        (totalWaiting / cpuMetrics.length).toFixed(2);

    document.getElementById("avgTurnaround").textContent =
        (totalTurnaround / cpuMetrics.length).toFixed(2);

}


// ==========================================
// 11. DISPLAY METRICS TABLE
// ==========================================

function displayCPUMetrics() {

    const table =
        document.getElementById("metricsTableBody");

    table.innerHTML = "";

    cpuMetrics.forEach(p => {

        let row = document.createElement("tr");

        let values = [

            p.id,

            p.arrival,

            p.burst,

            p.completion,

            p.turnaround,

            p.waiting

        ];

        values.forEach(value => {

            let cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}


// ==========================================
// 12. RUN CPU SCHEDULING
// ==========================================

function runCPUScheduling() {

    stopCPUPlay();

    document.getElementById("cpuError").textContent = "";

    if (processes.length === 0) {

        document.getElementById("cpuError").textContent =
            "Please add at least one process.";

        return;

    }

    let algorithm =
        document.getElementById("cpuAlgorithm").value;

    if (algorithm === "FCFS") {

        fcfsScheduling();

    } else {

        let quantum = Number(
            document.getElementById("timeQuantum").value
        );

        if (
            !Number.isInteger(quantum) ||
            quantum <= 0
        ) {

            document.getElementById("cpuError").textContent =
                "Time quantum must be a positive integer.";

            return;

        }

        roundRobinScheduling(quantum);

    }

    calculateCPUMetrics();

    displayCPUMetrics();

    cpuCurrentStep = 0;

    drawGanttChart();

    updateCPUStep();

    updateReadyQueue();

}


// ==========================================
// 13. DRAW GANTT CHART
// ==========================================

function drawGanttChart() {

    const chart =
        document.getElementById("ganttChart");

    const timeline =
        document.getElementById("ganttTimeline");

    chart.innerHTML = "";

    timeline.innerHTML = "";

    if (cpuSegments.length === 0) {

        chart.textContent = "No execution data.";

        return;

    }

    let visibleSegments = cpuSegments.slice(
        0,
        cpuCurrentStep + 1
    );

    let width = Math.max(55, 700 / cpuSegments.length);

    let maxDuration = Math.max(
        ...cpuSegments.map(s => s.duration)
    );

    visibleSegments.forEach((segment, index) => {

        let segmentWidth =
            width * segment.duration / maxDuration;

        let block = document.createElement("div");

        block.className = "gantt-segment";

        if (segment.idle) {
            block.classList.add("idle");
        }

        if (index < cpuCurrentStep) {
            block.classList.add("completed");
        }

        if (index === cpuCurrentStep) {
            block.classList.add("active");
        }

        block.style.width = `${segmentWidth}px`;

        let name = document.createElement("span");

        name.textContent = segment.id;

        let time = document.createElement("small");

        time.textContent =
            `${segment.start} - ${segment.end}`;

        block.appendChild(name);

        block.appendChild(time);

        chart.appendChild(block);

        // Timeline labels
        let label = document.createElement("div");

        label.className = "gantt-time";

        label.style.width = `${segmentWidth}px`;

        label.textContent = segment.start;

        timeline.appendChild(label);

        if (index === visibleSegments.length - 1) {

            let endLabel = document.createElement("div");

            endLabel.className = "gantt-time";

            endLabel.textContent = segment.end;

            endLabel.style.width = "25px";

            timeline.appendChild(endLabel);

        }

    });

}


// ==========================================
// 14. UPDATE CPU STEP INFORMATION
// ==========================================

function updateCPUStep() {

    if (cpuSegments.length === 0) return;

    let segment = cpuSegments[cpuCurrentStep];

    let action = segment.idle
        ? "CPU is idle"
        : `Executing: ${segment.id}`;

    document.getElementById("cpuStepInfo").textContent =

        `Step ${cpuCurrentStep + 1} of ${cpuSegments.length} | ` +
        `${action} | ` +
        `Time: ${segment.start} to ${segment.end}`;

}


// ==========================================
// 15. LIVE READY QUEUE DISPLAY
// ==========================================

function updateReadyQueue() {

    let segment = cpuSegments[cpuCurrentStep];

    if (!segment) {

        resetReadyQueueDisplay();

        return;

    }

    const running =
        document.getElementById("runningProcess");

    const ready =
        document.getElementById("readyQueueItems");

    const completed =
        document.getElementById("completedQueueItems");

    running.innerHTML = "";

    ready.innerHTML = "";

    completed.innerHTML = "";

    // CPU running process
    if (segment.idle) {

        running.innerHTML =
            '<span class="queue-empty">CPU is idle</span>';

    } else {

        running.appendChild(
            createProcessChip(segment.id, "running-chip")
        );

    }

    // Ready queue processes
    let readyIds = segment.readyQueue || [];

    if (readyIds.length === 0) {

        ready.innerHTML =
            '<span class="queue-empty">No waiting processes</span>';

    } else {

        readyIds.forEach((id, index) => {

            ready.appendChild(
                createProcessChip(id, "ready-chip", index + 1)
            );

        });

    }

    // Completed processes
    let completedIds = segment.completed || [];

    if (completedIds.length === 0) {

        completed.innerHTML =
            '<span class="queue-empty">No completed processes</span>';

    } else {

        completedIds.forEach(id => {

            completed.appendChild(
                createProcessChip(id, "completed-chip")
            );

        });

    }

    // Update queue count and time
    document.getElementById("readyCount").textContent =
        readyIds.length;

    document.getElementById("queueClock").textContent =
        `Time: ${segment.start} – ${segment.end}`;

    // Display explanation
    let explanation;

    if (segment.idle) {

        explanation =
            `At time ${segment.start}, no process has arrived. ` +
            `The CPU remains idle until the next arrival at time ${segment.end}.`;

    } else if (
        document.getElementById("cpuAlgorithm").value === "RR"
    ) {

        explanation =
            `${segment.id} gets the CPU from ${segment.start} to ${segment.end}. ` +
            `The ready queue shown is the waiting order at the start of this time slice.`;

    } else {

        explanation =
            `${segment.id} gets the CPU from ${segment.start} to ${segment.end}. ` +
            `FCFS runs this process until it finishes; the other arrived processes wait in order.`;

    }

    document.getElementById("readyQueueExplanation").textContent =
        explanation;

    // Animate the process chips
    document.querySelectorAll(".queue-chip").forEach(chip => {

        chip.classList.remove("queue-pop");

        void chip.offsetWidth;

        chip.classList.add("queue-pop");

    });

}


// ==========================================
// 16. CREATE PROCESS CHIP
// ==========================================

function createProcessChip(id, className, position = null) {

    const chip = document.createElement("span");

    chip.className = `queue-chip ${className}`;

    chip.textContent =
        position === null ? id : `${position}. ${id}`;

    return chip;

}


// ==========================================
// 17. RESET READY QUEUE DISPLAY
// ==========================================

function resetReadyQueueDisplay() {

    document.getElementById("runningProcess").innerHTML =
        '<span class="queue-empty">No process running</span>';

    document.getElementById("readyQueueItems").innerHTML =
        '<span class="queue-empty">Queue is empty</span>';

    document.getElementById("completedQueueItems").innerHTML =
        '<span class="queue-empty">No completed processes</span>';

    document.getElementById("readyCount").textContent = "0";

    document.getElementById("queueClock").textContent = "Time: -";

    document.getElementById("readyQueueExplanation").textContent =
        "Run scheduling, then use Next or Auto Play to see the queue change.";

}


// ==========================================
// 18. NEXT CPU STEP
// ==========================================

function nextCPUStep() {

    if (cpuCurrentStep < cpuSegments.length - 1) {

        cpuCurrentStep++;

        drawGanttChart();

        updateCPUStep();

        updateReadyQueue();

    } else {

        stopCPUPlay();

    }

}


// ==========================================
// 19. PREVIOUS CPU STEP
// ==========================================

function previousCPUStep() {

    if (cpuCurrentStep > 0) {

        cpuCurrentStep--;

        drawGanttChart();

        updateCPUStep();

        updateReadyQueue();

    }

}


// ==========================================
// 20. CPU AUTO PLAY
// ==========================================

function toggleCPUPlay() {

    if (cpuSegments.length === 0) return;

    if (cpuAutoPlayTimer !== null) {

        stopCPUPlay();

        return;

    }

    if (cpuCurrentStep >= cpuSegments.length - 1) {

        cpuCurrentStep = 0;

        drawGanttChart();

        updateCPUStep();

        updateReadyQueue();

    }

    document.getElementById("cpuPlayButton").textContent =
        "⏸ Pause";

    cpuAutoPlayTimer = setInterval(() => {

        if (cpuCurrentStep < cpuSegments.length - 1) {

            nextCPUStep();

        } else {

            stopCPUPlay();

        }

    }, 1200);

}


// ==========================================
// 21. STOP AUTO PLAY
// ==========================================

function stopCPUPlay() {

    if (cpuAutoPlayTimer !== null) {

        clearInterval(cpuAutoPlayTimer);

        cpuAutoPlayTimer = null;

    }

    const playButton =
        document.getElementById("cpuPlayButton");

    if (playButton) {

        playButton.textContent = "▶ Auto Play";

    }

}


// ==========================================
// 22. RESET CPU ANIMATION
// ==========================================

function resetCPUSteps() {

    if (cpuSegments.length === 0) return;

    stopCPUPlay();

    cpuCurrentStep = 0;

    drawGanttChart();

    updateCPUStep();

    updateReadyQueue();

}


// ==========================================
// 23. RESET OUTPUT WHEN INPUT CHANGES
// ==========================================

function resetCPUOutput() {

    stopCPUPlay();

    cpuSegments = [];

    cpuMetrics = [];

    cpuCurrentStep = 0;

    document.getElementById("ganttChart").textContent =
        "Run scheduling to view the Gantt chart.";

    document.getElementById("ganttTimeline").innerHTML = "";

    document.getElementById("cpuStepInfo").textContent =
        "Waiting for scheduling...";

    document.getElementById("metricsTableBody").innerHTML = `
        <tr>
            <td colspan="6">Run scheduling to view metrics.</td>
        </tr>
    `;

    document.getElementById("avgWaiting").textContent = "-";

    document.getElementById("avgTurnaround").textContent = "-";

    resetReadyQueueDisplay();

}


// ==========================================
// 24. INITIALIZE PAGE
// ==========================================

renderProcessTable();

updateQuantumVisibility();

resetReadyQueueDisplay();
