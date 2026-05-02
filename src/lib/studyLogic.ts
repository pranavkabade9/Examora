// Study Planning Logic (Strictly Rule-Based)

export interface Topic {
  name: string;
  unitName: string;
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
  unit?: string;
}

export interface StudyDay {
  day: number;
  date: string;
  tasks: StudyTask[];
}

/**
 * Smart Syllabus Organizer
 * Purely logic driven parser for curriculum text
 */
export function parseSyllabusLocally(text: string): SyllabusData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const title = lines[0] || 'My Syllabus';
  const units: Unit[] = [];
  let currentUnit: Unit | null = null;

  // Header detection patterns
  const unitPatterns = [/^(unit|module|section|part|block)\s+\d+/i, /^[ivx]+\.\s+/i, /^[A-Z\s]{8,}$/];

  lines.forEach((line, index) => {
    if (index === 0) return;

    const isUnitHeader = unitPatterns.some(p => p.test(line));

    if (isUnitHeader || units.length === 0) {
      currentUnit = { name: line, topics: [] };
      units.push(currentUnit);
    } else if (currentUnit) {
      // Topic categorization based on keywords
      const difficulty: 'easy' | 'medium' | 'hard' = 
        /intro|basic|overview|fundamental|concept/i.test(line) ? 'easy' :
        /advanced|complex|analysis|design|system|architecture/i.test(line) ? 'hard' : 'medium';
      
      currentUnit.topics.push({
        name: line,
        unitName: currentUnit.name,
        difficulty
      });
    }
  });

  return { title, units };
}

/**
 * Auto Study Planner
 * Distributes topics across available days with revision intervals
 */
export function generateStudyPlanLocally(syllabus: SyllabusData, constraints: { examDate: string, hoursPerDay: number, difficulty: string }): StudyDay[] {
  const today = new Date();
  const exam = new Date(constraints.examDate);
  const timeDiff = exam.getTime() - today.getTime();
  const totalAvailableDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1; // 1 day buffer for final revision
  
  if (totalAvailableDays <= 0) return [];

  const allTopics: Topic[] = syllabus.units.flatMap(u => u.topics);
  const totalTopics = allTopics.length;
  
  // Calculate pace
  const topicsPerDay = Math.max(1, Math.ceil(totalTopics / (totalAvailableDays * 0.8))); // Reserve 20% for revision

  const plan: StudyDay[] = [];
  let topicIndex = 0;
  let lastUnitAdded: string | null = null;

  for (let d = 1; d <= totalAvailableDays; d++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    const tasks: StudyTask[] = [];

    // 1. Weekly Revision Logic (Every Sunday or every 7th day)
    if (d % 7 === 0) {
      tasks.push({
        topic: 'Weekly Consolidation: Previous Units',
        duration: '2h',
        type: 'revision',
        priority: 'high'
      });
    }

    // 2. Unit-End Revision Logic
    // If we finished a unit in the last day, or are about to start a new one
    if (topicIndex < totalTopics) {
      const nextTopic = allTopics[topicIndex];
      if (lastUnitAdded && nextTopic.unitName !== lastUnitAdded) {
        tasks.push({
          topic: `End of Unit Revision: ${lastUnitAdded}`,
          duration: '1h',
          type: 'revision',
          priority: 'medium'
        });
      }
      lastUnitAdded = nextTopic.unitName;
    }

    // 3. Daily Study Tasks
    const topicSpace = tasks.length > 0 ? topicsPerDay - 1 : topicsPerDay;
    for (let t = 0; t < topicSpace && topicIndex < totalTopics; t++) {
      const topic = allTopics[topicIndex++];
      tasks.push({
        topic: topic.name,
        unit: topic.unitName,
        duration: `${Math.max(1, Math.floor(constraints.hoursPerDay / topicsPerDay))}h`,
        type: 'study',
        priority: topic.difficulty === 'hard' ? 'high' : topic.difficulty === 'medium' ? 'medium' : 'low'
      });
    }

    if (tasks.length > 0) {
      plan.push({ day: d, date: dateStr, tasks });
    }
  }

  // Final Review before exam
  const finalPrepDate = new Date(exam);
  finalPrepDate.setDate(exam.getDate() - 1);
  plan.push({
    day: totalAvailableDays + 1,
    date: finalPrepDate.toISOString().split('T')[0],
    tasks: [{
      topic: 'Final Exam Preparation & Full Mock',
      duration: `${constraints.hoursPerDay}h`,
      type: 'test',
      priority: 'high'
    }]
  });

  return plan;
}

/**
 * Logic-based Insights
 */
export function getSmartSuggestions(data: { memory?: any, progress?: any[] }): any[] {
  const suggestions = [
    { type: 'focus', title: 'Deep Work Protocol', text: 'Tackle high-priority topics early when energy levels are peaked.', impact: 'high' },
    { type: 'time', title: 'Session Optimization', text: 'Apply 90-minute blocks with 15-minute breaks for optimal concentration.', impact: 'medium' }
  ];

  if (data.memory?.weakTopics?.length > 0) {
    suggestions.push({
      type: 'priority',
      title: 'Target Retention',
      text: `Historical data suggests more focus needed on: ${data.memory.weakTopics[0]}.`,
      impact: 'high'
    });
  }

  return suggestions;
}
