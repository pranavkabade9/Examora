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
  completed?: boolean;
}

export interface StudyDay {
  day: number;
  date: string;
  tasks: StudyTask[];
}

/**
 * Smart Syllabus Organizer
 * Purely logic driven parser for curriculum text.
 * No AI used.
 */
export function parseSyllabusLocally(text: string): SyllabusData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const title = lines[0] || 'My Syllabus';
  const units: Unit[] = [];
  let currentUnit: Unit | null = null;

  // Header detection patterns (Numerical markers or Specific Keywords)
  const unitPatterns = [/^(unit|module|section|part|block)\s+\d+/i, /^[ivx]+\.\s+/i, /^[A-Z\s]{8,}$/];

  lines.forEach((line, index) => {
    if (index === 0) return;

    const isUnitHeader = unitPatterns.some(p => p.test(line));

    if (isUnitHeader || units.length === 0) {
      currentUnit = { name: line, topics: [] };
      units.push(currentUnit);
    } else if (currentUnit) {
      // Logic-based difficulty tagging
      const difficulty: 'easy' | 'medium' | 'hard' = 
        /intro|basic|overview|fundamental|concept/i.test(line) ? 'easy' :
        /advanced|complex|analysis|design|system|architecture|synthesis/i.test(line) ? 'hard' : 'medium';
      
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
 * Distributes topics across available days with revision intervals.
 * Uses a priority-aware algorithm.
 */
export function generateStudyPlanLocally(syllabus: SyllabusData, constraints: { examDate: string, hoursPerDay: number, difficulty: string }): StudyDay[] {
  const today = new Date();
  const exam = new Date(constraints.examDate);
  const timeDiff = exam.getTime() - today.getTime();
  const totalAvailableDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1; // 1 day buffer for final review
  
  if (totalAvailableDays <= 0) return [];

  const allTopics: Topic[] = syllabus.units.flatMap(u => u.topics);
  
  // Priority Sort: Harder topics first to ensure maximum exposure
  const sortedTopics = [...allTopics].sort((a, b) => {
    const score = { hard: 3, medium: 2, easy: 1 };
    return score[b.difficulty] - score[a.difficulty];
  });

  const totalTopics = sortedTopics.length;
  const bufferRate = 0.25; // 25% of time reserved for revision/tests
  const studyDays = Math.max(1, Math.floor(totalAvailableDays * (1 - bufferRate)));
  const topicsPerDay = Math.max(1, Math.ceil(totalTopics / studyDays));

  const plan: StudyDay[] = [];
  let topicIndex = 0;
  let lastUnitAdded: string | null = null;

  for (let d = 1; d <= totalAvailableDays; d++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    const tasks: StudyTask[] = [];

    // 1. Logic-based Revision Insertion
    const isRevisionDay = d % 4 === 0;

    if (isRevisionDay) {
      tasks.push({
        topic: 'Spaced Repetition: Previous High-Difficulty Topics',
        duration: '2h',
        type: 'revision',
        priority: 'high'
      });
    }

    // 2. Weekly Consolidation
    if (d % 7 === 0) {
      tasks.push({
        topic: 'Weekly Study Review & Goal Alignment',
        duration: '1.5h',
        type: 'revision',
        priority: 'medium'
      });
    }

    // 3. Main Study Session (Skip on pure revision days if plan is sparse)
    const canAddStudyTopics = !isRevisionDay || tasks.length < 2;
    
    if (canAddStudyTopics && topicIndex < totalTopics) {
      for (let t = 0; t < topicsPerDay && topicIndex < totalTopics; t++) {
        const topic = sortedTopics[topicIndex++];
        
        // Unit-End Revision Flag logic
        if (lastUnitAdded && topic.unitName !== lastUnitAdded) {
          tasks.push({
            topic: `Quick Unit Review: ${lastUnitAdded}`,
            duration: '30m',
            type: 'revision',
            priority: 'low'
          });
        }
        lastUnitAdded = topic.unitName;

        tasks.push({
          topic: topic.name,
          unit: topic.unitName,
          duration: `${Math.max(1, Math.floor(constraints.hoursPerDay / topicsPerDay))}h`,
          type: 'study',
          priority: topic.difficulty === 'hard' ? 'high' : topic.difficulty === 'medium' ? 'medium' : 'low'
        });
      }
    }

    if (tasks.length > 0) {
      plan.push({ day: d, date: dateStr, tasks });
    }
  }

  // Final Polish: Ensure a Final Exam Prep Day
  const finalDay = new Date(exam);
  finalDay.setDate(exam.getDate() - 1);
  plan.push({
    day: totalAvailableDays + 1,
    date: finalDay.toISOString().split('T')[0],
    tasks: [{
      topic: 'Final Comprehensive Review & Full Mock Test',
      duration: `${constraints.hoursPerDay}h`,
      type: 'test',
      priority: 'high'
    }]
  });

  return plan;
}

/**
 * Rule-based Logic Suggestions
 */
export function getSmartSuggestions(data: { memory?: any, progress?: any[] }): any[] {
  const suggestions = [
    { type: 'focus', title: 'Deep Work Protocol', text: 'Tackle the most challenging topics during your peak energy hours.', impact: 'high' },
    { type: 'time', title: 'Session Optimization', text: 'Apply 50-minute blocks with 10-minute active breaks for maximum focus.', impact: 'medium' }
  ];

  if (data.memory?.weakTopics?.length > 0) {
    suggestions.push({
      type: 'priority',
      title: 'Targeted Retention',
      text: `Historical data shows subject "${data.memory.weakTopics[0]}" needs extra attention in your next session.`,
      impact: 'high'
    });
  }

  return suggestions;
}
