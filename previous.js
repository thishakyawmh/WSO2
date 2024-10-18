let plans;
const plansList = [];

window.addEventListener('load', function() {
    // Fetch all plans from the server
    axios.get('http://localhost:9090/plans/plans')
    .then((response) => {
        plans = response.data;
        console.log('All Plans:', plans);
        plans.forEach(plan => {
            planArr = JSON.parse(plan.plan);
            const plan_overview =  planArr[planArr.length-1];
            const obj = {
                name: plan_overview.planName,
                location: plan_overview.location,
                date: plan_overview.date,
                id: plan.id
            }
            plansList.push(obj);
        })
        populatePlans();
    })
    .catch((error) => {
        console.error('Failed to fetch plans', error);
    });
});

function displayPlans(plans) {
    const plansContainer = document.getElementById('plans-container');
    plansContainer.innerHTML = ''; // Clear any existing content

    plans.forEach(plan => {
        const planElement = document.createElement('div');
        planElement.className = 'plan';
        planElement.innerText = JSON.stringify(plan, null, 2);
        plansContainer.appendChild(planElement);
    });
}


// Function to dynamically populate table rows
function populatePlans() {
    const tbody = document.getElementById('previous-plan-tbody');

    plansList.forEach(plan => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${plan.name}</td>
            <td>${plan.location}</td>
            <td>${plan.date}</td>
            <td><a href="#" class="open-cell" id="${plan.id}" onclick="openPlan(this.id)">Open</a></td>
        `;

        tbody.appendChild(row);
    });
}

// Function to handle "Open" button click (modify to your needs)
function openPlan(id) {
    window.location.href = `output.html?id=${id}`;
}

// Populate the table on page load
