import type { Lesson, QuestionVisual, Unit } from "./curriculum";
type Item = [string, string, string, string, QuestionVisual?];
type Entry = { course: string; grade: number; lesson: Lesson };
const entries: Entry[] = [];
function add(
  course: string,
  grade: number,
  id: string,
  title: string,
  explanation: string,
  example: string,
  items: Item[],
) {
  const lesson: Lesson = {
    id: `g${grade}-${id}`,
    title,
    explanation,
    example,
    questions: items.map(
      ([prompt, answer, hint, explanation, visual], index) => ({
        id: `g${grade}-${id}-q${index + 1}`,
        prompt,
        answer,
        hint,
        explanation,
        visual,
        kind: "numeric",
        difficulty: index === 0 ? "easy" : "medium",
      }),
    ),
  };
  entries.push({ course, grade, lesson });
}
add(
  "arithmetic",
  0,
  "count-stars",
  "Count the stars",
  "Touch each star once as you count. The last number tells you how many.",
  "Count slowly: ★ ★ ★. One, two, three. There are 3 stars.",
  [
    [
      "How many stars do you see?",
      "3",
      "Point to each star once.",
      "Count 1, 2, 3. There are 3 stars.",
      { type: "objects", count: 3 },
    ],
    [
      "How many stars are in this group?",
      "5",
      "Start at the left. Count every star once.",
      "Count 1, 2, 3, 4, 5. There are 5 stars.",
      { type: "objects", count: 5 },
    ],
    [
      "Count all the stars. How many are there?",
      "8",
      "Count the top row, then keep counting on the next row.",
      "There are 5 on the top row and 3 below: 8 stars.",
      { type: "objects", count: 8 },
    ],
  ],
);
add(
  "arithmetic",
  0,
  "one-more",
  "One more, one less",
  "One more is the next counting number. One less is the number just before.",
  "One more than 3 is 4. One less than 3 is 2.",
  [
    [
      "What is one more than 2?",
      "3",
      "Count forward one step from 2.",
      "2, then 3. One more than 2 is 3.",
    ],
    [
      "What is one less than 5?",
      "4",
      "Count back one step from 5.",
      "5, then 4. One less than 5 is 4.",
    ],
    [
      "You have 6 blocks and get 1 more. How many blocks now?",
      "7",
      "Start at 6 and count one more.",
      "6 + 1 = 7 blocks.",
    ],
  ],
);
add(
  "arithmetic",
  1,
  "make-ten",
  "Make ten",
  "Number partners can join to make 10. Count on to find the missing partner.",
  "7 and 3 make 10 because 7 + 3 = 10.",
  [
    [
      "4 + what number = 10?",
      "6",
      "Count from 4 up to 10.",
      "4 + 6 = 10. The missing partner is 6.",
    ],
    [
      "8 + what number = 10?",
      "2",
      "How many more after 8 reach 10?",
      "9, 10: two more. 8 + 2 = 10.",
    ],
    [
      "There are 3 red beads and some blue beads. There are 10 beads altogether. How many are blue?",
      "7",
      "Find the partner that joins 3 to make 10.",
      "10 − 3 = 7 blue beads.",
    ],
  ],
);
add(
  "arithmetic",
  1,
  "take-away",
  "Taking away within twenty",
  "Subtraction tells how many are left. Start with the total and take away the smaller amount.",
  "12 − 3 = 9. Count back 3 steps: 11, 10, 9.",
  [
    [
      "What is 9 − 4?",
      "5",
      "Start at 9 and count back 4 steps.",
      "8, 7, 6, 5. So 9 − 4 = 5.",
    ],
    ["What is 15 − 5?", "10", "Take 5 ones away from 15.", "15 − 5 = 10."],
    [
      "A basket holds 14 apples. You give away 6. How many are left?",
      "8",
      "Take away 4 to reach 10, then take away 2 more.",
      "14 − 4 = 10, and 10 − 2 = 8 apples.",
    ],
  ],
);
add(
  "arithmetic",
  2,
  "skip-count",
  "Skip-counting patterns",
  "Skip-counting adds the same amount each time. Look at the gap between neighboring numbers.",
  "Counting by fives: 5, 10, 15, 20. Each jump adds 5.",
  [
    [
      "What comes next: 2, 4, 6, 8, __?",
      "10",
      "Each jump adds 2.",
      "8 + 2 = 10.",
    ],
    [
      "What comes next: 5, 10, 15, __?",
      "20",
      "Keep counting by fives.",
      "15 + 5 = 20.",
    ],
    [
      "What comes next: 20, 30, 40, __?",
      "50",
      "Each jump adds one ten.",
      "40 + 10 = 50.",
    ],
  ],
);
add(
  "arithmetic",
  2,
  "two-digit-sums",
  "Adding tens and ones",
  "Add tens to tens and ones to ones. Ten ones can regroup into one ten.",
  "24 + 13 = (20 + 10) + (4 + 3) = 30 + 7 = 37.",
  [
    ["What is 32 + 25?", "57", "Add 30 + 20 and 2 + 5.", "50 + 7 = 57."],
    [
      "What is 47 + 16?",
      "63",
      "7 + 6 makes 13 ones: one extra ten and 3 ones.",
      "40 + 10 + 13 = 63.",
    ],
    [
      "You collect 28 shells and then 35 more. How many shells altogether?",
      "63",
      "Add the tens, then regroup 8 + 5 ones.",
      "20 + 30 + 8 + 5 = 50 + 13 = 63 shells.",
    ],
  ],
);
add(
  "arithmetic",
  3,
  "arrays",
  "Rows and columns",
  "An array has equal rows. Multiply the number of rows by the number in each row.",
  "Three rows of four counters make 3 × 4 = 12 counters.",
  [
    [
      "There are 3 rows with 4 counters in each row. How many counters?",
      "12",
      "Add 4 three times, or multiply 3 × 4.",
      "4 + 4 + 4 = 12.",
      { type: "array", rows: 3, columns: 4 },
    ],
    [
      "There are 4 rows with 5 counters in each row. How many counters?",
      "20",
      "Each row adds 5 counters.",
      "4 × 5 = 20 counters.",
      { type: "array", rows: 4, columns: 5 },
    ],
    [
      "A garden has 6 rows with 3 flowers in each row. How many flowers?",
      "18",
      "There are 6 equal groups of 3.",
      "6 × 3 = 18 flowers.",
      { type: "array", rows: 6, columns: 3 },
    ],
  ],
);
add(
  "arithmetic",
  3,
  "division-facts",
  "Find the missing group",
  "Multiplication and division are partners. Use a multiplication fact to find a missing group size.",
  "24 ÷ 6 asks: 6 times what makes 24? Since 6 × 4 = 24, the answer is 4.",
  [
    [
      "What is 21 ÷ 3?",
      "7",
      "3 times what makes 21?",
      "3 × 7 = 21, so 21 ÷ 3 = 7.",
    ],
    [
      "What is 56 ÷ 7?",
      "8",
      "Use the 7-times table.",
      "7 × 8 = 56, so 56 ÷ 7 = 8.",
    ],
    [
      "36 stickers are shared equally among 4 friends. How many does each friend get?",
      "9",
      "Find the number that makes 4 equal groups total 36.",
      "4 × 9 = 36. Each friend gets 9 stickers.",
    ],
  ],
);
add(
  "fractions",
  4,
  "add-like-fractions",
  "Adding equal-sized fraction parts",
  "When fractions have the same denominator, add their numerators. The denominator stays the same because the pieces stay the same size.",
  "2/7 + 3/7 = 5/7. Two sevenths and three sevenths make five sevenths.",
  [
    [
      "What is 1/5 + 2/5? Enter a fraction or decimal.",
      "3/5",
      "Add the number of fifth-sized pieces.",
      "1 + 2 = 3, so the sum is 3/5.",
      { type: "fraction", numerator: 3, denominator: 5 },
    ],
    [
      "What is 3/8 + 1/8? Enter a fraction or decimal.",
      "1/2",
      "4 eighths can be simplified.",
      "3/8 + 1/8 = 4/8 = 1/2.",
    ],
    [
      "You walk 2/6 kilometer, then 3/6 kilometer. How many kilometers in total?",
      "5/6",
      "Both distances use sixths. Add their numerators.",
      "2/6 + 3/6 = 5/6 kilometer.",
    ],
  ],
);
add(
  "arithmetic",
  4,
  "factors",
  "Find the factors",
  "A factor divides a whole number without a remainder. Factor pairs multiply to make the number.",
  "The factor pairs of 12 are 1 × 12, 2 × 6 and 3 × 4.",
  [
    [
      "4 × what whole number = 28?",
      "7",
      "Find the partner of 4 in a factor pair of 28.",
      "28 ÷ 4 = 7, so 4 × 7 = 28.",
    ],
    [
      "How many positive whole-number factors does 12 have?",
      "6",
      "List both numbers from each factor pair, without repeats.",
      "The factors are 1, 2, 3, 4, 6 and 12: six factors.",
    ],
    [
      "What is the greatest common factor of 18 and 24?",
      "6",
      "List factors shared by both numbers, then choose the greatest.",
      "Their common factors are 1, 2, 3 and 6. The greatest is 6.",
    ],
  ],
);
add(
  "fractions",
  5,
  "multiply-fractions",
  "Multiplying fractions",
  "Multiply numerators, then multiply denominators. Simplify if possible. Multiplying by a fraction less than 1 finds part of an amount.",
  "2/3 × 3/4 = 6/12 = 1/2.",
  [
    [
      "What is 1/2 × 1/3?",
      "1/6",
      "Multiply 1 × 1 and 2 × 3.",
      "The product is 1/6.",
    ],
    [
      "What is 3/5 × 2/3?",
      "2/5",
      "Multiply first, then simplify the result.",
      "3/5 × 2/3 = 6/15 = 2/5.",
    ],
    [
      "A recipe needs 3/4 cup of flour. You make half the recipe. How many cups of flour do you need?",
      "3/8",
      "Find half of 3/4 by multiplying by 1/2.",
      "3/4 × 1/2 = 3/8 cup.",
    ],
  ],
);
add(
  "arithmetic",
  5,
  "decimal-products",
  "Multiplying decimals",
  "Multiply as whole numbers, then place the decimal using the total number of decimal places in the factors. Estimate to check the size.",
  "1.2 × 0.3: 12 × 3 = 36. There are two decimal places altogether, so the product is 0.36.",
  [
    [
      "What is 0.4 × 0.5?",
      "0.2",
      "4 × 5 = 20. Use two decimal places.",
      "0.4 × 0.5 = 0.20 = 0.2.",
    ],
    [
      "What is 2.5 × 1.2?",
      "3",
      "25 × 12 = 300. Use two decimal places.",
      "300 hundredths = 3.00 = 3.",
    ],
    [
      "Three meters of ribbon cost $1.75 per meter. How many dollars is the total cost?",
      "5.25",
      "Multiply the price per meter by 3.",
      "1.75 × 3 = 5.25 dollars.",
    ],
  ],
);
add(
  "algebra",
  6,
  "one-step-equations",
  "Balance a one-step equation",
  "An equation is balanced: both sides have the same value. Use an inverse operation on both sides to find the unknown.",
  "x + 7 = 12. Subtract 7 from both sides: x = 5. Check: 5 + 7 = 12.",
  [
    [
      "Find x: x + 9 = 20.",
      "11",
      "Undo adding 9 by subtracting 9 from both sides.",
      "x = 20 − 9 = 11.",
    ],
    [
      "Find x: 4x = 28.",
      "7",
      "Undo multiplying by 4 by dividing both sides by 4.",
      "x = 28 ÷ 4 = 7.",
    ],
    [
      "Find x: x/3 = 5.",
      "15",
      "Multiply both sides by 3.",
      "x = 5 × 3 = 15. Check: 15 ÷ 3 = 5.",
    ],
  ],
);
add(
  "geometry",
  6,
  "triangle-measure",
  "Finding triangle area",
  "A triangle is half a rectangle with the same base and perpendicular height. Its area is base × height ÷ 2.",
  "A triangle with base 6 cm and perpendicular height 4 cm has area 6 × 4 ÷ 2 = 12 square centimeters.",
  [
    [
      "A triangle has base 8 cm and perpendicular height 3 cm. What is its area in square centimeters?",
      "12",
      "Multiply the base and height, then halve the result.",
      "8 × 3 ÷ 2 = 12 square centimeters.",
    ],
    [
      "A triangle has base 5 m and perpendicular height 6 m. What is its area in square meters?",
      "15",
      "A matching rectangle has area 5 × 6.",
      "5 × 6 ÷ 2 = 15 square meters.",
    ],
    [
      "A triangle has area 24 square centimeters and base 8 cm. What is its perpendicular height in centimeters?",
      "6",
      "Double the area, then divide by the base.",
      "2 × 24 ÷ 8 = 6 centimeters.",
    ],
  ],
);
add(
  "pre-algebra",
  7,
  "integer-products",
  "Multiply and divide signed numbers",
  "A product or quotient of two numbers with the same sign is positive. With different signs, it is negative.",
  "(−3) × (−4) = 12, while (−3) × 4 = −12.",
  [
    [
      "What is (−4) × 6?",
      "-24",
      "The signs differ, so the result is negative.",
      "4 × 6 = 24, so (−4) × 6 = −24.",
    ],
    [
      "What is (−7) × (−3)?",
      "21",
      "The signs match, so the result is positive.",
      "7 × 3 = 21, so the result is 21.",
    ],
    [
      "What is (−36) ÷ 9?",
      "-4",
      "Divide the sizes, then decide the sign.",
      "36 ÷ 9 = 4. Different signs give −4.",
    ],
  ],
);
add(
  "pre-algebra",
  7,
  "percent-change",
  "Percent increase and decrease",
  "Find the percent of the original amount, then add for an increase or subtract for a decrease.",
  "A $40 item discounted by 25% loses $10, so the sale price is $30.",
  [
    [
      "A $50 bag is discounted by 20%. What is the sale price in dollars?",
      "40",
      "Find 20% of 50, then subtract the discount.",
      "0.20 × 50 = 10. The sale price is 50 − 10 = 40 dollars.",
    ],
    [
      "A club has 80 members and grows by 15%. How many members does it have now?",
      "92",
      "Find 15% of 80 and add it to 80.",
      "0.15 × 80 = 12, and 80 + 12 = 92.",
    ],
    [
      "A plant grows from 20 cm to 25 cm. What is its percent increase? Enter the percent number only.",
      "25",
      "Divide the increase by the original height, then multiply by 100.",
      "The increase is 5 cm. 5 ÷ 20 × 100 = 25%.",
    ],
  ],
);
add(
  "algebra",
  8,
  "slope",
  "Slope as a rate of change",
  "Slope compares a change in y with a change in x: slope = change in y ÷ change in x. Keep the same point order in both changes.",
  "Between (1, 2) and (3, 8), the slope is (8 − 2) ÷ (3 − 1) = 3.",
  [
    [
      "Find the slope between (0, 1) and (2, 5).",
      "2",
      "Divide the vertical change by the horizontal change.",
      "(5 − 1) ÷ (2 − 0) = 4 ÷ 2 = 2.",
    ],
    [
      "Find the slope between (1, 7) and (4, 1).",
      "-2",
      "The change in y is negative while the change in x is positive.",
      "(1 − 7) ÷ (4 − 1) = −6 ÷ 3 = −2.",
    ],
    [
      "A tank's water level rises 12 cm in 8 minutes at a steady rate. How many centimeters per minute is that?",
      "1.5",
      "Divide the total rise by the time.",
      "12 ÷ 8 = 1.5 centimeters per minute.",
    ],
  ],
);
add(
  "algebra",
  8,
  "two-step-equations",
  "Solve two-step equations",
  "Undo addition or subtraction first, then undo multiplication or division. Apply each operation to both sides.",
  "3x + 4 = 19. Subtract 4 to get 3x = 15, then divide by 3 to get x = 5.",
  [
    [
      "Find x: 2x + 5 = 17.",
      "6",
      "Subtract 5, then divide by 2.",
      "2x = 12, so x = 6.",
    ],
    [
      "Find x: 5x − 8 = 12.",
      "4",
      "Add 8 to both sides, then divide by 5.",
      "5x = 20, so x = 4.",
    ],
    [
      "Find x: 3(x + 2) = 21.",
      "5",
      "Divide both sides by 3 before subtracting 2.",
      "x + 2 = 7, so x = 5.",
    ],
  ],
);
add(
  "algebra",
  9,
  "linear-rules",
  "Read a linear rule",
  "In y = mx + b, m is the slope and b is the y-intercept. Substitute an input to find its output.",
  "For y = 2x + 3, the slope is 2, the y-intercept is 3, and x = 4 gives y = 11.",
  [
    [
      "For y = 3x − 2, find y when x = 5.",
      "13",
      "Replace x with 5 and multiply before subtracting.",
      "y = 3 × 5 − 2 = 13.",
    ],
    [
      "What is the y-intercept of y = −4x + 7?",
      "7",
      "The y-intercept is the output when x = 0.",
      "y = −4 × 0 + 7 = 7.",
    ],
    [
      "For y = −2x + 9, what is x when y = 1?",
      "4",
      "Set 1 = −2x + 9 and solve for x.",
      "−8 = −2x, so x = 4.",
    ],
  ],
);
add(
  "algebra",
  9,
  "powers",
  "Working with powers",
  "Multiplying powers with the same base adds their exponents. A power raised to a power multiplies exponents.",
  "2³ × 2² = 2⁵ = 32. Also, (2³)² = 2⁶ = 64.",
  [
    [
      "Evaluate 2³ × 2⁴.",
      "128",
      "Add the exponents because the bases are the same.",
      "2⁷ = 128.",
    ],
    ["Evaluate (3²)².", "81", "Multiply the exponents 2 × 2.", "3⁴ = 81."],
    [
      "Evaluate 5³ ÷ 5².",
      "5",
      "When dividing powers with the same nonzero base, subtract exponents.",
      "5³ ÷ 5² = 5¹ = 5.",
    ],
  ],
);
add(
  "geometry",
  10,
  "pythagoras",
  "The Pythagorean theorem",
  "For a right triangle, a² + b² = c², where c is the hypotenuse opposite the right angle.",
  "Legs 3 and 4 give c² = 9 + 16 = 25, so c = 5.",
  [
    [
      "A right triangle has legs 6 cm and 8 cm. What is its hypotenuse in centimeters?",
      "10",
      "Square each leg, add, then take the positive square root.",
      "6² + 8² = 100, so c = 10 centimeters.",
    ],
    [
      "A right triangle has hypotenuse 13 m and one leg 5 m. What is its other leg in meters?",
      "12",
      "Subtract 5² from 13², then take the positive square root.",
      "169 − 25 = 144, so the other leg is 12 meters.",
    ],
    [
      "A square has side length 5 units. What is the square of its diagonal length?",
      "50",
      "The diagonal makes a right triangle with two legs of length 5.",
      "d² = 5² + 5² = 50.",
    ],
  ],
);
add(
  "geometry",
  10,
  "circles",
  "Area and circumference of circles",
  "For radius r, area = πr² and circumference = 2πr. The diameter is twice the radius. Use π = 3.14 in this lesson.",
  "A circle with radius 2 has area 3.14 × 2² = 12.56 square units.",
  [
    [
      "Using π = 3.14, find the area of a circle with radius 3 cm, in square centimeters.",
      "28.26",
      "Square the radius, then multiply by 3.14.",
      "3.14 × 3² = 3.14 × 9 = 28.26.",
    ],
    [
      "Using π = 3.14, find the circumference of a circle with radius 5 m, in meters.",
      "31.4",
      "Multiply 2 × 3.14 × 5.",
      "The circumference is 31.4 meters.",
    ],
    [
      "Using π = 3.14, find the area of a circle with diameter 8 cm, in square centimeters.",
      "50.24",
      "First halve the diameter to get the radius.",
      "r = 4. Area = 3.14 × 4² = 50.24 square centimeters.",
    ],
  ],
);
add(
  "algebra-ii",
  11,
  "quadratic-vertex",
  "Locate a quadratic vertex",
  "For y = ax² + bx + c, the vertex's x-coordinate is −b/(2a). Substitute that x to find its y-coordinate.",
  "For y = x² − 6x + 5, the vertex has x = 6/2 = 3, and y = 9 − 18 + 5 = −4.",
  [
    [
      "Find the x-coordinate of the vertex of y = x² − 8x + 3.",
      "4",
      "Here a = 1 and b = −8. Use −b/(2a).",
      "x = 8 ÷ 2 = 4.",
    ],
    [
      "Find the x-coordinate of the vertex of y = 2x² + 12x + 1.",
      "-3",
      "Use a = 2 and b = 12.",
      "x = −12 ÷ (2 × 2) = −3.",
    ],
    [
      "For y = x² − 4x + 7, find the vertex's y-coordinate.",
      "3",
      "First find x = −b/(2a), then substitute.",
      "x = 2, so y = 4 − 8 + 7 = 3.",
    ],
  ],
);
add(
  "algebra-ii",
  11,
  "sequences",
  "Arithmetic sequences",
  "An arithmetic sequence adds the same difference each time. Its nth term is first term + (n − 1) × common difference.",
  "For 3, 7, 11, … the difference is 4. The fifth term is 3 + 4 × 4 = 19.",
  [
    [
      "What is the next term: 5, 8, 11, __?",
      "14",
      "Find the common difference.",
      "The difference is 3. 11 + 3 = 14.",
    ],
    [
      "A sequence starts at 2 and adds 5 each time. What is its sixth term?",
      "27",
      "There are five jumps from the first term to the sixth.",
      "2 + (6 − 1) × 5 = 27.",
    ],
    [
      "A sequence starts at 30 and subtracts 4 each time. What is its fifth term?",
      "14",
      "Use four jumps of −4.",
      "30 + 4 × (−4) = 14.",
    ],
  ],
);
add(
  "precalculus",
  12,
  "exponential-growth",
  "Exponential growth",
  "In exponential growth, an amount is multiplied by the same factor each step. After n steps, multiply the initial amount by factorⁿ.",
  "Starting with 5 and doubling each step gives 5 × 2³ = 40 after three steps.",
  [
    [
      "A quantity starts at 3 and triples each step. What is it after 2 steps?",
      "27",
      "Multiply 3 by 3².",
      "3 × 3² = 3 × 9 = 27.",
    ],
    [
      "An account starts at $100 and grows by 10% once per year. How many dollars after 2 years?",
      "121",
      "A 10% increase uses a factor of 1.10 each year.",
      "100 × 1.1² = 121 dollars.",
    ],
    [
      "A substance starts at 80 grams and halves each hour. How many grams after 3 hours?",
      "10",
      "Use a factor of 1/2 three times.",
      "80 × (1/2)³ = 80 ÷ 8 = 10 grams.",
    ],
  ],
);
add(
  "precalculus",
  12,
  "logarithms",
  "Logarithms as missing exponents",
  "A logarithm asks for an exponent: log base b of a = x means bˣ = a. The base is positive and not 1, and a is positive.",
  "log base 2 of 8 = 3 because 2³ = 8.",
  [
    [
      "What is log base 2 of 32?",
      "5",
      "2 raised to what power gives 32?",
      "2⁵ = 32, so the logarithm is 5.",
    ],
    [
      "What is log base 10 of 0.01?",
      "-2",
      "0.01 is one hundredth. Think of a negative power of 10.",
      "10⁻² = 1/100 = 0.01, so the logarithm is −2.",
    ],
    [
      "What is log base 3 of 1?",
      "0",
      "Any nonzero base raised to this exponent is 1.",
      "3⁰ = 1, so the logarithm is 0.",
    ],
  ],
);

export const expandedLessons = entries;
export function extendAllGrades(courseId: string, units: Unit[]): Unit[] {
  const extra = entries.filter((entry) => entry.course === courseId);
  const previous = new Map<number, string>();
  return [
    ...units,
    ...extra.map(({ grade, lesson }, index) => {
      const id = `path-${lesson.id}`,
        parent = previous.get(grade);
      previous.set(grade, id);
      return {
        id,
        title: lesson.title,
        grades: [grade],
        requires: parent ? [parent] : [],
        lessons: [lesson],
        x: index * 260,
        y: 740,
      };
    }),
  ];
}
