import type { Lesson, Unit } from "./curriculum";

type PracticeItem = [
  prompt: string,
  answer: string,
  hint: string,
  explanation: string,
];
function lesson(
  id: string,
  title: string,
  explanation: string,
  example: string,
  items: PracticeItem[],
): Lesson {
  return {
    id,
    title,
    explanation,
    example,
    questions: items.map(([prompt, answer, hint, explanation], index) => ({
      id: `${id}-q${index + 1}`,
      prompt,
      answer,
      hint,
      explanation,
      kind: "numeric",
      difficulty: index === 0 ? "easy" : "medium",
    })),
  };
}
function unit(
  id: string,
  title: string,
  lessons: Lesson[],
  requires: string[] = [],
): Unit {
  return { id, title, grades: [6], lessons, requires, x: 0, y: 0 };
}

const fractionGroups = lesson(
  "g6-fraction-groups",
  "How many fraction groups?",
  "Division can ask how many equal groups fit in an amount. When both fractions have the same denominator, count their equal-sized pieces.",
  "How many 1/4-cup scoops fill 3/4 cup? Three quarter-cup pieces fit: 3/4 ÷ 1/4 = 3.",
  [
    [
      "How many 1/8-meter pieces fit in 5/8 meter?",
      "5",
      "Count eighth-sized pieces. Each piece uses one eighth.",
      "5/8 is five eighths, so five 1/8-meter pieces fit.",
    ],
    [
      "How many 2/5-cup servings fit in 4/5 cup?",
      "2",
      "The total is four fifths. Each serving uses two fifths.",
      "4/5 ÷ 2/5 = 4 ÷ 2 = 2 servings.",
    ],
    [
      "How many 1/3-meter pieces can you cut from 2 meters?",
      "6",
      "Rewrite 2 meters as thirds, then count the pieces.",
      "2 = 6/3. Six 1/3-meter pieces fit in 2 meters.",
    ],
  ],
);
const fractionDivide = lesson(
  "g6-divide-fractions",
  "Dividing fractions",
  "To divide by a nonzero fraction, multiply by its reciprocal. The reciprocal swaps the numerator and denominator. Your answer can be a fraction or a decimal.",
  "3/4 ÷ 2/3 = 3/4 × 3/2 = 9/8. This is a little more than one group, which makes sense because 3/4 is a little larger than 2/3.",
  [
    [
      "Calculate 1/2 ÷ 1/4.",
      "2",
      "Multiply 1/2 by 4/1, the reciprocal of 1/4.",
      "1/2 × 4/1 = 4/2 = 2.",
    ],
    [
      "Calculate 2/3 ÷ 4/5. Enter a fraction or decimal.",
      "5/6",
      "Keep 2/3 and multiply by 5/4. Then simplify.",
      "2/3 × 5/4 = 10/12 = 5/6.",
    ],
    [
      "A ribbon is 3/4 meter long. Each bow needs 1/8 meter. How many bows can you make?",
      "6",
      "Ask how many eighths fit in three quarters.",
      "3/4 ÷ 1/8 = 3/4 × 8 = 24/4 = 6 bows.",
    ],
  ],
);
const decimalDivide = lesson(
  "g6-divide-decimals",
  "Dividing decimals",
  "Multiply both numbers in a division by the same power of ten to make the divisor a whole number. The quotient stays the same.",
  "4.8 ÷ 0.6 = 48 ÷ 6 = 8. Multiplying both numbers by 10 changes the size of each unit, but not how many groups fit.",
  [
    [
      "Calculate 3.6 ÷ 0.9.",
      "4",
      "Multiply both numbers by 10, then divide 36 by 9.",
      "3.6 ÷ 0.9 = 36 ÷ 9 = 4.",
    ],
    [
      "Calculate 5.25 ÷ 0.5.",
      "10.5",
      "Multiply both numbers by 10: 52.5 ÷ 5.",
      "52.5 ÷ 5 = 10.5. Check: 10.5 × 0.5 = 5.25.",
    ],
    [
      "A 2.4-liter bottle fills cups holding 0.15 liter each. How many cups can it fill?",
      "16",
      "Multiply both amounts by 100 so the divisor becomes 15.",
      "2.4 ÷ 0.15 = 240 ÷ 15 = 16 cups.",
    ],
  ],
);
const equivalentRatios = lesson(
  "g6-equivalent-ratios",
  "Building equivalent ratios",
  "Equivalent ratios describe the same relationship. Multiply or divide both quantities by the same nonzero number.",
  "A mix has 2 cups of juice for 3 cups of water. Doubling both gives 4 cups of juice for 6 cups of water: 2:3 = 4:6.",
  [
    [
      "A recipe uses 2 cups of oats for 3 cups of milk. How many cups of milk go with 6 cups of oats?",
      "9",
      "The oats increased from 2 to 6. Use that same multiplier for the milk.",
      "6 ÷ 2 = 3, so multiply the milk by 3: 3 × 3 = 9 cups.",
    ],
    [
      "The ratio of blue beads to red beads is 3:5. If there are 20 red beads, how many blue beads are there?",
      "12",
      "Find how many times 5 fits into 20, then scale the 3 blue beads.",
      "20 ÷ 5 = 4, so there are 3 × 4 = 12 blue beads.",
    ],
    [
      "Four notebooks cost $6 in total. At the same price per notebook, how many dollars do 10 notebooks cost?",
      "15",
      "Find the price of one notebook, then multiply by 10.",
      "$6 ÷ 4 = $1.50 each. Ten cost 10 × $1.50 = $15.",
    ],
  ],
);
const percentages = lesson(
  "g6-percent-amounts",
  "Finding a percent of an amount",
  "Percent means out of 100. To find a percent of an amount, write the percent as a fraction over 100 or a decimal, then multiply.",
  "25% of 60 = 25/100 × 60 = 15. Since 25% is one quarter, you can also divide 60 by 4.",
  [
    [
      "What is 10% of 80?",
      "8",
      "10% is one tenth. Divide 80 by 10.",
      "10/100 × 80 = 8.",
    ],
    [
      "What is 35% of 60?",
      "21",
      "Write 35% as 0.35 and multiply by 60.",
      "0.35 × 60 = 21. You can also add 30% of 60 (18) and 5% of 60 (3).",
    ],
    [
      "A class has 24 students. 75% brought a book. How many students brought a book?",
      "18",
      "75% is three quarters. Find one quarter of 24, then multiply by 3.",
      "24 ÷ 4 = 6, and 6 × 3 = 18 students.",
    ],
  ],
);
const evaluate = lesson(
  "g6-evaluate-expressions",
  "Putting numbers into expressions",
  "A variable stands for a number. Replace the variable with its value, then follow the order of operations. A number next to a variable means multiplication.",
  "When n = 4, the expression 3n + 2 means 3 × 4 + 2 = 14. Multiply before adding.",
  [
    [
      "Evaluate 5n + 1 when n = 3.",
      "16",
      "Replace n with 3. Multiply 5 × 3 before adding 1.",
      "5 × 3 + 1 = 15 + 1 = 16.",
    ],
    [
      "Evaluate 2(a + 4) when a = 5.",
      "18",
      "Replace a with 5. Work inside the parentheses first.",
      "2 × (5 + 4) = 2 × 9 = 18.",
    ],
    [
      "Evaluate x² + 3 when x = 4.",
      "19",
      "The exponent means 4 × 4, not 4 × 2.",
      "4² + 3 = 16 + 3 = 19.",
    ],
  ],
);
const volume = lesson(
  "g6-box-volume",
  "Volume of a rectangular prism",
  "Volume measures the space inside a solid. A rectangular prism has volume length × width × height. Use cubic units, such as cubic centimeters.",
  "A box 4 cm long, 3 cm wide and 2 cm high holds 4 × 3 × 2 = 24 cubic centimeters. Its 12-square-centimeter base has two layers.",
  [
    [
      "A rectangular box is 5 cm long, 2 cm wide and 3 cm high. What is its volume in cubic centimeters?",
      "30",
      "Find the base area, then multiply by the height.",
      "5 × 2 = 10 square centimeters per layer. 10 × 3 = 30 cubic centimeters.",
    ],
    [
      "A rectangular prism is 1.5 m long, 2 m wide and 4 m high. What is its volume in cubic meters?",
      "12",
      "Decimal side lengths use the same rule: multiply all three dimensions.",
      "1.5 × 2 × 4 = 3 × 4 = 12 cubic meters.",
    ],
    [
      "A rectangular box has volume 48 cubic centimeters, length 4 cm and width 3 cm. What is its height in centimeters?",
      "4",
      "The base area is 4 × 3. Divide the volume by that area.",
      "48 ÷ (4 × 3) = 48 ÷ 12 = 4 centimeters.",
    ],
  ],
);
const meanMedian = lesson(
  "g6-mean-median",
  "Mean and median",
  "The mean is the sum of the values divided by how many values there are. The median is the middle value after sorting. With an even number of values, average the two middle values.",
  "For 2, 3, 7, the mean is (2 + 3 + 7) ÷ 3 = 4, and the median is 3. Mean and median can be different.",
  [
    [
      "Find the mean of 4, 6 and 8.",
      "6",
      "Add the three values and divide by 3.",
      "(4 + 6 + 8) ÷ 3 = 18 ÷ 3 = 6.",
    ],
    [
      "Find the median of 9, 2, 7, 4 and 3.",
      "4",
      "Sort from smallest to largest, then find the middle value.",
      "The sorted values are 2, 3, 4, 7, 9. The middle value is 4.",
    ],
    [
      "Find the median of 2, 5, 8 and 11.",
      "6.5",
      "There are two middle values, 5 and 8. Find their mean.",
      "(5 + 8) ÷ 2 = 13 ÷ 2 = 6.5.",
    ],
  ],
);

export const gradeSixLessons = [
  fractionGroups,
  fractionDivide,
  decimalDivide,
  equivalentRatios,
  percentages,
  evaluate,
  volume,
  meanMedian,
];
export function extendGradeSix(courseId: string, units: Unit[]): Unit[] {
  if (courseId === "fractions")
    return [
      ...units,
      unit("g6-fraction-division", "Fraction division", [
        fractionGroups,
        fractionDivide,
      ]),
    ];
  if (courseId === "algebra")
    return [
      ...units,
      {
        ...unit(
          "g6-substitution",
          "Using variables",
          [evaluate],
          ["expressions"],
        ),
        x: 0,
        y: 540,
      },
    ];
  if (courseId === "pre-algebra")
    return [
      ...units.map((entry) =>
        entry.id === "ratios"
          ? { ...entry, lessons: [...entry.lessons, equivalentRatios] }
          : entry,
      ),
      unit("g6-decimal-division", "Decimal division", [decimalDivide]),
      unit("g6-percentages", "Percentages", [percentages], ["ratios"]),
    ];
  if (courseId === "geometry")
    return [unit("g6-volume", "Space inside a box", [volume]), ...units];
  if (courseId === "statistics")
    return [
      unit("g6-data-centers", "Understanding data", [meanMedian]),
      ...units,
    ];
  return units;
}
