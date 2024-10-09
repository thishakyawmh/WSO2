function incrementCount(id, targetValue, duration) {
    let currentValue = 0;
    const incrementStep = Math.ceil(targetValue / (duration / 10)); // Calculate step size

    const counter = setInterval(() => {
        currentValue += incrementStep;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(counter); // Stop the interval when the target is reached
            document.getElementById(id).innerText = currentValue.toLocaleString() + '+'; // Append "+" after reaching target
        } else {
            document.getElementById(id).innerText = currentValue.toLocaleString(); // Format the number
        }
    }, 10); // Interval time in milliseconds
}

// Run the function for both live user count and total plans
document.addEventListener("DOMContentLoaded", function() {
    incrementCount('live-user-count', 1500, 2000); // 1500 users in 2 seconds
    incrementCount('total-plans', 5000, 2500); // 5000 plans in 2.5 seconds
});


