// src/lib/constants.js

export const DEFAULT_BLOCKS = [
  {
    id: "interview",
    type: "interview",
    icon: "book",
    label: "React Interview Practice",
    sub: "10 fresh questions",
    start: "07:00",
    end: "07:30",
    topics: ["React", "HTML", "CSS", "JavaScript", "Hooks", "Redux", "Git/GitHub"],
  },
  {
    id: "dsa",
    type: "reminder",
    icon: "target",
    label: "DSA Practice",
    sub: "Pick one problem",
    start: "10:00",
    end: "11:00",
    note: "Pick one problem and actually solve it — don't just read solutions.",
  },
  {
    id: "aiml",
    type: "reminder",
    icon: "book",
    label: "Learn AI/ML",
    sub: "CampusX YouTube",
    start: "13:00",
    end: "14:00",
    note: "Watch today's CampusX video and write 3 lines of notes.",
  },
  {
    id: "air",
    type: "reminder",
    icon: "sunrise",
    label: "Fresh Air Break",
    sub: "Go outside",
    start: "18:00",
    end: "18:20",
    note: "Phone down. Walk outside for at least 15 minutes.",
  },
  {
    id: "jobs",
    type: "jobsearch",
    icon: "briefcase",
    label: "Job Search",
    sub: "Remote, entry-level",
    start: "21:00",
    end: "21:30",
    criteria: "entry-level remote React frontend developer",
  },
];

export const QUOTES = [
  "Start before you feel ready.",
  "Motion beats motivation.",
  "Future you is watching.",
  "Small block. Just begin.",
  "Done is better than perfect.",
  "The block doesn't care how you feel.",
  "One hour of deep work beats ten of distraction.",
  "Ship something today.",
];

export const ICON_NAMES = ["book", "briefcase", "sunrise", "target"];
