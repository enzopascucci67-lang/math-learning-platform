import { personalizeCourses } from "./grade-content";
export type QuestionVisual =
  | { type: "objects"; count: number; color?: "blue" | "gold" }
  | { type: "array"; rows: number; columns: number }
  | { type: "fraction"; numerator: number; denominator: number };
export type Question = {
  visual?: QuestionVisual;
  id: string;
  prompt: string;
  answer: string;
  kind: "numeric" | "choice" | "expression";
  choices?: string[];
  hint: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};
export type Lesson = {
  id: string;
  title: string;
  explanation: string;
  example: string;
  questions: Question[];
};
export type Unit = {
  grades?: number[];
  id: string;
  title: string;
  x: number;
  y: number;
  requires: string[];
  lessons: Lesson[];
};
export type Course = {
  id: string;
  title: string;
  subject: string;
  grades: number[];
  description: string;
  units: Unit[];
  planned?: boolean;
};
const q = (
  id: string,
  prompt: string,
  answer: string,
  hint: string,
  explanation: string,
  kind: Question["kind"] = "numeric",
  choices?: string[],
  difficulty: Question["difficulty"] = "easy",
): Question => ({
  id,
  prompt,
  answer,
  hint,
  explanation,
  kind,
  choices,
  difficulty,
});
const lesson = (
  id: string,
  title: string,
  explanation: string,
  example: string,
  questions: Question[],
): Lesson => ({ id, title, explanation, example, questions });
const algebra: Unit[] = [
  {
    id: "foundations",
    title: "Foundations",
    x: 260,
    y: 0,
    requires: [],
    lessons: [
      lesson(
        "order",
        "Order of operations",
        "Evaluate parentheses, then powers, then multiplication and division, then addition and subtraction.",
        "3 + 2 × 4 = 3 + 8 = 11.",
        [
          q(
            "o1",
            "Evaluate 6 + 3 × 4.",
            "18",
            "Multiply first.",
            "3 × 4 = 12, then 6 + 12 = 18.",
          ),
          q(
            "o2",
            "Evaluate (6 + 3) × 4.",
            "36",
            "Start inside the parentheses.",
            "6 + 3 = 9, then 9 × 4 = 36.",
          ),
        ],
      ),
    ],
  },
  {
    id: "expressions",
    title: "Expressions",
    x: 80,
    y: 170,
    requires: ["foundations"],
    lessons: [
      lesson(
        "combine",
        "Combine like terms",
        "Terms with the same variable and exponent can be added by combining coefficients.",
        "3x + 2x = (3 + 2)x = 5x.",
        [
          q(
            "e1",
            "Simplify 4x + 3x.",
            "7x",
            "Add the coefficients.",
            "(4 + 3)x = 7x.",
            "expression",
          ),
          q(
            "e2",
            "Evaluate 2x + 5 when x = 3.",
            "11",
            "Replace x with 3.",
            "2 × 3 + 5 = 6 + 5 = 11.",
          ),
        ],
      ),
    ],
  },
  {
    id: "equations",
    title: "Linear equations",
    x: 440,
    y: 170,
    requires: ["foundations"],
    lessons: [
      lesson(
        "solve",
        "Solve linear equations",
        "Keep an equation balanced by doing the same operation on both sides.",
        "2x + 4 = 12 → 2x = 8 → x = 4.",
        [
          q(
            "l1",
            "Solve 3x + 5 = 20. Enter x.",
            "5",
            "Subtract 5, then divide by 3.",
            "3x = 15, so x = 5.",
          ),
          q(
            "l2",
            "Solve 4x − 8 = 16. Enter x.",
            "6",
            "Add 8 to both sides.",
            "4x = 24, so x = 6.",
          ),
        ],
      ),
    ],
  },
  {
    id: "inequalities",
    title: "Inequalities",
    x: 0,
    y: 350,
    requires: ["expressions", "equations"],
    lessons: [
      lesson(
        "inequality",
        "Compare solutions",
        "An inequality describes a range. Reverse the inequality when multiplying or dividing by a negative number.",
        "−2x < 6 → x > −3.",
        [
          q(
            "i1",
            "Solve 2x + 1 < 9.",
            "x < 4",
            "Subtract 1 and divide by 2.",
            "2x < 8 gives x < 4.",
            "choice",
            ["x < 4", "x > 4", "x < 5"],
          ),
          q(
            "i2",
            "Solve −3x > 12.",
            "x < -4",
            "Division by a negative reverses the sign.",
            "Divide both sides by −3 to get x < −4.",
            "choice",
            ["x > -4", "x < -4", "x < 4"],
          ),
        ],
      ),
    ],
  },
  {
    id: "functions",
    title: "Functions",
    x: 260,
    y: 350,
    requires: ["expressions", "equations"],
    lessons: [
      lesson(
        "function",
        "Inputs and outputs",
        "A function assigns exactly one output to each input. Substitute the input for x.",
        "For f(x) = 2x + 1, f(3) = 7.",
        [
          q(
            "f1",
            "If f(x) = 3x − 2, find f(4).",
            "10",
            "Substitute 4 for x.",
            "3 × 4 − 2 = 10.",
          ),
          q(
            "f2",
            "If g(x) = x² + 1, find g(−3).",
            "10",
            "Square −3 before adding 1.",
            "(−3)² + 1 = 9 + 1 = 10.",
          ),
        ],
      ),
    ],
  },
  {
    id: "systems",
    title: "Systems",
    x: 520,
    y: 350,
    requires: ["equations"],
    lessons: [
      lesson(
        "system",
        "Solve a system",
        "A solution satisfies both equations. Substitution replaces a variable with an equal expression.",
        "y = x + 1 and x + y = 5 → 2x + 1 = 5 → x = 2, y = 3.",
        [
          q(
            "s1",
            "If y = x + 2 and x + y = 10, find x.",
            "4",
            "Replace y with x + 2.",
            "x + x + 2 = 10 → 2x = 8 → x = 4.",
          ),
          q(
            "s2",
            "For that same system, find y.",
            "6",
            "Use x = 4 in y = x + 2.",
            "y = 4 + 2 = 6.",
          ),
        ],
      ),
    ],
  },
  {
    id: "quadratics",
    title: "Quadratics",
    x: 260,
    y: 530,
    requires: ["functions", "systems"],
    lessons: [
      lesson(
        "quadratic",
        "Quadratic roots",
        "A quadratic can have two real roots. If a product equals zero, at least one factor is zero.",
        "x² − 9 = (x − 3)(x + 3), so x = 3 or x = −3.",
        [
          q(
            "q1",
            "What are the roots of x² − 16 = 0?",
            "-4 and 4",
            "Which two numbers square to 16?",
            "x² = 16 gives x = −4 or x = 4.",
            "choice",
            ["-4 and 4", "4 only", "-8 and 8"],
            "medium",
          ),
          q(
            "q2",
            "What is the positive root of x² − 25 = 0?",
            "5",
            "Take the positive square root of 25.",
            "x² = 25, so the positive root is 5.",
          ),
        ],
      ),
    ],
  },
];
export const courses: Course[] = personalizeCourses([
  {
    id: "arithmetic",
    title: "Everyday arithmetic",
    subject: "Arithmetic",
    grades: [0, 1, 2, 3, 4],
    description:
      "Build confidence with numbers, one small discovery at a time.",
    units: [
      {
        id: "addition",
        title: "Addition",
        x: 80,
        y: 40,
        requires: [],
        lessons: [
          lesson(
            "addition",
            "Adding with confidence",
            "Addition combines quantities. You can split a number to make a friendly ten.",
            "8 + 5 = 8 + 2 + 3 = 13.",
            [
              q(
                "a1",
                "What is 7 + 6?",
                "13",
                "Make ten: 7 + 3 + 3.",
                "7 + 3 = 10; 10 + 3 = 13.",
              ),
              q(
                "a2",
                "What is 28 + 15?",
                "43",
                "Add tens, then ones.",
                "28 + 10 = 38; 38 + 5 = 43.",
              ),
            ],
          ),
        ],
      },
      {
        id: "multiply",
        title: "Multiplication",
        x: 350,
        y: 240,
        requires: ["addition"],
        lessons: [
          lesson(
            "multiply",
            "Equal groups",
            "Multiplication counts equal groups.",
            "4 groups of 3 make 4 × 3 = 12.",
            [
              q(
                "m1",
                "Five bags each have 4 apples. How many apples?",
                "20",
                "Add four five times.",
                "5 × 4 = 20 apples.",
              ),
              q("m2", "What is 6 × 7?", "42", "Use 5 × 7 + 7.", "35 + 7 = 42."),
            ],
          ),
        ],
      },
    ],
  },
  {
    id: "fractions",
    title: "Making sense of fractions",
    subject: "Arithmetic",
    grades: [3, 4, 5, 6],
    description: "See the whole picture, and all the parts that make it.",
    units: [
      {
        id: "parts",
        title: "Equal parts",
        x: 100,
        y: 40,
        requires: [],
        lessons: [
          lesson(
            "fractions",
            "Equivalent fractions",
            "Multiplying numerator and denominator by the same nonzero number keeps a fraction equal.",
            "1/2 = 2/4 = 3/6.",
            [
              q(
                "r1",
                "Write 1/2 as a decimal.",
                "0.5",
                "Divide 1 by 2.",
                "1 ÷ 2 = 0.5. A fraction such as 2/4 is also accepted.",
              ),
              q(
                "r2",
                "What is 1/4 + 2/4?",
                "0.75",
                "Add the numerators; keep the denominator.",
                "1/4 + 2/4 = 3/4 = 0.75.",
              ),
            ],
          ),
        ],
      },
    ],
  },
  {
    id: "algebra",
    title: "Algebra I",
    subject: "Algebra I",
    grades: [7, 8, 9, 10],
    description: "From your first variable to a world of possibilities.",
    units: algebra,
  },
  ...[
    "Pre-Algebra",
    "Geometry",
    "Algebra II",
    "Trigonometry",
    "Precalculus",
    "Calculus",
    "Statistics",
  ].map((subject, i) => ({
    id: subject.toLowerCase().replaceAll(" ", "-"),
    title: subject,
    subject,
    grades: [Math.min(12, 6 + i), Math.min(12, 7 + i)],
    description: "A new learning path is on the horizon.",
    units: [],
    planned: true,
  })),
]);
export const satDomains = [
  "Algebra",
  "Advanced Math",
  "Problem-Solving and Data Analysis",
  "Geometry and Trigonometry",
];
export const satLessons: Lesson[] = [
  lesson(
    "sat-algebra",
    "Algebra",
    "Translate a context into an equation and solve for the unknown.",
    "A fee of $5 plus $3 per visit is modeled by C = 5 + 3v.",
    [
      q(
        "sat1",
        "A club costs $12 plus $4 per visit. If the total is $40, how many visits?",
        "7",
        "Subtract the fixed fee first.",
        "40 − 12 = 28, then 28 ÷ 4 = 7.",
      ),
      q(
        "sat2",
        "If 5x − 7 = 3x + 11, find x.",
        "9",
        "Collect x terms on one side.",
        "2x = 18, so x = 9.",
        "numeric",
        undefined,
        "medium",
      ),
    ],
  ),
  lesson(
    "sat-advanced",
    "Advanced Math",
    "Factor a quadratic to find its roots.",
    "x² − 5x + 6 = (x − 2)(x − 3).",
    [
      q(
        "sat3",
        "Find the larger root of x² − 7x + 12 = 0.",
        "4",
        "Find two numbers with product 12 and sum 7.",
        "(x − 3)(x − 4) = 0. The larger root is 4.",
        "numeric",
        undefined,
        "hard",
      ),
    ],
  ),
  lesson(
    "sat-data",
    "Problem-Solving and Data Analysis",
    "A percentage increase multiplies the original quantity by 1 plus the rate.",
    "A 20% increase on 50 gives 50 × 1.2 = 60.",
    [
      q(
        "sat4",
        "A price rises from $80 to $100. What is the percent increase?",
        "25",
        "Divide the increase by the original price.",
        "(100 − 80) ÷ 80 × 100 = 25%.",
        "numeric",
        undefined,
        "medium",
      ),
    ],
  ),
  lesson(
    "sat-geometry",
    "Geometry and Trigonometry",
    "For a right triangle, a² + b² = c² where c is the hypotenuse.",
    "Legs of 3 and 4 give c = √25 = 5.",
    [
      q(
        "sat5",
        "A right triangle has legs 5 and 12. Find its hypotenuse.",
        "13",
        "Square each leg, then add.",
        "25 + 144 = 169; √169 = 13.",
        "numeric",
        undefined,
        "medium",
      ),
    ],
  ),
];
export const allLessons = [
  ...courses.flatMap((c) => c.units.flatMap((u) => u.lessons)),
  ...satLessons,
];
export const games = [
  {
    id: "equate",
    title: "Equate",
    description: "A new way to play with equations.",
  },
  {
    id: "math-connections",
    title: "Math Connections",
    description: "Find the mathematical ideas that belong together.",
  },
];
export type GameIntegration = {
  gameId: string;
  studentId: string;
  activityId: string;
  verifiedScore: number;
  rewardKey: string;
};
export type Outfit = { head?: string; body?: string; accessory?: string };
