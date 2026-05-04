const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const DEMO_SYLLABUS = {
  id: 'demo-syllabus',
  userId: 'guest',
  title: 'Engineering Physics',
  createdAt: new Date().toISOString(),
  content: {
    'Mechanics': [
      'Circular Motion',
      'Gravitation'
    ],
    'Thermodynamics': [
      'Laws of Thermo',
      'Heat Engines'
    ],
    'Optics': [
      'Wave Theory',
      'Interference'
    ]
  },
  examDate: formatDate(new Date(today.getTime() + 86400000 * 30)),
  hoursPerDay: 4,
  difficulty: 'medium'
};

export const DEMO_PLAN = {
  id: 'demo-plan',
  userId: 'guest',
  syllabusId: 'demo-syllabus',
  createdAt: new Date().toISOString(),
  days: [
    {
      day: 1,
      date: formatDate(new Date(today.getTime() - 86400000 * 1)),
      tasks: [
        { topic: 'Circular Motion', priority: 'high', duration: '90 min', completed: true, type: 'reading' },
        { topic: 'Laws of Thermo', priority: 'medium', duration: '60 min', completed: true, type: 'problem-solving' }
      ],
      isRevision: false
    },
    {
      day: 2,
      date: formatDate(today),
      tasks: [
        { topic: 'Gravitation', priority: 'high', duration: '120 min', completed: false, type: 'reading' },
        { topic: 'Wave Theory', priority: 'medium', duration: '90 min', completed: false, type: 'revision' }
      ],
      isRevision: false
    },
    {
      day: 3,
      date: formatDate(new Date(today.getTime() + 86400000 * 1)),
      tasks: [
        { topic: 'Interference', priority: 'high', duration: '120 min', completed: false, type: 'problem-solving' }
      ],
      isRevision: false
    }
  ]
};

export const DEMO_PROGRESS = [
  {
    taskId: '0-0-Circular Motion',
    dayIndex: 0,
    taskIndex: 0,
    topic: 'Circular Motion',
    date: formatDate(new Date(today.getTime() - 86400000 * 1)),
    planId: 'demo-plan',
    completedAt: new Date(today.getTime() - 86400000 * 1).toISOString()
  },
  {
    taskId: '0-1-Laws of Thermo',
    dayIndex: 0,
    taskIndex: 1,
    topic: 'Laws of Thermo',
    date: formatDate(new Date(today.getTime() - 86400000 * 1)),
    planId: 'demo-plan',
    completedAt: new Date(today.getTime() - 86400000 * 1).toISOString()
  }
];

export const DEMO_MEMORY = {
  weakTopics: [],
  completedTopics: ['Circular Motion', 'Laws of Thermo'],
  lastUpdated: new Date().toISOString()
};
