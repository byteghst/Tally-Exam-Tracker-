// ---------- Shared ----------

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export interface Tag {
  id: ID;
  name: string;
  color: string;
}

// ---------- Exams ----------

export type ExamType = 'daily' | 'weekly';
export type ExamStatus = 'upcoming' | 'completed' | 'missed' | 'archived';

export interface Exam extends BaseEntity {
  name: string;
  type: ExamType;
  date: string; // ISO date (yyyy-mm-dd), local
  startTime?: string; // HH:mm
  endTime?: string;
  duration?: number; // minutes
  totalQuestions?: number;
  totalMarks?: number;
  positiveMarks: number;
  negativeMarks: number;
  correct?: number;
  wrong?: number;
  unanswered?: number;
  manualScoreOverride?: number;
  rank?: number;
  participants?: number;
  status: ExamStatus;
  notes?: string;
  tagIds: ID[];
  customFields?: Record<string, string | number | boolean>;
}

// ---------- Deadlines ----------

export type DeadlinePriority = 'low' | 'medium' | 'high';
export type DeadlineStatus = 'upcoming' | 'due_today' | 'completed' | 'overdue' | 'archived';

export interface Deadline extends BaseEntity {
  title: string;
  date: string;
  time?: string;
  description?: string;
  priority: DeadlinePriority;
  category?: string;
  reminderMinutesBefore?: number;
  status: DeadlineStatus;
  notes?: string;
  tagIds: ID[];
}

// ---------- Syllabus ----------

export type SyllabusNodeType = 'course' | 'chapter' | 'topic' | 'subtopic';
export type SyllabusProgressState =
  | 'not_started'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'revision_needed';

export interface SyllabusNode extends BaseEntity {
  parentId?: ID;
  type: SyllabusNodeType;
  title: string;
  progressState: SyllabusProgressState;
  progressPercent: number; // 0-100, manually or derived from children
  order: number;
  notes?: string;
  tagIds: ID[];
}

// ---------- Tasks ----------

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'skipped' | 'archived';
export type RecurrenceFreq = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  daysOfWeek?: number[]; // 0=Sun..6=Sat, used for 'weekly' and 'custom'
  interval?: number; // every N days/weeks, default 1
  endDate?: string;
}

export interface Task extends BaseEntity {
  name: string;
  date?: string;
  time?: string;
  estimatedDuration?: number; // minutes
  actualDuration?: number;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  tagIds: ID[];
  notes?: string;
  recurrence?: RecurrenceRule;
  seriesId?: ID; // links generated instances back to their recurring parent
  reminderMinutesBefore?: number;
}

// ---------- Activity log ----------

export type ActivityEntityType = 'exam' | 'deadline' | 'task' | 'syllabus';

export interface ActivityLogEntry {
  id: ID;
  entityType: ActivityEntityType;
  entityId: ID;
  message: string;
  timestamp: number;
}

// ---------- Settings ----------

export type ThemeMode = 'light' | 'dark' | 'system';
export type AnimationLevel = 'full' | 'reduced' | 'none';
export type DensityLevel = 'comfortable' | 'compact';

export interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface NotificationPrefs {
  exams: boolean;
  deadlines: boolean;
  tasks: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  glassIntensity: number; // 0-100
  blurIntensity: number; // 0-100
  radius: number; // px
  density: DensityLevel;
  animationLevel: AnimationLevel;
  reducedTransparency: boolean;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;
  scoringPrecision: number; // decimal places
  defaultExamType: ExamType;
  defaultTaskPriority: TaskPriority;
  notificationPrefs: NotificationPrefs;
  dashboardLayout: WidgetConfig[];
  streaksEnabled: boolean;
  onboardingCompleted: boolean;
}

// ---------- Scoring engine I/O ----------

export interface ScoreInput {
  correct?: number;
  wrong?: number;
  unanswered?: number;
  positiveMarks: number;
  negativeMarks: number;
  totalMarks?: number;
  manualScore?: number;
}

export interface ScoreResult {
  calculatedScore: number;
  finalScore: number;
  isManualOverride: boolean;
  positiveMarksEarned: number;
  negativeMarksLost: number;
  percentage: number | null; // null if totalMarks not provided
  accuracy: number | null; // correct / (correct+wrong)
  attemptRate: number | null; // (correct+wrong) / totalQuestions
}
