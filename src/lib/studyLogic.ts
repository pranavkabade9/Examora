// Study Planning Logic (Local Rule-Based)

export interface Topic {
  name: string;
  subtopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Unit {
  name: string;
  topics: Topic[];
}

export interface SyllabusData {
  title: string;
  units: Unit[];
}

export interface StudyTask {
  topic: string;
  duration: string;
  type: 'study' | 'revision' | 'test';
  priority: 'high' | 'medium' | 'low';
}

export interface StudyDay {
  day: number;
  date: string;
  tasks: StudyTask[];
}

export function parseSyllabusLocally(text: string): SyllabusData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const title = lines[0] || 'My Syllabus';
  const units: Unit[] = [];
  let currentUnit: Unit | null = null;

  lines.forEach((line, index) => {
    if (index === 0) return;

    const isUnit = /^(unit|module|chapter|part|section)\s+\d+|[ivx]+\.|^[A-Z\s]{5,}/i.test(line);

    if (isUnit || units.length === 0) {
      currentUnit = { name: line, topics: [] };
      units.push(currentUnit);
    } else if (currentUnit) {
      const difficulty: 'easy' | 'medium' | 'hard' = 
        line.toLowerCase().includes('introduction') || line.toLowerCase().includes('basic') ? 'easy' :
        line.toLowerCase().includes('advanced') || line.toLowerCase().includes('analysis') ? 'hard' : 'medium';
      
      currentUnit.topics.push({
        name: line,
        subtopics: [],
        difficulty
      });
    }
  });

  return { title, units };
}

export function generateStudyPlanLocally(syllabus: SyllabusData, constraints: { examDate: string, hoursPerDay: number, difficulty: string }): StudyDay[] {
  const today = new Date();
  const exam = new Date(constraints.examDate);
  const timeDiff = exam.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1; // 1 day for final revision
  
  if (daysDiff <= 0) return [];

  const allTopics: Topic[] = syllabus.units.flatMap(u => u.topics);
  const totalTopics = allTopics.length;
  const topicsPerDay = Math.max(1, Math.ceil(totalTopics / daysDiff));

  const plan: StudyDay[] = [];
  let topicIndex = 0;

  for (let i = 1; i <= daysDiff; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const tasks: StudyTask[] = [];

    // Revision check
    if (i % 4 === 0) {
      tasks.push({
        topic: 'Spaced Repetition: Previous Units',
        duration: '1h',
        type: 'revision',
        priority: 'medium'
      });
    }

    // Assign topics
    for (let t = 0; t < topicsPerDay && topicIndex < totalTopics; t++) {
      const topic = allTopics[topicIndex++];
      tasks.push({
        topic: topic.name,
        duration: `${Math.floor(constraints.hoursPerDay / topicsPerDay)}h`,
        type: 'study',
        priority: topic.difficulty === 'hard' ? 'high' : topic.difficulty === 'medium' ? 'medium' : 'low'
      });
    }

    plan.push({
      day: i,
      date: dateStr,
      tasks
    });
  }

  // Final Mock Test
  const finalDate = new Date(exam);
  finalDate.setDate(exam.getDate() - 1);
  plan.push({
    day: daysDiff + 1,
    date: finalDate.toISOString().split('T')[0],
    tasks: [{
      topic: 'Full Syllabus Mock Test & Weak Areas',
      duration: `${constraints.hoursPerDay}h`,
      type: 'test',
      priority: 'high'
    }]
  });

  return plan;
}

export function getSmartSuggestions(data: { memory?: any, progress?: any[] }): any[] {
  const suggestions = [
    { type: 'focus', title: 'Deep Work', text: 'Harder topics are best tackled in the morning! ☀️', impact: 'high' },
    { type: 'time', title: 'Time Boxing', text: 'Use the 50/10 Pomodoro technique for better focus. ⏱️', impact: 'medium' }
  ];

  if (data.memory?.weakTopics?.length > 0) {
    suggestions.push({
      type: 'priority',
      title: 'Weak Areas',
      text: `Focus more on: ${data.memory.weakTopics[0]}. You've struggled here recently. 🎯`,
      impact: 'high'
    });
  }

  return suggestions;
}
