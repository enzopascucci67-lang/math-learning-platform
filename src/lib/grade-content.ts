import type { Course, Unit } from "./curriculum";
import { extendGradeSix } from "./grade-six-content";
import { extendAllGrades } from "./expanded-content";

// Short starting lessons, not a claim of complete grade-level curriculum coverage.
function unit(
  id: string,
  title: string,
  grades: number[],
  requires: string[],
  explanation: string,
  example: string,
  questions: [string, string, string][],
): Unit {
  return {
    id,
    title,
    grades,
    requires,
    x: grades[0] * 180,
    y: 440,
    lessons: [
      {
        id: `${id}-practice`,
        title,
        explanation,
        example,
        questions: questions.map(([prompt, answer, solution], index) => ({
          id: `${id}-q${index + 1}`,
          prompt,
          answer,
          hint: explanation,
          explanation: solution,
          kind: "numeric",
          difficulty: "easy",
        })),
      },
    ],
  };
}
const counting = unit(
  "counting",
  "Counting to ten",
  [0],
  [],
  "Count each object once. The last number tells you how many.",
  "● ● ● means 3 objects.",
  [
    ["How many stars? ★ ★ ★ ★", "4", "Count 1, 2, 3, 4. There are 4 stars."],
    ["What number comes just after 6?", "7", "Count forward: 5, 6, 7."],
  ],
);
const addTwenty = unit(
  "add-twenty",
  "Adding within twenty",
  [1],
  ["counting"],
  "Start with one number and count forward to add the other.",
  "5 + 3 = 8.",
  [
    ["What is 6 + 2?", "8", "Count two more after 6: 7, 8."],
    [
      "What is 9 + 5?",
      "14",
      "9 + 1 makes 10, then add the remaining 4 to get 14.",
    ],
  ],
);
const placeValue = unit(
  "place-value",
  "Tens and ones",
  [2],
  ["add-twenty"],
  "A two-digit number is made of tens and ones.",
  "42 has 4 tens and 2 ones.",
  [
    ["How many tens are in 73?", "7", "73 is 7 tens and 3 ones."],
    ["What number has 5 tens and 8 ones?", "58", "50 + 8 = 58."],
  ],
);
const division = unit(
  "division",
  "Sharing equally",
  [3],
  ["multiply"],
  "Division splits a total into equal groups.",
  "12 shared among 3 groups gives 4 in each group.",
  [
    [
      "18 apples are shared equally among 3 baskets. How many per basket?",
      "6",
      "18 ÷ 3 = 6 because 3 × 6 = 18.",
    ],
    ["What is 32 ÷ 4?", "8", "4 × 8 = 32, so 32 ÷ 4 = 8."],
  ],
);
const multiDigit = unit(
  "multi-digit",
  "Larger multiplication",
  [4],
  ["multiply"],
  "Split a number into tens and ones, multiply each part, then add.",
  "23 × 3 = 20 × 3 + 3 × 3 = 69.",
  [
    ["What is 24 × 3?", "72", "20 × 3 + 4 × 3 = 60 + 12 = 72."],
    ["What is 16 × 5?", "80", "10 × 5 + 6 × 5 = 50 + 30 = 80."],
  ],
);
const decimals = unit(
  "decimal-arithmetic",
  "Adding decimals",
  [5],
  [],
  "Line up the decimal points so the same place values are added.",
  "1.25 + 0.40 = 1.65.",
  [
    ["What is 2.35 + 1.4?", "3.75", "2.35 + 1.40 = 3.75."],
    ["What is 5.6 − 2.75?", "2.85", "5.60 − 2.75 = 2.85."],
  ],
);
const ratios = unit(
  "ratios",
  "Ratios and unit rates",
  [6],
  [],
  "A unit rate tells you the amount for one. Divide the total by the number of units.",
  "12 dollars for 3 books means 4 dollars per book.",
  [
    [
      "Four notebooks cost $12. What is the cost of one notebook?",
      "3",
      "12 ÷ 4 = 3 dollars per notebook.",
    ],
    [
      "A cyclist travels 30 miles in 2 hours. What is the average speed in miles per hour?",
      "15",
      "30 ÷ 2 = 15 miles per hour.",
    ],
  ],
);
const integers = unit(
  "integers",
  "Working with negative numbers",
  [6],
  ["ratios"],
  "Adding a negative moves left on a number line. Subtracting a negative is adding its opposite.",
  "3 + (−5) = −2.",
  [
    ["What is −4 + 9?", "5", "Moving 9 places right from −4 gives 5."],
    [
      "What is 6 − (−3)?",
      "9",
      "Subtracting −3 is the same as adding 3: 6 + 3 = 9.",
    ],
  ],
);
const proportions = unit(
  "proportions",
  "Proportional relationships",
  [7],
  ["ratios"],
  "In a proportional relationship, the ratio between two quantities stays constant.",
  "If y = 3x, then x = 4 gives y = 12.",
  [
    ["If y = 4x, what is y when x = 6?", "24", "4 × 6 = 24."],
    [
      "A recipe uses 2 cups of flour for 3 servings. How many cups for 9 servings?",
      "6",
      "9 is 3 times 3, so use 3 × 2 = 6 cups.",
    ],
  ],
);
const angles = unit(
  "triangle-angles",
  "Angles in triangles",
  [10],
  [],
  "The three interior angles of a triangle add to 180 degrees.",
  "If two angles are 50° and 60°, the third is 180 − 110 = 70°.",
  [
    [
      "A triangle has angles of 45° and 65°. Find the third angle in degrees.",
      "70",
      "180 − 45 − 65 = 70 degrees.",
    ],
    [
      "A right triangle has one acute angle of 32°. Find its other acute angle in degrees.",
      "58",
      "180 − 90 − 32 = 58 degrees.",
    ],
  ],
);
const area = unit(
  "triangle-area",
  "Area of triangles",
  [10],
  ["triangle-angles"],
  "The area of a triangle is one half of base times perpendicular height.",
  "Base 8 and height 5 gives area 8 × 5 ÷ 2 = 20.",
  [
    [
      "A triangle has base 12 cm and perpendicular height 7 cm. Find its area in square centimeters.",
      "42",
      "12 × 7 ÷ 2 = 42 square centimeters.",
    ],
    [
      "A triangle has area 30 square units and base 10 units. Find its perpendicular height.",
      "6",
      "30 = 10 × h ÷ 2, so h = 6.",
    ],
  ],
);
const exponents = unit(
  "exponent-rules",
  "Exponent rules",
  [11],
  [],
  "When multiplying powers with the same base, add the exponents.",
  "2³ × 2² = 2⁵ = 32.",
  [
    ["Evaluate 3² × 3³.", "243", "3² × 3³ = 3⁵ = 243."],
    ["Evaluate (2³)².", "64", "Multiply the exponents: 2⁶ = 64."],
  ],
);
const composition = unit(
  "function-composition",
  "Combining functions",
  [12],
  [],
  "For f(g(x)), evaluate g first and use that output as the input to f.",
  "If f(x) = 2x and g(x) = x + 3, then f(g(4)) = f(7) = 14.",
  [
    [
      "If f(x) = 3x + 1 and g(x) = x − 2, find f(g(5)).",
      "10",
      "g(5) = 3, then f(3) = 3 × 3 + 1 = 10.",
    ],
    [
      "For those same functions, find g(f(2)).",
      "5",
      "f(2) = 7, then g(7) = 7 − 2 = 5.",
    ],
  ],
);
const trig = unit(
  "right-triangle-trig",
  "Right-triangle trigonometry",
  [12],
  ["function-composition"],
  "For an acute angle in a right triangle, sine equals opposite divided by hypotenuse.",
  "If the opposite side is 3 and the hypotenuse is 5, sine is 3/5 = 0.6.",
  [
    [
      "The side opposite an angle is 5 and the hypotenuse is 13. Enter the sine as a fraction.",
      "5/13",
      "Sine is opposite divided by hypotenuse: 5/13.",
    ],
    [
      "An angle has sine 0.6 and the hypotenuse is 10. Find the opposite side.",
      "6",
      "Opposite = sine × hypotenuse = 0.6 × 10 = 6.",
    ],
  ],
);

export function personalizeCourses(base: Course[]): Course[] {
  return base.map((course) => {
    let units: Unit[] = course.units;
    if (course.id === "arithmetic")
      units = [
        counting,
        addTwenty,
        placeValue,
        ...course.units.map((item) => ({
          ...item,
          grades: item.id === "addition" ? [2] : [3],
        })),
        division,
        multiDigit,
        decimals,
      ];
    if (course.id === "fractions")
      units = course.units.map((item) => ({ ...item, grades: [4, 5] }));
    if (course.id === "algebra") {
      const grades: Record<string, number[]> = {
        foundations: [6, 7, 8, 9],
        expressions: [6, 7, 8, 9],
        equations: [7, 8, 9],
        inequalities: [7, 9],
        functions: [8, 9],
        systems: [8, 9],
        quadratics: [9, 11],
      };
      units = course.units.map((item) => ({
        ...item,
        grades: grades[item.id],
      }));
    }
    if (course.id === "pre-algebra") units = [ratios, integers, proportions];
    if (course.id === "geometry") units = [angles, area];
    if (course.id === "algebra-ii") units = [exponents];
    if (course.id === "precalculus") units = [composition, trig];
    units = extendGradeSix(course.id, units);
    units = extendAllGrades(course.id, units);
    if (!units.length) return course;
    // Layout new units separately in subject maps; grade maps use their own prerequisite layout.
    if (course.id !== "algebra")
      units = units.map((item, index) => ({
        ...item,
        x: (index % 3) * 260,
        y: Math.floor(index / 3) * 200,
      }));
    return {
      ...course,
      planned: false,
      grades: [
        ...new Set(units.flatMap((item) => item.grades || course.grades)),
      ].sort((a, b) => a - b),
      units,
      description: course.planned
        ? `Explore introductory ${course.title.toLowerCase()} lessons.`
        : course.description,
    };
  });
}
