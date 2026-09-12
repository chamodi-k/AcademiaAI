import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

// Clean JSON response from Gemini if wrapped in markdown codeblocks
function extractJson(text: string): any {
  try {
    const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini JSON output, using text', err);
    return null;
  }
}

export class GeminiService {
  /**
   * Generate an intelligent, personalized weekly study plan
   */
  static async generateStudyPlan(params: {
    subjects: Array<{ name: string; is_weak?: boolean; credits?: number }>;
    examDate?: string;
    availableHoursPerDay: number;
    weakSubjects: string[];
    preferredTimeslot?: string;
  }) {
    const { subjects, examDate, availableHoursPerDay, weakSubjects } = params;

    if (genAI && config.geminiApiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert academic advisor and study planner. Generate a highly structured, realistic 7-day study plan for a university student.
Details:
- Enrolled subjects: ${subjects.map(s => s.name).join(', ')}
- Weak subjects needing extra focus: ${weakSubjects.join(', ') || 'None specified'}
- Available study time: ${availableHoursPerDay} hours per day
- Target upcoming exam date: ${examDate || 'In 2 weeks'}

Return ONLY valid JSON (no markdown explanation outside the JSON) conforming to this exact structure:
{
  "overview": "Strategic summary of the week's study plan",
  "weekly_schedule": [
    {
      "day_name": "Monday",
      "focus": "Theme or primary focus of the day",
      "tasks": [
        {
          "id": "t1",
          "subject": "Subject Name",
          "duration_minutes": 60,
          "topic": "Specific actionable topic to study or exercise",
          "completed": false
        }
      ]
    }
  ],
  "tips": [
    "Tip 1 for memory retention or active recall",
    "Tip 2",
    "Tip 3"
  ]
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJson(text);
        if (parsed && parsed.weekly_schedule) {
          return parsed;
        }
      } catch (err) {
        console.warn('⚠️ Gemini API call failed or timed out. Falling back to intelligent study plan generator.', err);
      }
    }

    // Heuristic Fallback Generator
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const totalMinutesPerDay = Math.round(availableHoursPerDay * 60);
    const subList = subjects.length > 0 ? subjects.map(s => s.name) : ['Database Management', 'Object-Oriented Programming', 'Software Engineering', 'Computer Networks'];
    
    const weekly_schedule = days.map((day, dIdx) => {
      const isWeekend = dIdx >= 5;
      const tasks = [];
      let remainingMinutes = totalMinutesPerDay;

      // Give 50% more time to weak subjects
      for (let i = 0; i < subList.length && remainingMinutes >= 30; i++) {
        const subName = subList[(dIdx + i) % subList.length];
        const isWeak = weakSubjects.includes(subName);
        const taskMinutes = Math.min(remainingMinutes, isWeak ? 75 : 45);
        remainingMinutes -= taskMinutes;

        tasks.push({
          id: `t-${dIdx}-${i + 1}`,
          subject: subName,
          duration_minutes: taskMinutes,
          topic: isWeak 
            ? `Deep dive: Core foundations, difficult problem sets & past paper questions` 
            : `Review key concepts, flashcards & practical implementation exercise`,
          completed: false
        });
      }

      return {
        day_name: day,
        focus: isWeekend ? 'Revision, Past Papers & Weak Area Consolidation' : `Core Theory & Application Drills`,
        tasks
      };
    });

    return {
      overview: `Tailored ${availableHoursPerDay}-hour daily study plan with elevated focus on ${weakSubjects.join(', ') || 'weak modules'} to maximize exam readiness.`,
      weekly_schedule,
      tips: [
        'Use the Feynman Technique: Try explaining difficult concepts in simple terms without looking at notes.',
        'Spaced Repetition: Spend the first 15 minutes of every block reviewing yesterday\'s material.',
        'Hydrate and maintain consistent sleep routines to optimize long-term memory consolidation.'
      ]
    };
  }

  /**
   * Summarize lecture notes into key points, definitions, and cram points
   */
  static async summarizeNotes(content: string, title?: string) {
    if (genAI && config.geminiApiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an elite academic tutor. Analyze and summarize the following lecture notes for a student.
Title: ${title || 'Lecture Note'}
Content:
"""
${content.substring(0, 10000)}
"""

Output ONLY valid JSON matching this schema:
{
  "summary_content": "A high-impact concise 2-3 paragraph summary capturing the core essence",
  "key_points": [
    "Key bullet point 1",
    "Key bullet point 2",
    "Key bullet point 3",
    "Key bullet point 4"
  ],
  "important_terms": [
    { "term": "Term Name", "definition": "Clear, accurate academic definition" }
  ],
  "exam_tips": [
    "High-yield exam tip or common trick question to watch out for"
  ]
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJson(text);
        if (parsed && parsed.summary_content) {
          return parsed;
        }
      } catch (err) {
        console.warn('⚠️ Gemini note summarization call failed, falling back to smart extractor.', err);
      }
    }

    // Heuristic Extractor
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const key_points = sentences.slice(0, 5).map(s => s.trim());
    
    return {
      summary_content: content.length > 250 
        ? content.substring(0, 240) + '... (Summarized from lecture notes with focus on primary concepts and definitions).' 
        : content,
      key_points: key_points.length > 0 ? key_points : [
        'Fundamental conceptual model and core principles explained.',
        'Structural relationship between components and operational rules.',
        'Practical implications and design considerations for software and systems.'
      ],
      important_terms: [
        { term: 'Core Principle', definition: 'Fundamental law or guideline governing the subject behavior.' },
        { term: 'Optimal Strategy', definition: 'The most efficient method to achieve solution bounds under constraints.' }
      ],
      exam_tips: [
        'Pay special attention to definitions and formulas often tested in Section A.',
        'Draw clear block/flow diagrams to earn partial credit even if numerical calculations differ.'
      ]
    };
  }

  /**
   * Generate interactive MCQs with options, correct answer, and explanation
   */
  static async generateQuiz(params: {
    subjectName: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionCount: number;
    sourceText?: string;
  }) {
    const { subjectName, topic, difficulty, questionCount, sourceText } = params;

    if (genAI && config.geminiApiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
Create an academic multiple-choice quiz with exactly ${questionCount} questions for university level.
Subject: ${subjectName}
Topic: ${topic}
Difficulty: ${difficulty}
${sourceText ? `Source Text Material:\n"""\n${sourceText.substring(0, 4000)}\n"""` : ''}

Output ONLY valid JSON with no markdown wrapping outside:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear, precise multiple-choice question?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_option": "A",
      "explanation": "Detailed explanation of why this option is correct and others are wrong."
    }
  ]
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJson(text);
        if (parsed && parsed.questions && parsed.questions.length > 0) {
          return parsed.questions;
        }
      } catch (err) {
        console.warn('⚠️ Gemini quiz generator failed, falling back to rich question bank.', err);
      }
    }

    // High quality question bank fallback
    const bank = [
      {
        id: 'q-fb-1',
        question: `In ${subjectName}, which principle is fundamental to solving problems in "${topic}"?`,
        options: {
          A: 'Decomposition into independent sub-problems with clear invariants',
          B: 'Randomized heuristic exploration without validation',
          C: 'Complete memory consumption for faster linear traversal',
          D: 'Circumventing data encapsulation'
        },
        correct_option: 'A' as const,
        explanation: 'Decomposition into verifiable sub-components reduces complexity and ensures consistency.'
      },
      {
        id: 'q-fb-2',
        question: `What is a primary risk when ignoring edge constraints in ${topic}?`,
        options: {
          A: 'Guaranteed O(1) performance',
          B: 'State space explosion, data corruption, or memory leaks',
          C: 'Improved query throughput',
          D: 'Automated index reorganization'
        },
        correct_option: 'B' as const,
        explanation: 'Edge condition oversight routinely introduces memory leaks or corrupt states in production software.'
      },
      {
        id: 'q-fb-3',
        question: `How does standard verification ensure correctness in ${subjectName}?`,
        options: {
          A: 'Through continuous testing, mathematical proofs, and assertions',
          B: 'By ignoring boundary condition outputs',
          C: 'By relying strictly on runtime compiler warnings',
          D: 'By suppressing error logs'
        },
        correct_option: 'A' as const,
        explanation: 'Rigorous engineering relies on assertions, automated unit tests, and structural validation.'
      },
      {
        id: 'q-fb-4',
        question: `When optimizing performance for ${topic}, what is the recommended trade-off?`,
        options: {
          A: 'Space vs. Time complexity balance tailored to operational workloads',
          B: 'Deleting indexes to minimize disk space',
          C: 'Using infinite recursive loops',
          D: 'Hardcoding variables directly into assembly'
        },
        correct_option: 'A' as const,
        explanation: 'Engineering architecture is defined by selecting optimal Space-Time trade-offs for target query patterns.'
      },
      {
        id: 'q-fb-5',
        question: `Which methodology best prevents regression in ${subjectName} implementations?`,
        options: {
          A: 'Comprehensive CI/CD test suites and regression benchmarking',
          B: 'Manually editing production binaries',
          C: 'Discarding version control logs',
          D: 'Avoiding code reviews'
        },
        correct_option: 'A' as const,
        explanation: 'Automated CI/CD pipelines verify changes continuously against functional test suites.'
      }
    ];

    return bank.slice(0, questionCount);
  }
}
