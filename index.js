let metricNodes = [
    { name: "Alpha Core", baseline: 45, currentVal: 45 },
    { name: "Beta Gateway", baseline: 80, currentVal: 80 },
    { name: "Gamma Stream", baseline: 12, currentVal: 12 }
]


let liveChart;

$(document).ready(function() {

    initChart();

    renderMatrix();

    setInterval(function() {
        let now = new Date()
        $("#live-clock").text(now.toLocaleTimeString())

        processSystemTicks();
    }, 1000)

    $("#metrics-form").on("submit", function(event) {
        event.preventDefault()

        let inputName = $("#node-name").val().trim();
        let inputVal = parseInt($("#node-name").val(), 10);
        let feedback = $("#error-feedback");

        if (inputName === "") {
            feedback.text("Validation Error: Node Name is required.").css("color", "#f43f5e")
            $("#node-name").focus()
        }

        if(isNaN(inputVal) || inputVal < 10 || inputVal > 100) {
            feedback.text("Validation Error: Capacity must be a number between 10 and 100.").css("color", "#f43f5e")
            $("#node-value").focus()
            return
        }

        feedback.text("Node validated and deployed successfully!").css("color", "#10b981")

        metricNodes.push({
            name: inputName,
            baseline: inputVal,
            currentVal: inputVal
        })

        $("#node-name").val("")
        $("#node-value").val("")
    
        renderMatrix();
        updateChartLibrary();
    })
})

function evaluateNodeSafety(val, base) {
    let threshold = base * 1.3;
    if (val >= threshold) {
        return "CRITICAL";
    } else if (val > base) {
        return "ELEVATED";
    } else {
        return "STABLE";
    }
}

function processSystemTicks() {
    for (let i = 0; i < metricNodes.length; i++) {
        let structuralVariance = Math.floor(Math.random() * 7) - 3
        metricNodes[i].currentVal += structuralVariance;

        if (metricNodes[i].currentVal < 10) metricNodes[i].currentVal = 10;

    }

    renderMatrix()
    updateChartLibrary()
}

function renderMatrix() {
    let container = $("#node-matrix");
    container.empty()

    for (let j = 0; j < metricNodes.length; j++) {
        let node = metricNodes[j]
        let stateRating = evaluateNodeSafety(node.currentVal, node.baseline);

        let alertClass = ""
        if (stateRating === "CRITICAL") {
            alertClass = "warning"
        }

        let nodeMarkup = `
            <div class="node-row ${alertClass}">
                <strong>${node.name}</strong>
                <span>Value: ${node.currentVal} (${stateRating})</span>
            </div>
        `;
        container.append(nodeMarkup)
    }
}

function initChart() {
    let ctx = document.getElementById("liveChart").getContext("2d");
    liveChart = new Chart(ctx, {
        type: 'bar',
        data:{
            labels: metricNodes.map(n => n.name),
            datasets: [{
                label: 'Node Volatility Levels',
                data: metricNodes.map(n => n.currentVal),
                backgroundColor: '#38bdf8',
                borderWidth: 0
            }]
        },

        option: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 150 }
            }
        }
    })
}

function updateChartLibrary() {
    if (liveChart) {
        liveChart.data.labels = metricNodes.map(n => n.name);
        liveChart.data.datasets[0].data = metricNodes.map(n => n.currentVal)

        liveChart.update('none')
    }
}