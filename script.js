// script.js
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];

    if (file) {
        // Simulate parsing (replace with actual parsing logic later)
        const extractedInfo = parseResume(file);
        displayExtractedData(extractedInfo);
        provideSuggestions(extractedInfo);
    }
});

// Simulated resume parsing function
function parseResume(file) {
    // Placeholder: Replace this with actual parsing logic
    return {
        name: "John Doe",
        email: "johndoe@example.com",
        skills: ["JavaScript", "HTML", "CSS", "React"],
        experience: ["Software Developer at XYZ Corp", "Intern at ABC Inc."]
    };
}

// Display extracted data
function displayExtractedData(info) {
    const dataDiv = document.getElementById('extractedData');
    dataDiv.innerHTML = `
        <h2>Extracted Data</h2>
        <p><strong>Name:</strong> ${info.name}</p>
        <p><strong>Email:</strong> ${info.email}</p>
        <p><strong>Skills:</strong> ${info.skills.join(', ')}</p>
        <p><strong>Experience:</strong> ${info.experience.join('<br>')}</p>
    `;
}

// Provide suggestions based on extracted data
function provideSuggestions(info) {
    const suggestionsDiv = document.getElementById('suggestions');
    let suggestions = "Consider adding the following keywords to improve your resume visibility:<br>";
    if (!info.skills.includes("Teamwork")) {
        suggestions += "- Teamwork<br>";
    }
    if (!info.skills.includes("Problem-Solving")) {
        suggestions += "- Problem-Solving<br>";
    }
    suggestionsDiv.innerHTML = `<h2>Suggestions</h2><p>${suggestions}</p>`;
}
