import * as tf from '@tensorflow/tfjs';
import * as pdfjsLib from 'pdfjs-dist';
import nlp from 'compromise';
import { marked } from 'marked';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Load pre-trained model (simplified for demo)
let model;
async function loadModel() {
    // In a real implementation, you would load a properly trained model
    model = await tf.sequential({
        layers: [
            tf.layers.dense({ units: 64, activation: 'relu', inputShape: [100] }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
    });
}
loadModel();

// Initialize event listeners
document.getElementById('resumeInput').addEventListener('change', handleFileUpload);

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading state
    document.getElementById('loading').style.display = 'block';
    document.querySelector('.results-container').style.display = 'none';

    try {
        const text = await extractText(file);
        const analysis = await analyzeResume(text);
        displayResults(analysis);
    } catch (error) {
        console.error('Error processing resume:', error);
        alert('Error processing resume. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function extractText(file) {
    if (file.type === 'application/pdf') {
        return extractPdfText(file);
    } else {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    }
}

async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    
    return text;
}

async function analyzeResume(text) {
    const doc = nlp(text);
    
    // Extract key information
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
    
    // Extract skills (simplified)
    const commonSkills = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 
                         'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'machine learning'];
    const skills = commonSkills.filter(skill => 
        text.toLowerCase().includes(skill)
    );
    
    // Extract experience
    const sentences = doc.sentences().out('array');
    const experience = sentences.filter(s => 
        /worked|developed|led|managed|created|implemented/i.test(s)
    );
    
    // Calculate resume score
    const score = calculateScore({
        hasEmail: emails.length > 0,
        hasPhone: phones.length > 0,
        skillsCount: skills.length,
        experienceCount: experience.length
    });
    
    return {
        score,
        keyInfo: { emails, phones },
        skills,
        experience: experience.slice(0, 5),
        suggestions: generateSuggestions({ skills, experience })
    };
}

function calculateScore(metrics) {
    let score = 0;
    if (metrics.hasEmail) score += 20;
    if (metrics.hasPhone) score += 20;
    score += Math.min(metrics.skillsCount * 5, 30);
    score += Math.min(metrics.experienceCount * 5, 30);
    return Math.min(score, 100);
}

function generateSuggestions({ skills, experience }) {
    const suggestions = [];
    
    if (skills.length < 5) {
        suggestions.push('Consider adding more technical skills to your resume.');
    }
    
    if (experience.length < 3) {
        suggestions.push('Add more detailed descriptions of your work experience.');
    }
    
    if (!skills.includes('javascript') && !skills.includes('python')) {
        suggestions.push('Consider learning popular programming languages like JavaScript or Python.');
    }
    
    return suggestions;
}

function displayResults(analysis) {
    document.querySelector('.results-container').style.display = 'block';
    
    // Update score
    const scoreElement = document.getElementById('resumeScore');
    scoreElement.textContent = analysis.score;
    document.querySelector('.score-circle').style.background = 
        `conic-gradient(var(--primary-color) ${analysis.score}%, var(--border) 0%)`;
    
    // Display key information
    document.getElementById('keyInfo').innerHTML = `
        <p><strong>Email:</strong> ${analysis.keyInfo.emails.join(', ') || 'Not found'}</p>
        <p><strong>Phone:</strong> ${analysis.keyInfo.phones.join(', ') || 'Not found'}</p>
    `;
    
    // Display skills analysis
    document.getElementById('skillsAnalysis').innerHTML = `
        <p><strong>Detected Skills:</strong></p>
        <ul>
            ${analysis.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
    `;
    
    // Display experience insights
    document.getElementById('experienceInsights').innerHTML = `
        <p><strong>Key Experience Highlights:</strong></p>
        <ul>
            ${analysis.experience.map(exp => `<li>${exp}</li>`).join('')}
        </ul>
    `;
    
    // Display AI suggestions
    document.getElementById('aiSuggestions').innerHTML = `
        <ul>
            ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
        </ul>
    `;
}