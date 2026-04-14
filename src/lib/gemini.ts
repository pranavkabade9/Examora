import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const SYLLABUS_PARSER_PROMPT = `
You are an expert academic coordinator. Your task is to convert a syllabus (provided as text or extracted from a PDF) into a highly structured JSON format.
The output MUST be a JSON object with the following structure:
{
  "title": "Course Title",
  "units": [
    {
      "name": "Unit Name",
      "topics": [
        {
          "name": "Topic Name",
          "subtopics": ["Subtopic 1", "Subtopic 2"],
          "difficulty": "easy" | "medium" | "hard"
        }
      ]
    }
  ]
}
Ensure every topic has a difficulty level assigned based on general academic standards.
`;

export const STUDY_PLAN_PROMPT = `
You are Examora, a high-performance AI Study Coach. Your task is to generate an adaptive study plan based on a structured syllabus, an exam date, and daily study hours.
Constraints:
- Exam Date: {{examDate}}
- Daily Hours: {{hoursPerDay}}
- Difficulty Preference: {{difficulty}}

Requirements:
1. Distribute all topics from the syllabus across the available days.
2. Prioritize difficult topics early in the plan.
3. Include "Revision" sessions using spaced repetition (Day 1, 3, 7, 15).
4. Allocate specific time blocks for each topic.
5. Include a "Mock Test" or "Final Revision" 2 days before the exam.
6. The output MUST be a JSON array of daily tasks.

JSON Structure:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD",
    "tasks": [
      {
        "topic": "Topic Name",
        "duration": "2h",
        "type": "study" | "revision" | "test",
        "priority": "high" | "medium" | "low"
      }
    ]
  }
]
`;

import { UserSettings } from "../types";

function formatUserProfile(settings?: UserSettings) {
  if (!settings) return "No profile set.";
  const p = settings.aiProfile;
  return `
User Profile:
- Education Level: ${p.educationLevel}
- Branch/Major: ${p.branch}
- Year/Semester: ${p.yearSemester}
- Study Goal: ${p.studyGoal}
- Explanation Style: ${p.explanationStyle}
- Language Preference: ${p.languageStyle}
- Learning Style: ${p.learningStyle}
- Difficulty Preference: ${p.difficultyPreference}
`;
}

export async function parseSyllabus(text: string, settings?: UserSettings) {
  try {
    console.log("Gemini: Parsing syllabus text...");
    
    // Increase limit to 30,000 characters for more comprehensive syllabus analysis
    const trimmedText = text.length > 30000 ? text.substring(0, 30000) + "..." : text;
    
    const systemInstruction = `${SYLLABUS_PARSER_PROMPT}\n\n${formatUserProfile(settings)}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Syllabus Content:\n${trimmedText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });
    
    if (!response.text) {
      throw new Error("Gemini returned an empty response for syllabus parsing.");
    }
    
    const parsed = JSON.parse(response.text);
    
    // Basic validation of AI response structure
    if (!parsed.title || !Array.isArray(parsed.units)) {
      throw new Error("AI generated an invalid syllabus structure. Retrying...");
    }

    console.log("Gemini: Syllabus parsed successfully:", parsed.title);
    return parsed;
  } catch (error) {
    console.error("Gemini parseSyllabus failed:", error);
    throw new Error("Failed to analyze syllabus. Please ensure the PDF is readable or try pasting the text manually.");
  }
}

export async function generateStudyPlan(syllabus: any, constraints: { examDate: string, hoursPerDay: number, difficulty: string }, settings?: UserSettings) {
  try {
    console.log("Gemini: Generating study plan with constraints:", constraints);
    const prompt = STUDY_PLAN_PROMPT
      .replace("{{examDate}}", constraints.examDate)
      .replace("{{hoursPerDay}}", constraints.hoursPerDay.toString())
      .replace("{{difficulty}}", constraints.difficulty) + `\n\n${formatUserProfile(settings)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Syllabus: ${JSON.stringify(syllabus)}`,
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response for study plan generation.");
    }

    const plan = JSON.parse(response.text);
    console.log("Gemini: Study plan generated successfully, days:", plan.length);
    return plan;
  } catch (error) {
    console.error("Gemini generateStudyPlan failed:", error);
    throw new Error("Failed to create study plan. Please try again.");
  }
}

export async function askAI(question: string, context: { syllabus?: any, plan?: any, memory?: any, history?: any[], mode?: 'learn' | 'practice' | 'test' | 'revise', settings?: UserSettings }) {
  const systemInstruction = `
You are 'Examora AI Coach', a highly intelligent, memory-aware study mentor. 
Current Mode: ${context.mode || 'learn'}

${formatUserProfile(context.settings)}

Personality:
- Friendly, polite, and supportive 😊
- Use ${context.settings?.aiProfile.explanationStyle || 'simple'} explanations.
- Language: ${context.settings?.aiProfile.languageStyle === 'hinglish' ? 'Mix of English and Hindi (Hinglish)' : 'Pure English'}.
- Tone: Smart senior mentor, not robotic.

Context Awareness:
- Syllabus: ${JSON.stringify(context.syllabus || {})}
- Study Plan: ${JSON.stringify(context.plan || {})}
- User Memory: ${JSON.stringify(context.memory || {})}
- Conversation History: ${JSON.stringify(context.history || [])}

Instructions for Mode '${context.mode || 'learn'}':
- Learn: Focus on deep explanations, analogies, and examples.
- Practice: Generate specific questions and guide the user through solving them.
- Test: Simulate exam conditions, ask challenging questions, and grade responses.
- Revise: Focus specifically on weak topics identified in memory.

Response JSON Structure:
{
  "title": "Topic Title",
  "explanation": "Main response text with emojis and formatting",
  "examples": ["Example 1", "Example 2"],
  "keyPoints": ["Point 1", "Point 2"],
  "commonMistakes": ["Mistake 1"],
  "tips": "Study tip or motivational message",
  "followUpQuestion": "A question to check understanding",
  "suggestDiagram": boolean,
  "updatedWeakTopics": ["Topic 1"],
  "nextActions": [
    {"label": "Explain Simpler", "action": "simpler"},
    {"label": "Give Examples", "action": "examples"},
    {"label": "Start Quiz", "action": "quiz"}
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { explanation: response.text };
  }
}

export async function getCoachSuggestions(userData: { syllabus?: any, plan?: any, memory?: any, progress?: any[], settings?: UserSettings }) {
  const systemInstruction = `
You are the 'Intelligent Suggestion Engine' for Examora.
Analyze the user's data and provide 3-4 highly personalized, actionable study suggestions.

${formatUserProfile(userData.settings)}

Data:
- Syllabus: ${JSON.stringify(userData.syllabus || {})}
- Memory (Weak topics, etc.): ${JSON.stringify(userData.memory || {})}
- Progress History: ${JSON.stringify(userData.progress || [])}

Rules:
- Be proactive and strategic.
- Identify inefficiencies (e.g., spending too much time on easy topics).
- Suggest time management improvements.
- Prioritize revision for weak areas.
- Keep suggestions short, actionable, and friendly.

Return a JSON array of suggestions:
[
  {
    "type": "optimization" | "time" | "revision" | "focus" | "priority",
    "title": "Short Title",
    "text": "Actionable advice with emoji",
    "impact": "high" | "medium" | "low"
  }
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate current study optimizations.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function generateQuestions(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Topic: ${topic}`,
    config: {
      systemInstruction: "Generate 3 short (2 marks), 2 medium (5 marks), and 1 long (10 marks) exam questions for the given topic. Return as JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          short: { type: Type.ARRAY, items: { type: Type.STRING } },
          medium: { type: Type.ARRAY, items: { type: Type.STRING } },
          long: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
  });
  return JSON.parse(response.text || "{}");
}
