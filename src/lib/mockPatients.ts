import { PainPoint } from '@/types/pain';

export interface MockSession {
  id: string;
  createdAt: string;
  summaryText: string;
  painPoints: PainPoint[];
}

export interface MockPatient {
  id: string;
  name: string;
  email: string;
  sessions: MockSession[];
}

function makePoint(id: string, color: string, strokeCenters: [number, number, number][]): PainPoint {
  return {
    id,
    position: strokeCenters[0],
    radius: 0.1,
    intensity: 6,
    type: 'external',
    quality: 'aching',
    onset: 'recent',
    duration: 'intermittent',
    aggravatingFactors: [],
    relievingFactors: [],
    associatedSymptoms: [],
    bodyParts: ['Unknown'],
    color,
    paintRadius: 0.12,
    strokes: [strokeCenters],
    createdAt: new Date().toISOString(),
  } as PainPoint;
}

export const mockPatients: MockPatient[] = [
  {
    id: 'p1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    sessions: [
      {
        id: 's1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        summaryText: 'Left shoulder aching pain, worse with movement. Intensity 6/10.',
        painPoints: [
          makePoint('pp1', '#ef4444', [
            [0.2, 1.3, 0.4],
            [0.22, 1.28, 0.38],
            [0.24, 1.26, 0.36],
          ]),
        ],
      },
      {
        id: 's2',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        summaryText: 'Improved after rest, residual soreness.',
        painPoints: [
          makePoint('pp2', '#3b82f6', [
            [0.18, 1.25, 0.35],
            [0.2, 1.23, 0.33],
          ]),
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Brianna Lee',
    email: 'brianna.lee@example.com',
    sessions: [
      {
        id: 's3',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        summaryText: 'Lower back throbbing, worse after lifting. Intensity 7/10.',
        painPoints: [
          makePoint('pp3', '#22c55e', [
            [0, 0.6, -0.1],
            [0.05, 0.58, -0.12],
            [-0.05, 0.59, -0.11],
          ]),
        ],
      },
    ],
  },
  {
    id: 'p3',
    name: 'Carlos Martinez',
    email: 'carlos.martinez@example.com',
    sessions: [
      {
        id: 's4',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        summaryText: 'Right knee sharp pain after running. Intensity 5/10.',
        painPoints: [
          makePoint('pp4', '#f59e0b', [
            [0.3, 0.2, 0.3],
            [0.32, 0.18, 0.28],
          ]),
        ],
      },
      {
        id: 's5',
        createdAt: new Date().toISOString(),
        summaryText: 'Follow-up: improved with ice and rest.',
        painPoints: [
          makePoint('pp5', '#8b5cf6', [
            [0.28, 0.22, 0.31],
            [0.27, 0.21, 0.3],
          ]),
        ],
      },
    ],
  },
];
