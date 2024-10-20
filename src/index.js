import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "APIKEY";

const genAI = new GoogleGenerativeAI(apiKey);

let FilteredPlan = [];
let planArr = [];

function fetchPlanData(planId) {
    return axios.get(`http://localhost:9090/plans/plans/${planId}`)
        .then((res) => {
            const plan = res.data;
            console.log(plan);
            planArr = JSON.parse(plan.plan);
            processPlanData(planArr, planId);
        })
        .catch((err) => {
            console.error('Failed to fetch plan details', err);
        });
}

function processPlanData(planArr, planId) {
    console.log(planArr);

    for (let i = 0; i < planArr.length; i++) {
        const item = planArr[i];
        const placeObj = {
            name: item.name,
            types: item.types
        };
        FilteredPlan.push(placeObj);
    }

    console.log(FilteredPlan);
    FilteredPlan = JSON.stringify(FilteredPlan);

    async function Gemrun() {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `I'm going to give you a JSON array containing several places that the user chose to go. One object contains the place name
        and place type. For example, let's say there are 3 places in that array: X, Y, and Z. X is a restaurant, Y is a shopping center, and Z is a
        tourist attraction. You need to provide a travel plan for the user. So the travel plan should look like this: 
        'First go to Z. Then go to X for lunch. Then go to Y for shopping.' You should take all the places and suggest a 
        good trip plan for the user. First, you should give a brief travel guide. Then you should
        give tips for the user under the title "Tips". For example, what are the appropriate dresses, famous places nearby, etc. Give those tips
        as numbered points as well. And if you have knowledge about those places, suggest more activities under the title 
        "Additional Activities" for the user. You have give all these responses a paragraph.Make it easy to read as a paragraph. You don't need to add a main title for the response.
        The travel guide should be less than 800 words. And here is the array containing travel places the user chose: ${FilteredPlan}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('Generated text:', text);

            const textString = String(text); 
            // Update the plan with the generated data
            await updatePlan(planId, textString);
        } catch (error) {
            console.error('Error generating content:', error);
        }
    }

    Gemrun();
}

async function updatePlan(planId, generatedData) {
    try {
        const updatedPlan = {
            PlanGuid: generatedData
        };

        const response = await axios.put(`http://localhost:9090/plans/plans/${planId}`, updatedPlan);
        console.log('Plan updated successfully:', response.data);
        window.location.href = `output.html?id=${planId}`;
    } catch (error) {
        console.error('Failed to update plan', error);
    }
}

window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');

    if (planId) {
        console.log('Plan ID:', planId);
        fetchPlanData(planId);
    } else {
        console.error('No plan ID found in URL');
    }
});
