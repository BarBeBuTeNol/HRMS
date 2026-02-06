const axios = require('axios');

async function checkApi() {
    try {
        const res = await axios.get("http://localhost:5000/api/leave-requests/types");
        console.log("API Response Status:", res.status);
        console.log("API Response Data:", res.data);
    } catch (e) {
        console.error("API Error:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

checkApi();
