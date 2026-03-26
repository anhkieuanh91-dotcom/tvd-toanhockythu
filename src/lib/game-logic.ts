export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'matching' | 'short-answer' | 'comparison';

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string;
  explanation: string;
  placeholder?: string; // For fill-in-blank and short-answer
  imageUrl?: string; // Optional image for the question
  pairs?: { left: string, right: string }[]; // For matching
  leftStr?: string; // For comparison
  rightStr?: string; // For comparison
};

function getAdditionNumbers(gradeId: number, isHard: boolean, isMedium: boolean): [number, number, number] {
    let num1 = 0, num2 = 0;
    if (gradeId === 1) {
        const digitsCount = (isHard || isMedium) ? 2 : 1;
        let multiplier = 1;
        for (let i = 0; i < digitsCount; i++) {
            let d1 = Math.floor(Math.random() * 10);
            if (i === digitsCount - 1 && d1 === 0 && digitsCount > 1) d1 = 1;
            let d2 = Math.floor(Math.random() * (10 - d1));
            if (isMedium && i === 1) d2 = 0;
            num1 += d1 * multiplier;
            num2 += d2 * multiplier;
            multiplier *= 10;
        }
        if (isMedium && Math.random() > 0.5) {
            [num1, num2] = [num2, num1];
        }
        if (num1 === 0 && num2 === 0) { num1 = 1; }
    } else {
        const max = gradeId === 2 ? (isHard ? 1000 : 100) : gradeId === 3 ? (isHard ? 10000 : 1000) : (isHard ? 100000 : 10000);
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * max) + 1;
    }
    return [num1, num2, num1 + num2];
}

function getSubtractionNumbers(gradeId: number, isHard: boolean, isMedium: boolean): [number, number, number] {
    let num1 = 0, num2 = 0;
    if (gradeId === 1) {
        const digitsCount = (isHard || isMedium) ? 2 : 1;
        let multiplier = 1;
        for (let i = 0; i < digitsCount; i++) {
            let d1 = Math.floor(Math.random() * 10);
            if (i === digitsCount - 1 && d1 === 0 && digitsCount > 1) d1 = 1;
            let d2 = Math.floor(Math.random() * (d1 + 1));
            if (isMedium && i === 1) d2 = 0;
            num1 += d1 * multiplier;
            num2 += d2 * multiplier;
            multiplier *= 10;
        }
        if (num1 === 0 && num2 === 0) { num1 = 1; }
    } else {
        const max = gradeId === 2 ? (isHard ? 1000 : 100) : gradeId === 3 ? (isHard ? 10000 : 1000) : (isHard ? 100000 : 10000);
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * max) + 1;
        if (num1 < num2) [num1, num2] = [num2, num1];
    }
    return [num1, num2, num1 - num2];
}

export function generateQuestions(gradeId: number, topicId: string, levelId: string, count: number = 5, language: string = 'vi'): Question[] {
  const questions: Question[] = [];
  const usedKeys = new Set<string>();
  const usedAnswers = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = count * 20;
  
  while (questions.length < count && attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * 100000);
    const q = generateQuestion(gradeId, topicId, levelId, randomIndex, language);
    
    const uniqueKey = `${q.text}_${q.correctAnswer}_${q.imageUrl || ''}`;
    
    const isAnswerUnique = !usedAnswers.has(q.correctAnswer);
    const relaxAnswerConstraint = attempts > count * 10;
    
    if (!usedKeys.has(uniqueKey) && (isAnswerUnique || relaxAnswerConstraint)) {
      usedKeys.add(uniqueKey);
      usedAnswers.add(q.correctAnswer);
      questions.push(q);
    }
    attempts++;
  }
  
  // Fallback if we couldn't find enough unique questions
  if (questions.length < count) {
    for (let i = questions.length; i < count; i++) {
      questions.push(generateQuestion(gradeId, topicId, levelId, i, language));
    }
  }
  
  return questions;
}

function generateQuestion(gradeId: number, topicId: string, levelId: string, index: number, language: string): Question {
  const isHard = levelId === 'hard';
  const isMedium = levelId === 'medium';
  const isEasy = levelId === 'easy';

  // Randomly select question type based on topic and difficulty
  let type: QuestionType = 'multiple-choice';
  const rand = Math.random();

  // Determine if topic is highly suitable for fill-in-blank (math calculations)
  const isCalculationHeavy = topicId.includes('so-hoc') || topicId.includes('do-luong') || topicId.includes('chuyen-dong');

  if (isEasy) {
     // Easy mode: 40% multiple choice, 20% true/false, 20% matching, 10% fill-in-blank, 10% short-answer
     if (rand > 0.9 && isCalculationHeavy) type = 'short-answer';
     else if (rand > 0.8 && isCalculationHeavy) type = 'fill-in-blank';
     else if (rand > 0.6) type = 'matching';
     else if (rand > 0.4) type = 'true-false';
  } else if (isMedium) {
     // Medium: 20% Multiple Choice, 20% True/False, 20% Matching, 20% Fill-in-blank, 20% short-answer
     if (rand < 0.2) type = 'multiple-choice';
     else if (rand < 0.4) type = 'true-false';
     else if (rand < 0.6) type = 'matching';
     else if (rand < 0.8) type = isCalculationHeavy ? 'fill-in-blank' : 'multiple-choice';
     else type = isCalculationHeavy ? 'short-answer' : 'multiple-choice';
  } else {
     // Hard: 10% Multiple Choice, 10% True/False, 20% Matching, 30% Fill-in-blank, 30% short-answer
     if (rand < 0.1) type = 'multiple-choice';
     else if (rand < 0.2) type = 'true-false';
     else if (rand < 0.4) type = 'matching';
     else if (rand < 0.7) type = 'fill-in-blank';
     else type = 'short-answer';
  }

  // Specific logic for Geometry and Measurement
  if (topicId.includes('hinh-hoc')) {
    return generateGeometryQuestion(gradeId, levelId, type, index, language);
  } else if (topicId.includes('do-luong')) {
    return generateMeasurementQuestion(gradeId, levelId, type, index, language);
  } else if (topicId.includes('chuyen-dong')) {
    return generateMotionQuestion(gradeId, levelId, type, index, language);
  } else if (topicId.includes('thong-ke-xac-suat')) {
    return generateStatisticsProbabilityQuestion(gradeId, levelId, type, index, language);
  }

  // 20% chance to generate a comparison question for arithmetic topics
  if (Math.random() < 0.2) {
      return generateComparisonQuestion(gradeId, levelId, index, language);
  } else if (Math.random() < 0.25) {
      return generateOrderingQuestion(gradeId, levelId, index, language);
  } else if (gradeId === 3 && topicId.includes('so-hoc')) {
      const rand3 = Math.random();
      if (rand3 < 0.15) return generateRoundingQuestion(gradeId, levelId, index, language);
      if (rand3 < 0.3) return generateExpressionQuestion(gradeId, levelId, index, language);
      if (rand3 < 0.45) return generateRomanNumeralQuestion(gradeId, levelId, index, language);
  } else if (gradeId === 4 && topicId.includes('so-hoc')) {
      const rand4 = Math.random();
      if (rand4 < 0.1) return generateRoundingQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.2) return generateAverageQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.3) return generateLargeMultiplicationDivisionQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.4) return generatePropertiesQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.5) return generateFractionSimplificationQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.7) return generateFractionOperationQuestion(gradeId, levelId, index, language);
      if (rand4 < 0.8) return generateFractionWordProblem(gradeId, levelId, index, language);
  } else if (gradeId === 5 && topicId.includes('so-hoc')) {
      const rand5 = Math.random();
      if (rand5 < 0.1) return generateFractionSimplificationQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.2) return generateFractionOrderingQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.3) return generateFractionOperationQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.4) return generateDecimalFractionMixedNumberQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.5) return generateDecimalOrderingQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.6) return generateDecimalRoundingQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.7) return generateDecimalOperationQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.8) return generateDecimalPropertiesQuestion(gradeId, levelId, index, language);
      if (rand5 < 0.9) return generateDecimalWordProblem(gradeId, levelId, index, language);
      return generateRatioPercentageWordProblem(gradeId, levelId, index, language);
  }

  // Default Arithmetic Logic (Simplified for brevity, focusing on structure)
  return generateArithmeticQuestion(gradeId, levelId, type, index, language);
}

function generateDecimalOrderingQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const count = Math.floor(Math.random() * 2) + 3; // 3 or 4 numbers
    const numbers = new Set<number>();
    while (numbers.size < count) {
        const whole = Math.floor(Math.random() * 50);
        const frac = Math.floor(Math.random() * 99) + 1;
        numbers.add(parseFloat(`${whole}.${frac < 10 ? '0' + frac : frac}`));
    }
    const numList = Array.from(numbers);
    const isAscending = Math.random() > 0.5;
    const sortedList = [...numList].sort((a, b) => isAscending ? a - b : b - a);
    
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    const formattedList = numList.map(formatNum);
    const answer = sortedList.map(formatNum).join('; ');
    
    const textVi = `Sắp xếp các số thập phân sau theo thứ tự từ ${isAscending ? 'bé đến lớn' : 'lớn đến bé'}: ${formattedList.join('; ')}`;
    const textEn = `Sort the following decimal numbers in ${isAscending ? 'ascending' : 'descending'} order: ${formattedList.join('; ')}`;
    
    const options = new Set<string>();
    options.add(answer);
    
    let attempts = 0;
    while (options.size < 4 && attempts < 50) {
        const shuffled = [...sortedList].sort(() => Math.random() - 0.5);
        options.add(shuffled.map(formatNum).join('; '));
        attempts++;
    }
    
    return {
        id: `dec-order-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: language === 'en' ? `The correct order is ${answer}.` : language === 'vi-en' ? `Thứ tự đúng là ${answer}. / The correct order is ${answer}.` : `Thứ tự đúng là ${answer}.`
    };
}

function generateDecimalRoundingQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const roundType = Math.floor(Math.random() * 3); // 0: whole, 1: 1 decimal place, 2: 2 decimal places
    
    let num = 0;
    let answer = 0;
    let placeNameVi = '';
    let placeNameEn = '';
    
    if (roundType === 0) {
        num = parseFloat((Math.random() * 100).toFixed(1 + Math.floor(Math.random() * 2)));
        answer = Math.round(num);
        placeNameVi = 'số tự nhiên gần nhất';
        placeNameEn = 'nearest whole number';
    } else if (roundType === 1) {
        num = parseFloat((Math.random() * 100).toFixed(2 + Math.floor(Math.random() * 1)));
        answer = Math.round(num * 10) / 10;
        placeNameVi = 'hàng phần mười (1 chữ số ở phần thập phân)';
        placeNameEn = 'nearest tenth (1 decimal place)';
    } else {
        num = parseFloat((Math.random() * 100).toFixed(3));
        answer = Math.round(num * 100) / 100;
        placeNameVi = 'hàng phần trăm (2 chữ số ở phần thập phân)';
        placeNameEn = 'nearest hundredth (2 decimal places)';
    }
    
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    const formattedNum = formatNum(num);
    const formattedAns = formatNum(answer);
    
    const textVi = `Làm tròn số thập phân ${formattedNum} tới ${placeNameVi} thì được số nào?`;
    const textEn = `Round the decimal number ${formattedNum} to the ${placeNameEn}.`;
    
    const options = new Set<string>();
    options.add(formattedAns);
    
    while (options.size < 4) {
        let wrong = 0;
        if (roundType === 0) {
            wrong = answer + Math.floor(Math.random() * 5) - 2;
        } else if (roundType === 1) {
            wrong = Math.round((answer + (Math.floor(Math.random() * 5) - 2) * 0.1) * 10) / 10;
        } else {
            wrong = Math.round((answer + (Math.floor(Math.random() * 5) - 2) * 0.01) * 100) / 100;
        }
        if (wrong > 0 && formatNum(wrong) !== formattedAns) {
            options.add(formatNum(wrong));
        }
    }
    
    return {
        id: `dec-round-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: formattedAns,
        explanation: language === 'en' ? `${formattedNum} rounded to the ${placeNameEn} is ${formattedAns}.` : language === 'vi-en' ? `Làm tròn ${formattedNum} tới ${placeNameVi} ta được ${formattedAns}. / ${formattedNum} rounded to the ${placeNameEn} is ${formattedAns}.` : `Làm tròn ${formattedNum} tới ${placeNameVi} ta được ${formattedAns}.`
    };
}

function generateDecimalOperationQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const opType = Math.random();
    let num1 = 0, num2 = 0, answer = 0;
    let opStrVi = '', opStrEn = '';
    
    if (opType < 0.25) {
        // Add/Sub
        const isAdd = Math.random() > 0.5;
        num1 = parseFloat((Math.random() * 100).toFixed(2));
        num2 = parseFloat((Math.random() * 100).toFixed(2));
        if (!isAdd && num1 < num2) {
            const temp = num1; num1 = num2; num2 = temp;
        }
        answer = isAdd ? num1 + num2 : num1 - num2;
        answer = Math.round(answer * 100) / 100;
        opStrVi = isAdd ? '+' : '-';
        opStrEn = opStrVi;
    } else if (opType < 0.5) {
        // Mul/Div by decimal (a.b or 0.ab)
        const isMul = Math.random() > 0.5;
        const isFormat1 = Math.random() > 0.5; // a.b
        
        if (isMul) {
            num1 = Math.floor(Math.random() * 90) + 10; // 10-99
            if (isFormat1) {
                num2 = parseFloat(((Math.floor(Math.random() * 9) + 1) + (Math.floor(Math.random() * 9) + 1) / 10).toFixed(1)); // a.b
            } else {
                num2 = parseFloat((Math.floor(Math.random() * 99) / 100).toFixed(2)); // 0.ab
                if (num2 === 0) num2 = 0.15;
            }
            answer = Math.round((num1 * num2) * 100) / 100;
            opStrVi = '×';
            opStrEn = '×';
        } else {
            // Division
            if (isFormat1) {
                num2 = parseFloat(((Math.floor(Math.random() * 9) + 1) + (Math.floor(Math.random() * 9) + 1) / 10).toFixed(1)); // a.b
            } else {
                num2 = parseFloat(((Math.floor(Math.random() * 98) + 1) / 100).toFixed(2)); // 0.ab
            }
            answer = Math.floor(Math.random() * 50) + 2;
            num1 = Math.round((answer * num2) * 100) / 100;
            opStrVi = ':';
            opStrEn = '÷';
        }
    } else {
        // Mental math: 10, 100, 1000 or 0.1, 0.01, 0.001
        num1 = parseFloat((Math.random() * 1000).toFixed(3));
        const isMul = Math.random() > 0.5;
        const isWhole = Math.random() > 0.5;
        
        if (isWhole) {
            const powers = [10, 100, 1000];
            num2 = powers[Math.floor(Math.random() * powers.length)];
        } else {
            const powers = [0.1, 0.01, 0.001];
            num2 = powers[Math.floor(Math.random() * powers.length)];
        }
        
        if (isMul) {
            answer = num1 * num2;
            opStrVi = '×';
            opStrEn = '×';
        } else {
            answer = num1 / num2;
            opStrVi = ':';
            opStrEn = '÷';
        }
        
        // Fix floating point issues
        answer = parseFloat(answer.toPrecision(10));
    }
    
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    const formattedNum1 = formatNum(num1);
    const formattedNum2 = formatNum(num2);
    const formattedAns = formatNum(answer);
    
    const textVi = `Tính: ${formattedNum1} ${opStrVi} ${formattedNum2}`;
    const textEn = `Calculate: ${formattedNum1} ${opStrEn} ${formattedNum2}`;
    
    const options = new Set<string>();
    options.add(formattedAns);
    while (options.size < 4) {
        let wrong = 0;
        if (opType >= 0.5) {
            // Mental math mistakes
            const mistakeType = Math.random();
            if (mistakeType < 0.33) wrong = answer * 10;
            else if (mistakeType < 0.66) wrong = answer / 10;
            else wrong = answer * 100;
            wrong = parseFloat(wrong.toPrecision(10));
        } else {
            wrong = answer + (Math.floor(Math.random() * 20) - 10) * (Math.random() > 0.5 ? 0.1 : 1);
            wrong = Math.round(wrong * 100) / 100;
        }
        if (wrong > 0 && formatNum(wrong) !== formattedAns) {
            options.add(formatNum(wrong));
        }
    }
    
    return {
        id: `dec-op-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: formattedAns,
        explanation: language === 'en' ? `${formattedNum1} ${opStrEn} ${formattedNum2} = ${formattedAns}` : language === 'vi-en' ? `${formattedNum1} ${opStrVi} ${formattedNum2} = ${formattedAns}` : `${formattedNum1} ${opStrVi} ${formattedNum2} = ${formattedAns}`
    };
}

function generateDecimalPropertiesQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const type = Math.random();
    let exprVi = '', exprEn = '', answer = 0, explanationVi = '', explanationEn = '';
    
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    
    if (type < 0.5) {
        // Associative/Commutative addition
        const pairs = [[2.5, 7.5], [1.25, 8.75], [4.6, 5.4], [3.8, 6.2]];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const other = parseFloat((Math.random() * 20).toFixed(2));
        
        const order = Math.random();
        if (order < 0.33) {
            exprVi = `${formatNum(pair[0])} + ${formatNum(other)} + ${formatNum(pair[1])}`;
            exprEn = `${formatNum(pair[0])} + ${formatNum(other)} + ${formatNum(pair[1])}`;
        } else if (order < 0.66) {
            exprVi = `${formatNum(other)} + ${formatNum(pair[0])} + ${formatNum(pair[1])}`;
            exprEn = `${formatNum(other)} + ${formatNum(pair[0])} + ${formatNum(pair[1])}`;
        } else {
            exprVi = `${formatNum(pair[0])} + ${formatNum(pair[1])} + ${formatNum(other)}`;
            exprEn = `${formatNum(pair[0])} + ${formatNum(pair[1])} + ${formatNum(other)}`;
        }
        
        answer = Math.round((pair[0] + pair[1] + other) * 100) / 100;
        const pairSum = Math.round((pair[0] + pair[1]) * 100) / 100;
        explanationVi = `Tính nhẩm: (${formatNum(pair[0])} + ${formatNum(pair[1])}) + ${formatNum(other)} = ${formatNum(pairSum)} + ${formatNum(other)} = ${formatNum(answer)}`;
        explanationEn = `Mental math: (${formatNum(pair[0])} + ${formatNum(pair[1])}) + ${formatNum(other)} = ${formatNum(pairSum)} + ${formatNum(other)} = ${formatNum(answer)}`;
    } else {
        // Distributive over addition
        const common = parseFloat(((Math.floor(Math.random() * 9) + 1) / 10).toFixed(1)); // 0.1 to 0.9
        const p1 = parseFloat((Math.random() * 9 + 1).toFixed(1));
        const p2 = Math.round((10 - p1) * 10) / 10;
        
        exprVi = `${formatNum(common)} × ${formatNum(p1)} + ${formatNum(common)} × ${formatNum(p2)}`;
        exprEn = `${formatNum(common)} × ${formatNum(p1)} + ${formatNum(common)} × ${formatNum(p2)}`;
        answer = Math.round((common * 10) * 100) / 100;
        explanationVi = `Tính nhẩm: ${formatNum(common)} × (${formatNum(p1)} + ${formatNum(p2)}) = ${formatNum(common)} × 10 = ${formatNum(answer)}`;
        explanationEn = `Mental math: ${formatNum(common)} × (${formatNum(p1)} + ${formatNum(p2)}) = ${formatNum(common)} × 10 = ${formatNum(answer)}`;
    }
    
    const textVi = `Tính bằng cách thuận tiện nhất: ${exprVi}`;
    const textEn = `Calculate in the most convenient way: ${exprEn}`;
    
    const formattedAns = formatNum(answer);
    const options = new Set<string>();
    options.add(formattedAns);
    while (options.size < 4) {
        const wrong = Math.round((answer + (Math.floor(Math.random() * 10) - 5) * 0.1) * 100) / 100;
        if (wrong > 0 && formatNum(wrong) !== formattedAns) options.add(formatNum(wrong));
    }
    
    return {
        id: `dec-prop-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: formattedAns,
        explanation: language === 'en' ? explanationEn : language === 'vi-en' ? `${explanationVi} / ${explanationEn}` : explanationVi
    };
}

function generateRatioPercentageWordProblem(gradeId: number, levelId: string, index: number, language: string): Question {
    const type = Math.random();
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    
    let textVi = '', textEn = '', answer = 0, explanationVi = '', explanationEn = '';
    
    if (type < 0.33) {
        // Sum/Difference and ratio
        const isSum = Math.random() > 0.5;
        const ratioNum = Math.floor(Math.random() * 4) + 1;
        const ratioDen = ratioNum + Math.floor(Math.random() * 3) + 1;
        const partValue = Math.floor(Math.random() * 10) + 2;
        
        const num1 = ratioNum * partValue;
        const num2 = ratioDen * partValue;
        
        const sumOrDiff = isSum ? num1 + num2 : num2 - num1;
        const ratioStr = `${ratioNum}/${ratioDen}`;
        
        const askFirst = Math.random() > 0.5;
        answer = askFirst ? num1 : num2;
        
        if (isSum) {
            textVi = `Tổng của hai số là ${sumOrDiff}. Tỉ số của hai số đó là ${ratioStr}. Tìm số ${askFirst ? 'bé' : 'lớn'}.`;
            textEn = `The sum of two numbers is ${sumOrDiff}. Their ratio is ${ratioStr}. Find the ${askFirst ? 'smaller' : 'larger'} number.`;
            explanationVi = `Tổng số phần bằng nhau: ${ratioNum} + ${ratioDen} = ${ratioNum + ratioDen}. Giá trị 1 phần: ${sumOrDiff} : ${ratioNum + ratioDen} = ${partValue}. Số ${askFirst ? 'bé' : 'lớn'}: ${partValue} × ${askFirst ? ratioNum : ratioDen} = ${answer}.`;
            explanationEn = `Total parts: ${ratioNum} + ${ratioDen} = ${ratioNum + ratioDen}. Value of 1 part: ${sumOrDiff} ÷ ${ratioNum + ratioDen} = ${partValue}. ${askFirst ? 'Smaller' : 'Larger'} number: ${partValue} × ${askFirst ? ratioNum : ratioDen} = ${answer}.`;
        } else {
            textVi = `Hiệu của hai số là ${sumOrDiff}. Tỉ số của hai số đó là ${ratioStr}. Tìm số ${askFirst ? 'bé' : 'lớn'}.`;
            textEn = `The difference of two numbers is ${sumOrDiff}. Their ratio is ${ratioStr}. Find the ${askFirst ? 'smaller' : 'larger'} number.`;
            explanationVi = `Hiệu số phần bằng nhau: ${ratioDen} - ${ratioNum} = ${ratioDen - ratioNum}. Giá trị 1 phần: ${sumOrDiff} : ${ratioDen - ratioNum} = ${partValue}. Số ${askFirst ? 'bé' : 'lớn'}: ${partValue} × ${askFirst ? ratioNum : ratioDen} = ${answer}.`;
            explanationEn = `Difference in parts: ${ratioDen} - ${ratioNum} = ${ratioDen - ratioNum}. Value of 1 part: ${sumOrDiff} ÷ ${ratioDen - ratioNum} = ${partValue}. ${askFirst ? 'Smaller' : 'Larger'} number: ${partValue} × ${askFirst ? ratioNum : ratioDen} = ${answer}.`;
        }
    } else if (type < 0.66) {
        // Percentage of two numbers
        const num1 = Math.floor(Math.random() * 40) + 10;
        const num2 = (Math.floor(Math.random() * 5) + 2) * 10; // 20, 30, 40, 50
        answer = Math.round((num1 / num2) * 10000) / 100; // Percentage
        
        textVi = `Tính tỉ số phần trăm của ${num1} và ${num2}.`;
        textEn = `Calculate the percentage ratio of ${num1} and ${num2}.`;
        explanationVi = `Tỉ số phần trăm: ${num1} : ${num2} = ${formatNum(num1 / num2)} = ${formatNum(answer)}%`;
        explanationEn = `Percentage ratio: ${num1} ÷ ${num2} = ${formatNum(num1 / num2)} = ${formatNum(answer)}%`;
    } else {
        // Percentage value of a number
        const percent = Math.floor(Math.random() * 90) + 10;
        const total = Math.floor(Math.random() * 900) + 100;
        answer = Math.round((total * percent / 100) * 100) / 100;
        
        textVi = `Tìm ${percent}% của ${total}.`;
        textEn = `Find ${percent}% of ${total}.`;
        explanationVi = `${percent}% của ${total} là: ${total} × ${percent} : 100 = ${formatNum(answer)}`;
        explanationEn = `${percent}% of ${total} is: ${total} × ${percent} ÷ 100 = ${formatNum(answer)}`;
    }
    
    const formattedAns = type < 0.66 && type >= 0.33 ? `${formatNum(answer)}%` : formatNum(answer);
    
    const options = new Set<string>();
    options.add(formattedAns);
    while (options.size < 4) {
        let wrong = 0;
        if (type < 0.33) {
            wrong = answer + Math.floor(Math.random() * 20) - 10;
        } else if (type < 0.66) {
            wrong = answer + Math.floor(Math.random() * 20) - 10;
        } else {
            wrong = answer + Math.floor(Math.random() * 50) - 25;
        }
        if (wrong > 0 && wrong !== answer) {
            const wAns = type < 0.66 && type >= 0.33 ? `${formatNum(wrong)}%` : formatNum(wrong);
            options.add(wAns);
        }
    }
    
    return {
        id: `ratio-pct-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: formattedAns,
        explanation: language === 'en' ? explanationEn : language === 'vi-en' ? `${explanationVi} / ${explanationEn}` : explanationVi
    };
}

function generateDecimalWordProblem(gradeId: number, levelId: string, index: number, language: string): Question {
    const formatNum = (n: number) => language.includes('vi') ? n.toString().replace('.', ',') : n.toString();
    
    const type = Math.random();
    let textVi = '', textEn = '', answer = 0, explanationVi = '', explanationEn = '';
    
    if (type < 0.5) {
        // Addition/Subtraction word problem
        const item1 = parseFloat((Math.random() * 10 + 5).toFixed(1));
        const item2 = parseFloat((Math.random() * 10 + 5).toFixed(1));
        answer = Math.round((item1 + item2) * 10) / 10;
        
        textVi = `Một người mua ${formatNum(item1)} kg táo và ${formatNum(item2)} kg cam. Hỏi người đó đã mua tất cả bao nhiêu ki-lô-gam hoa quả?`;
        textEn = `A person bought ${formatNum(item1)} kg of apples and ${formatNum(item2)} kg of oranges. How many kilograms of fruit did they buy in total?`;
        explanationVi = `Tổng số ki-lô-gam hoa quả là: ${formatNum(item1)} + ${formatNum(item2)} = ${formatNum(answer)} (kg)`;
        explanationEn = `Total kilograms of fruit: ${formatNum(item1)} + ${formatNum(item2)} = ${formatNum(answer)} (kg)`;
    } else {
        // Multiplication/Division word problem
        const length = parseFloat((Math.random() * 10 + 5).toFixed(1));
        const width = parseFloat((Math.random() * 5 + 2).toFixed(1));
        answer = Math.round((length * width) * 100) / 100;
        
        textVi = `Một mảnh đất hình chữ nhật có chiều dài ${formatNum(length)} m, chiều rộng ${formatNum(width)} m. Tính diện tích mảnh đất đó.`;
        textEn = `A rectangular piece of land has a length of ${formatNum(length)} m and a width of ${formatNum(width)} m. Calculate its area.`;
        explanationVi = `Diện tích mảnh đất là: ${formatNum(length)} × ${formatNum(width)} = ${formatNum(answer)} (m²)`;
        explanationEn = `Area of the land: ${formatNum(length)} × ${formatNum(width)} = ${formatNum(answer)} (m²)`;
    }
    
    const formattedAns = formatNum(answer);
    const options = new Set<string>();
    options.add(formattedAns);
    while (options.size < 4) {
        const wrong = Math.round((answer + (Math.floor(Math.random() * 10) - 5) * 0.1) * 100) / 100;
        if (wrong > 0 && formatNum(wrong) !== formattedAns) options.add(formatNum(wrong));
    }
    
    return {
        id: `dec-word-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: formattedAns,
        explanation: language === 'en' ? explanationEn : language === 'vi-en' ? `${explanationVi} / ${explanationEn}` : explanationVi
    };
}

function generateDecimalFractionMixedNumberQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const isRecognize = Math.random() > 0.5;
    
    if (isRecognize) {
        // Recognize decimal fraction
        const dens = [10, 100, 1000];
        const correctDen = dens[Math.floor(Math.random() * dens.length)];
        const correctNum = Math.floor(Math.random() * 90) + 10;
        const correctFrac = `${correctNum}/${correctDen}`;
        
        const options = new Set<string>();
        options.add(correctFrac);
        while (options.size < 4) {
            const wrongDen = Math.floor(Math.random() * 90) + 11; // not 10, 100, 1000
            if (!dens.includes(wrongDen)) {
                const wrongNum = Math.floor(Math.random() * 90) + 10;
                options.add(`${wrongNum}/${wrongDen}`);
            }
        }
        
        const textVi = `Phân số nào dưới đây là phân số thập phân?`;
        const textEn = `Which of the following fractions is a decimal fraction?`;
        
        return {
            id: `dec-frac-rec-${index}`,
            type: 'multiple-choice',
            text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
            options: Array.from(options).sort(() => Math.random() - 0.5),
            correctAnswer: correctFrac,
            explanation: language === 'en' ? `A decimal fraction has a denominator of 10, 100, 1000, etc.` : language === 'vi-en' ? `Phân số thập phân có mẫu số là 10, 100, 1000,... / A decimal fraction has a denominator of 10, 100, 1000, etc.` : `Phân số thập phân có mẫu số là 10, 100, 1000,...`
        };
    } else {
        // Convert to mixed number
        const dens = [10, 100, 1000];
        const den = dens[Math.floor(Math.random() * dens.length)];
        const whole = Math.floor(Math.random() * 9) + 1;
        const remainder = Math.floor(Math.random() * (den - 1)) + 1;
        const num = whole * den + remainder;
        
        const answer = `${whole} ${remainder}/${den}`;
        
        const options = new Set<string>();
        options.add(answer);
        while (options.size < 4) {
            const wWhole = whole + Math.floor(Math.random() * 5) - 2;
            const wRem = remainder + Math.floor(Math.random() * 20) - 10;
            if (wWhole > 0 && wRem > 0 && wRem < den) {
                const wAns = `${wWhole} ${wRem}/${den}`;
                if (wAns !== answer) options.add(wAns);
            }
        }
        
        const textVi = `Viết phân số thập phân ${num}/${den} dưới dạng hỗn số:`;
        const textEn = `Write the decimal fraction ${num}/${den} as a mixed number:`;
        
        return {
            id: `dec-frac-mix-${index}`,
            type: 'multiple-choice',
            text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
            options: Array.from(options).sort(() => Math.random() - 0.5),
            correctAnswer: answer,
            explanation: language === 'en' ? `${num} ÷ ${den} = ${whole} with a remainder of ${remainder}. So, ${num}/${den} = ${whole} ${remainder}/${den}.` : language === 'vi-en' ? `Ta có ${num} : ${den} = ${whole} (dư ${remainder}). Vậy ${num}/${den} = ${whole} ${remainder}/${den}. / ${num} ÷ ${den} = ${whole} with a remainder of ${remainder}.` : `Ta có ${num} : ${den} = ${whole} (dư ${remainder}). Vậy ${num}/${den} = ${whole} ${remainder}/${den}.`
        };
    }
}

function generateAverageQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 numbers
    const average = Math.floor(Math.random() * 50) + 10;
    const sum = average * count;
    
    let numbers: number[] = [];
    let currentSum = 0;
    for (let i = 0; i < count - 1; i++) {
        const num = Math.floor(Math.random() * (average * 1.5)) + 1;
        numbers.push(num);
        currentSum += num;
    }
    numbers.push(sum - currentSum);
    
    // Ensure no negative numbers, if so, just use a simple fallback
    if (numbers[numbers.length - 1] <= 0) {
        numbers = Array(count).fill(average);
        numbers[0] -= 5;
        numbers[1] += 5;
    }
    
    const textVi = `Tìm số trung bình cộng của các số sau: ${numbers.join(', ')}`;
    const textEn = `Find the average of the following numbers: ${numbers.join(', ')}`;
    
    const options = new Set<string>();
    options.add(average.toString());
    while (options.size < 4) {
        const wrong = average + Math.floor(Math.random() * 20) - 10;
        if (wrong > 0 && wrong !== average) options.add(wrong.toString());
    }
    
    return {
        id: `avg-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: average.toString(),
        explanation: language === 'en' ? `The sum is ${sum}. ${sum} / ${count} = ${average}.` : language === 'vi-en' ? `Tổng là ${sum}. Trung bình cộng: ${sum} : ${count} = ${average}. / The sum is ${sum}. ${sum} / ${count} = ${average}.` : `Tổng là ${sum}. Trung bình cộng: ${sum} : ${count} = ${average}.`
    };
}

function generateLargeMultiplicationDivisionQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const type = Math.random();
    let num1 = 0, num2 = 0, answer = 0;
    let opStrVi = '', opStrEn = '';
    let isDiv = false;
    
    if (type < 0.33) {
        // Multiply by <= 2 digits
        num1 = Math.floor(Math.random() * 900) + 100; // 3 digits
        num2 = Math.floor(Math.random() * 90) + 10; // 2 digits
        answer = num1 * num2;
        opStrVi = `${num1} × ${num2}`;
        opStrEn = `${num1} × ${num2}`;
    } else if (type < 0.66) {
        // Divide by <= 2 digits
        num2 = Math.floor(Math.random() * 90) + 10; // 2 digits
        answer = Math.floor(Math.random() * 900) + 100; // 3 digits
        num1 = num2 * answer;
        isDiv = true;
        opStrVi = `${num1} : ${num2}`;
        opStrEn = `${num1} ÷ ${num2}`;
    } else {
        // Multiply/Divide by 10, 100, 1000
        const powers = [10, 100, 1000];
        num2 = powers[Math.floor(Math.random() * powers.length)];
        isDiv = Math.random() > 0.5;
        
        if (isDiv) {
            answer = Math.floor(Math.random() * 900) + 10;
            num1 = answer * num2;
            opStrVi = `${num1} : ${num2}`;
            opStrEn = `${num1} ÷ ${num2}`;
        } else {
            num1 = Math.floor(Math.random() * 900) + 10;
            answer = num1 * num2;
            opStrVi = `${num1} × ${num2}`;
            opStrEn = `${num1} × ${num2}`;
        }
    }
    
    const textVi = `Tính: ${opStrVi}`;
    const textEn = `Calculate: ${opStrEn}`;
    
    const options = new Set<string>();
    options.add(answer.toString());
    while (options.size < 4) {
        let wrong = 0;
        if (isDiv) {
            wrong = answer + Math.floor(Math.random() * 20) - 10;
        } else {
            const mistakeType = Math.random();
            if (mistakeType < 0.3) wrong = answer * 10;
            else if (mistakeType < 0.6) wrong = Math.floor(answer / 10);
            else wrong = answer + (Math.floor(Math.random() * 9) + 1) * 100;
        }
        if (wrong > 0 && wrong !== answer) options.add(wrong.toString());
    }
    
    return {
        id: `largemuldiv-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer.toString(),
        explanation: language === 'en' ? `${opStrEn} = ${answer}` : language === 'vi-en' ? `${opStrVi} = ${answer}` : `${opStrVi} = ${answer}`
    };
}

function generatePropertiesQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const type = Math.random();
    let exprVi = '', exprEn = '', answer = 0, explanationVi = '', explanationEn = '';
    
    if (type < 0.33) {
        // Associative/Commutative multi
        const pairs = [[25, 4], [125, 8], [5, 20], [50, 2]];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const other = Math.floor(Math.random() * 90) + 10;
        
        const order = Math.random();
        if (order < 0.33) {
            exprVi = `${pair[0]} × ${other} × ${pair[1]}`;
            exprEn = `${pair[0]} × ${other} × ${pair[1]}`;
        } else if (order < 0.66) {
            exprVi = `${other} × ${pair[0]} × ${pair[1]}`;
            exprEn = `${other} × ${pair[0]} × ${pair[1]}`;
        } else {
            exprVi = `${pair[0]} × ${pair[1]} × ${other}`;
            exprEn = `${pair[0]} × ${pair[1]} × ${other}`;
        }
        
        answer = pair[0] * pair[1] * other;
        explanationVi = `Tính nhẩm: (${pair[0]} × ${pair[1]}) × ${other} = ${pair[0]*pair[1]} × ${other} = ${answer}`;
        explanationEn = `Mental math: (${pair[0]} × ${pair[1]}) × ${other} = ${pair[0]*pair[1]} × ${other} = ${answer}`;
    } else if (type < 0.66) {
        // Distributive over addition
        const common = Math.floor(Math.random() * 90) + 10;
        const p1 = Math.floor(Math.random() * 90) + 1;
        const p2 = 100 - p1;
        
        exprVi = `${common} × ${p1} + ${common} × ${p2}`;
        exprEn = `${common} × ${p1} + ${common} × ${p2}`;
        answer = common * 100;
        explanationVi = `Tính nhẩm: ${common} × (${p1} + ${p2}) = ${common} × 100 = ${answer}`;
        explanationEn = `Mental math: ${common} × (${p1} + ${p2}) = ${common} × 100 = ${answer}`;
    } else {
        // Distributive over subtraction
        const common = Math.floor(Math.random() * 90) + 10;
        const p1 = Math.floor(Math.random() * 50) + 100;
        const p2 = p1 - 100;
        
        exprVi = `${common} × ${p1} - ${common} × ${p2}`;
        exprEn = `${common} × ${p1} - ${common} × ${p2}`;
        answer = common * 100;
        explanationVi = `Tính nhẩm: ${common} × (${p1} - ${p2}) = ${common} × 100 = ${answer}`;
        explanationEn = `Mental math: ${common} × (${p1} - ${p2}) = ${common} × 100 = ${answer}`;
    }
    
    const textVi = `Tính bằng cách thuận tiện nhất: ${exprVi}`;
    const textEn = `Calculate in the most convenient way: ${exprEn}`;
    
    const options = new Set<string>();
    options.add(answer.toString());
    while (options.size < 4) {
        const wrong = answer + (Math.floor(Math.random() * 20) - 10) * 10;
        if (wrong > 0 && wrong !== answer) options.add(wrong.toString());
    }
    
    return {
        id: `prop-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer.toString(),
        explanation: language === 'en' ? explanationEn : language === 'vi-en' ? `${explanationVi} / ${explanationEn}` : explanationVi
    };
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function generateFractionSimplificationQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const m = multipliers[Math.floor(Math.random() * multipliers.length)];
    
    let num = Math.floor(Math.random() * 9) + 1;
    let den = Math.floor(Math.random() * 9) + 2;
    while (num >= den || gcd(num, den) !== 1) {
        num = Math.floor(Math.random() * 9) + 1;
        den = Math.floor(Math.random() * 9) + 2;
    }
    
    const unsimplifiedNum = num * m;
    const unsimplifiedDen = den * m;
    
    const textVi = `Rút gọn phân số ${unsimplifiedNum}/${unsimplifiedDen} ta được phân số tối giản nào?`;
    const textEn = `Simplify the fraction ${unsimplifiedNum}/${unsimplifiedDen} to its simplest form.`;
    
    const answer = `${num}/${den}`;
    
    const options = new Set<string>();
    options.add(answer);
    while (options.size < 4) {
        const wNum = Math.floor(Math.random() * 9) + 1;
        const wDen = Math.floor(Math.random() * 9) + 2;
        if (wNum < wDen && gcd(wNum, wDen) === 1) {
            const wAns = `${wNum}/${wDen}`;
            if (wAns !== answer) options.add(wAns);
        }
    }
    
    return {
        id: `frac-simp-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: language === 'en' ? `Divide both numerator and denominator by ${m} to get ${answer}.` : language === 'vi-en' ? `Chia cả tử số và mẫu số cho ${m} ta được ${answer}. / Divide both by ${m} to get ${answer}.` : `Chia cả tử số và mẫu số cho ${m} ta được ${answer}.`
    };
}

function generateFractionOperationQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const ops = ['+', '-', 'x', '/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    let num1 = 1, den1 = 2, num2 = 1, den2 = 2;
    let ansNum = 1, ansDen = 1;
    
    if (op === '+' || op === '-') {
        const isSameDen = Math.random() > 0.5;
        if (isSameDen) {
            den1 = Math.floor(Math.random() * 8) + 3;
            den2 = den1;
            num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
            num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
            if (op === '-' && num1 < num2) {
                const temp = num1; num1 = num2; num2 = temp;
            }
        } else {
            const isProductDen = gradeId >= 5 && Math.random() > 0.5;
            if (isProductDen) {
                den1 = Math.floor(Math.random() * 5) + 2;
                den2 = Math.floor(Math.random() * 5) + 2;
                while (gcd(den1, den2) !== 1) {
                    den2 = Math.floor(Math.random() * 5) + 2;
                }
                num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
                num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
                if (op === '-' && num1 * den2 < num2 * den1) {
                    const tempNum = num1; num1 = num2; num2 = tempNum;
                    const tempDen = den1; den1 = den2; den2 = tempDen;
                }
            } else {
                den2 = Math.floor(Math.random() * 5) + 2;
                den1 = den2 * (Math.floor(Math.random() * 3) + 2);
                num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
                num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
                if (op === '-') {
                    const multiplier = den1 / den2;
                    num1 = num2 * multiplier + Math.floor(Math.random() * 3) + 1;
                }
            }
        }
        
        if (op === '+') {
            ansDen = den1 * den2;
            ansNum = num1 * den2 + num2 * den1;
        } else {
            ansDen = den1 * den2;
            ansNum = num1 * den2 - num2 * den1;
        }
    } else {
        den1 = Math.floor(Math.random() * 5) + 2;
        den2 = Math.floor(Math.random() * 5) + 2;
        num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
        
        if (op === 'x') {
            ansNum = num1 * num2;
            ansDen = den1 * den2;
        } else {
            ansNum = num1 * den2;
            ansDen = den1 * num2;
        }
    }
    
    const divisor = gcd(ansNum, ansDen);
    ansNum /= divisor;
    ansDen /= divisor;
    
    const answer = ansDen === 1 ? `${ansNum}` : `${ansNum}/${ansDen}`;
    
    let opStrVi = op;
    let opStrEn = op;
    if (op === 'x') {
        opStrVi = '×';
        opStrEn = '×';
    } else if (op === '/') {
        opStrVi = ':';
        opStrEn = '÷';
    }
    
    const textVi = `Tính: ${num1}/${den1} ${opStrVi} ${num2}/${den2}`;
    const textEn = `Calculate: ${num1}/${den1} ${opStrEn} ${num2}/${den2}`;
    
    const options = new Set<string>();
    options.add(answer);
    while (options.size < 4) {
        const wNum = ansNum + Math.floor(Math.random() * 5) - 2;
        const wDen = ansDen + Math.floor(Math.random() * 5) - 2;
        if (wNum > 0 && wDen > 0) {
            const wDiv = gcd(wNum, wDen);
            const wAns = wDen / wDiv === 1 ? `${wNum / wDiv}` : `${wNum / wDiv}/${wDen / wDiv}`;
            if (wAns !== answer) options.add(wAns);
        }
    }
    
    return {
        id: `frac-op-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: language === 'en' ? `The result is ${answer}.` : language === 'vi-en' ? `Kết quả là ${answer}. / The result is ${answer}.` : `Kết quả là ${answer}.`
    };
}

function generateFractionWordProblem(gradeId: number, levelId: string, index: number, language: string): Question {
    const total = (Math.floor(Math.random() * 10) + 2) * 5;
    const den = [2, 3, 4, 5, 6, 8, 10].find(d => total % d === 0) || 5;
    const num = Math.floor(Math.random() * (den - 1)) + 1;
    
    const answer = (total / den) * num;
    
    const subjects = [
        {
            vi: `Một lớp học có ${total} học sinh, trong đó ${num}/${den} số học sinh là nữ. Hỏi lớp đó có bao nhiêu học sinh nữ?`,
            en: `A class has ${total} students, of which ${num}/${den} are girls. How many girls are there in the class?`
        },
        {
            vi: `Một mảnh vườn có diện tích ${total} m², người ta dùng ${num}/${den} diện tích để trồng hoa. Hỏi diện tích trồng hoa là bao nhiêu m²?`,
            en: `A garden has an area of ${total} m², ${num}/${den} of the area is used to plant flowers. What is the area used for planting flowers in m²?`
        },
        {
            vi: `Một cửa hàng có ${total} kg gạo, đã bán được ${num}/${den} số gạo đó. Hỏi cửa hàng đã bán được bao nhiêu kg gạo?`,
            en: `A store has ${total} kg of rice, and sold ${num}/${den} of it. How many kg of rice did the store sell?`
        }
    ];
    
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const options = new Set<string>();
    options.add(answer.toString());
    while (options.size < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong > 0 && wrong !== answer) options.add(wrong.toString());
    }
    
    return {
        id: `frac-word-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? subject.en : language === 'vi-en' ? `${subject.vi} / ${subject.en}` : subject.vi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer.toString(),
        explanation: language === 'en' ? `${total} × ${num}/${den} = ${answer}` : language === 'vi-en' ? `${total} × ${num}/${den} = ${answer}` : `${total} × ${num}/${den} = ${answer}`
    };
}

function generateRoundingQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const places = [10, 100, 1000, 10000];
    if (gradeId >= 4) places.push(100000);
    const place = places[Math.floor(Math.random() * places.length)];
    
    let num = 0;
    if (place === 10) num = Math.floor(Math.random() * 900) + 100; // 100-999
    else if (place === 100) num = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    else if (place === 1000) num = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
    else if (place === 10000) num = Math.floor(Math.random() * 900000) + 100000; // 100000-999999
    else num = Math.floor(Math.random() * 9000000) + 1000000; // 1000000-9999999
    
    const answer = Math.round(num / place) * place;
    
    let placeNameVi = '';
    let placeNameEn = '';
    if (place === 10) { placeNameVi = 'chục'; placeNameEn = 'tens'; }
    else if (place === 100) { placeNameVi = 'trăm'; placeNameEn = 'hundreds'; }
    else if (place === 1000) { placeNameVi = 'nghìn'; placeNameEn = 'thousands'; }
    else if (place === 10000) { placeNameVi = 'mười nghìn'; placeNameEn = 'ten thousands'; }
    else if (place === 100000) { placeNameVi = 'trăm nghìn'; placeNameEn = 'hundred thousands'; }
    
    const textVi = `Làm tròn số ${num} đến hàng ${placeNameVi} thì được số nào?`;
    const textEn = `Round ${num} to the nearest ${placeNameEn}.`;
    
    const options = new Set<string>();
    options.add(answer.toString());
    
    while (options.size < 4) {
        const wrongAnswer = answer + (Math.floor(Math.random() * 5) - 2) * place;
        if (wrongAnswer > 0 && wrongAnswer !== answer) {
            options.add(wrongAnswer.toString());
        }
    }
    
    return {
        id: `round-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer.toString(),
        explanation: language === 'en' ? `${num} rounded to the nearest ${placeNameEn} is ${answer}.` : language === 'vi-en' ? `Làm tròn số ${num} đến hàng ${placeNameVi} ta được ${answer}. / ${num} rounded to the nearest ${placeNameEn} is ${answer}.` : `Làm tròn số ${num} đến hàng ${placeNameVi} ta được ${answer}.`
    };
}

function generateExpressionQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const hasParentheses = Math.random() > 0.5;
    const ops = ['+', '-', 'x', '/'];
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    
    let exprStr = '';
    let answer = 0;
    
    const evalOp = (a: number, op: string, b: number) => {
        if (op === '+') return a + b;
        if (op === '-') return a - b;
        if (op === 'x') return a * b;
        if (op === '/') return a / b;
        return 0;
    };
    
    let attempts = 0;
    let valid = false;
    let a = 0, b = 0, c = 0;
    
    while (!valid && attempts < 100) {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        c = Math.floor(Math.random() * 50) + 1;
        
        if (hasParentheses) {
            const parenPos = Math.random() > 0.5 ? 'left' : 'right';
            if (parenPos === 'left') {
                const res1 = evalOp(a, op1, b);
                if (res1 > 0 && Number.isInteger(res1)) {
                    if (op2 === '/' && res1 % c !== 0) { attempts++; continue; }
                    answer = evalOp(res1, op2, c);
                    if (answer > 0 && Number.isInteger(answer)) {
                        exprStr = `(${a} ${op1 === 'x' ? '×' : op1 === '/' ? ':' : op1} ${b}) ${op2 === 'x' ? '×' : op2 === '/' ? ':' : op2} ${c}`;
                        valid = true;
                    }
                }
            } else {
                const res1 = evalOp(b, op2, c);
                if (res1 > 0 && Number.isInteger(res1)) {
                    if (op1 === '/' && a % res1 !== 0) { attempts++; continue; }
                    answer = evalOp(a, op1, res1);
                    if (answer > 0 && Number.isInteger(answer)) {
                        exprStr = `${a} ${op1 === 'x' ? '×' : op1 === '/' ? ':' : op1} (${b} ${op2 === 'x' ? '×' : op2 === '/' ? ':' : op2} ${c})`;
                        valid = true;
                    }
                }
            }
        } else {
            if ((op1 === 'x' || op1 === '/') && (op2 === '+' || op2 === '-')) {
                if (op1 === '/' && a % b !== 0) { attempts++; continue; }
                const res1 = evalOp(a, op1, b);
                if (res1 > 0 && Number.isInteger(res1)) {
                    answer = evalOp(res1, op2, c);
                    if (answer > 0 && Number.isInteger(answer)) {
                        exprStr = `${a} ${op1 === 'x' ? '×' : op1 === '/' ? ':' : op1} ${b} ${op2} ${c}`;
                        valid = true;
                    }
                }
            } else if ((op1 === '+' || op1 === '-') && (op2 === 'x' || op2 === '/')) {
                if (op2 === '/' && b % c !== 0) { attempts++; continue; }
                const res1 = evalOp(b, op2, c);
                if (res1 > 0 && Number.isInteger(res1)) {
                    answer = evalOp(a, op1, res1);
                    if (answer > 0 && Number.isInteger(answer)) {
                        exprStr = `${a} ${op1} ${b} ${op2 === 'x' ? '×' : op2 === '/' ? ':' : op2} ${c}`;
                        valid = true;
                    }
                }
            } else {
                if (op1 === '/' && a % b !== 0) { attempts++; continue; }
                const res1 = evalOp(a, op1, b);
                if (res1 > 0 && Number.isInteger(res1)) {
                    if (op2 === '/' && res1 % c !== 0) { attempts++; continue; }
                    answer = evalOp(res1, op2, c);
                    if (answer > 0 && Number.isInteger(answer)) {
                        exprStr = `${a} ${op1 === 'x' ? '×' : op1 === '/' ? ':' : op1} ${b} ${op2 === 'x' ? '×' : op2 === '/' ? ':' : op2} ${c}`;
                        valid = true;
                    }
                }
            }
        }
        attempts++;
    }
    
    if (!valid) {
        exprStr = `10 + 5 × 2`;
        answer = 20;
    }
    
    const textVi = `Tính giá trị của biểu thức: ${exprStr}`;
    const textEn = `Evaluate the expression: ${exprStr}`;
    
    const options = new Set<string>();
    options.add(answer.toString());
    while (options.size < 4) {
        const wrong = answer + Math.floor(Math.random() * 20) - 10;
        if (wrong > 0 && wrong !== answer) options.add(wrong.toString());
    }
    
    return {
        id: `expr-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer.toString(),
        explanation: language === 'en' ? `${exprStr} = ${answer}` : language === 'vi-en' ? `${exprStr} = ${answer}` : `${exprStr} = ${answer}`
    };
}

function generateRomanNumeralQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const romanMap: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
        11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX'
    };
    
    const num = Math.floor(Math.random() * 20) + 1;
    const roman = romanMap[num];
    
    const isRomanToNum = Math.random() > 0.5;
    
    let textVi = '', textEn = '', answer = '';
    let options = new Set<string>();
    
    if (isRomanToNum) {
        textVi = `Chữ số La Mã ${roman} tương ứng với số tự nhiên nào?`;
        textEn = `What natural number does the Roman numeral ${roman} represent?`;
        answer = num.toString();
        options.add(answer);
        while (options.size < 4) {
            const wrong = num + Math.floor(Math.random() * 7) - 3;
            if (wrong > 0 && wrong <= 25 && wrong !== num) options.add(wrong.toString());
        }
    } else {
        textVi = `Số ${num} được viết bằng chữ số La Mã là gì?`;
        textEn = `How is the number ${num} written in Roman numerals?`;
        answer = roman;
        options.add(answer);
        while (options.size < 4) {
            const wrongNum = num + Math.floor(Math.random() * 7) - 3;
            if (wrongNum > 0 && wrongNum <= 25 && wrongNum !== num) {
                const wrongRoman = romanMap[wrongNum] || 'XX' + 'I'.repeat(wrongNum - 20);
                options.add(wrongRoman);
            }
        }
    }
    
    return {
        id: `roman-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: language === 'en' ? `${num} is written as ${roman}.` : language === 'vi-en' ? `Số ${num} được viết là ${roman}. / ${num} is written as ${roman}.` : `Số ${num} được viết là ${roman}.`
    };
}

function generateFractionOrderingQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const isSameDenominator = Math.random() > 0.5;
    const count = Math.floor(Math.random() * 2) + 3; // 3 or 4 fractions
    
    let fractions: {num: number, den: number, val: number}[] = [];
    
    if (isSameDenominator) {
        const den = Math.floor(Math.random() * 10) + 3;
        const nums = new Set<number>();
        while (nums.size < count) {
            nums.add(Math.floor(Math.random() * (den * 2)) + 1);
        }
        fractions = Array.from(nums).map(n => ({num: n, den: den, val: n/den}));
    } else {
        // One denominator divisible by others
        const baseDens = [2, 3, 4, 5];
        const baseDen = baseDens[Math.floor(Math.random() * baseDens.length)];
        const commonDen = baseDen * (Math.floor(Math.random() * 3) + 2); // e.g. 12
        
        const possibleDens = [commonDen];
        for (let i = 2; i <= commonDen / 2; i++) {
            if (commonDen % i === 0) possibleDens.push(i);
        }
        
        const usedVals = new Set<number>();
        let attempts = 0;
        while (fractions.length < count && attempts < 100) {
            const den = possibleDens[Math.floor(Math.random() * possibleDens.length)];
            const num = Math.floor(Math.random() * (den * 2)) + 1;
            const val = num / den;
            if (!usedVals.has(val)) {
                usedVals.add(val);
                fractions.push({num, den, val});
            }
            attempts++;
        }
        if (fractions.length < count) {
            // Fallback to same denominator
            const den = Math.floor(Math.random() * 10) + 3;
            const nums = new Set<number>();
            while (nums.size < count) {
                nums.add(Math.floor(Math.random() * (den * 2)) + 1);
            }
            fractions = Array.from(nums).map(n => ({num: n, den: den, val: n/den}));
        }
    }
    
    const formatFrac = (f: {num: number, den: number}) => `${f.num}/${f.den}`;
    const fracStrs = fractions.map(formatFrac);
    
    const questionType = Math.random(); // 0-0.5: sort, 0.5-1.0: largest/smallest
    
    if (questionType < 0.5) {
        // Sort
        const isAscending = Math.random() > 0.5;
        const sortedFractions = [...fractions].sort((a, b) => isAscending ? a.val - b.val : b.val - a.val);
        const answer = sortedFractions.map(formatFrac).join(', ');
        
        const textVi = `Sắp xếp các phân số sau theo thứ tự từ ${isAscending ? 'bé đến lớn' : 'lớn đến bé'}: ${fracStrs.join(', ')}`;
        const textEn = `Sort the following fractions in ${isAscending ? 'ascending' : 'descending'} order: ${fracStrs.join(', ')}`;
        
        const options = new Set<string>();
        options.add(answer);
        let attempts = 0;
        while (options.size < 4 && attempts < 50) {
            const shuffled = [...fractions].sort(() => Math.random() - 0.5);
            options.add(shuffled.map(formatFrac).join(', '));
            attempts++;
        }
        
        return {
            id: `frac-order-${index}`,
            type: 'multiple-choice',
            text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
            options: Array.from(options).sort(() => Math.random() - 0.5),
            correctAnswer: answer,
            explanation: language === 'en' ? `The correct order is ${answer}.` : language === 'vi-en' ? `Thứ tự đúng là ${answer}. / The correct order is ${answer}.` : `Thứ tự đúng là ${answer}.`
        };
    } else {
        // Largest/Smallest
        const findLargest = Math.random() < 0.5;
        const sortedFractions = [...fractions].sort((a, b) => findLargest ? b.val - a.val : a.val - b.val);
        const answer = formatFrac(sortedFractions[0]);
        
        const textVi = `Tìm phân số ${findLargest ? 'lớn nhất' : 'bé nhất'} trong các phân số sau: ${fracStrs.join(', ')}`;
        const textEn = `Find the ${findLargest ? 'largest' : 'smallest'} fraction among: ${fracStrs.join(', ')}`;
        
        const options = new Set<string>(fracStrs);
        
        return {
            id: `frac-minmax-${index}`,
            type: 'multiple-choice',
            text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
            options: Array.from(options).sort(() => Math.random() - 0.5),
            correctAnswer: answer,
            explanation: language === 'en' ? `The ${findLargest ? 'largest' : 'smallest'} fraction is ${answer}.` : language === 'vi-en' ? `Phân số ${findLargest ? 'lớn nhất' : 'bé nhất'} là ${answer}. / The ${findLargest ? 'largest' : 'smallest'} fraction is ${answer}.` : `Phân số ${findLargest ? 'lớn nhất' : 'bé nhất'} là ${answer}.`
        };
    }
}

function generateOrderingQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    // Fraction ordering for Grade 4
    if (gradeId === 4 && Math.random() < 0.5) {
        return generateFractionOrderingQuestion(gradeId, levelId, index, language);
    }

    const count = Math.floor(Math.random() * 2) + 3; // 3 or 4 numbers
    const maxVal = gradeId === 1 ? 100 : gradeId === 2 ? 1000 : gradeId === 3 ? 100000 : 10000000;
    
    const numbers = new Set<number>();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * maxVal));
    }
    const numList = Array.from(numbers);
    
    const isAscending = Math.random() > 0.5;
    const sortedList = [...numList].sort((a, b) => isAscending ? a - b : b - a);
    
    const textVi = `Sắp xếp các số sau theo thứ tự từ ${isAscending ? 'bé đến lớn' : 'lớn đến bé'}: ${numList.join(', ')}`;
    const textEn = `Sort the following numbers in ${isAscending ? 'ascending' : 'descending'} order: ${numList.join(', ')}`;
    
    const answer = sortedList.join(', ');
    
    // Generate options
    const options = new Set<string>();
    options.add(answer);
    
    let attempts = 0;
    while (options.size < 4 && attempts < 50) {
        const shuffled = [...numList].sort(() => Math.random() - 0.5);
        options.add(shuffled.join(', '));
        attempts++;
    }
    
    return {
        id: `order-${index}`,
        type: 'multiple-choice',
        text: language === 'en' ? textEn : language === 'vi-en' ? `${textVi} / ${textEn}` : textVi,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: language === 'en' ? `The correct order is ${answer}.` : language === 'vi-en' ? `Thứ tự đúng là ${answer}. / The correct order is ${answer}.` : `Thứ tự đúng là ${answer}.`
    };
}

function generateComparisonQuestion(gradeId: number, levelId: string, index: number, language: string): Question {
    const isHard = levelId === 'hard';
    const isMedium = levelId === 'medium';
    
    let leftValue = 0;
    let rightValue = 0;
    let leftStr = '';
    let rightStr = '';

    const compareExpressions = isHard || (isMedium && Math.random() > 0.5);

    const getExpression = () => {
        let operations = ['+', '-'];
        if (gradeId >= 2) operations.push('x', '/');
        const operator = operations[Math.floor(Math.random() * operations.length)];
        
        let num1 = 0, num2 = 0, answer = 0;
        if (operator === '+') {
            [num1, num2, answer] = getAdditionNumbers(gradeId, isHard, isMedium);
        } else if (operator === '-') {
            [num1, num2, answer] = getSubtractionNumbers(gradeId, isHard, isMedium);
        } else if (operator === 'x') {
            const max1 = gradeId === 2 ? 5 : gradeId === 3 ? 10 : gradeId === 4 ? 100 : 1000;
            const max2 = gradeId === 2 ? 10 : gradeId === 3 ? 100 : gradeId === 4 ? 100 : 100;
            num1 = Math.floor(Math.random() * max1) + 2;
            num2 = Math.floor(Math.random() * max2) + 2;
            answer = num1 * num2;
        } else if (operator === '/') {
            const divisor = gradeId === 2 ? (Math.floor(Math.random() * 4) + 2) : gradeId === 3 ? (Math.floor(Math.random() * 9) + 2) : (Math.floor(Math.random() * 90) + 10);
            const quotient = gradeId === 2 ? (Math.floor(Math.random() * 10) + 1) : gradeId === 3 ? (Math.floor(Math.random() * 50) + 1) : (Math.floor(Math.random() * 100) + 1);
            num1 = divisor * quotient;
            num2 = divisor;
            answer = quotient;
        }
        
        let opStr = operator;
        if (operator === 'x') opStr = '×';
        if (operator === '/') opStr = ':';
        
        return { str: `${num1} ${opStr} ${num2}`, val: answer };
    };

    if (compareExpressions) {
        const left = getExpression();
        leftValue = left.val;
        leftStr = left.str;
        
        if (Math.random() < 0.3) {
            rightValue = leftValue;
            rightStr = `${rightValue}`;
        } else if (Math.random() < 0.5) {
            const right = getExpression();
            rightValue = right.val;
            rightStr = right.str;
        } else {
            rightValue = leftValue + Math.floor(Math.random() * 5) - 2;
            if (rightValue < 0) rightValue = leftValue + 1;
            rightStr = `${rightValue}`;
        }
    } else {
        const max = gradeId === 1 ? (isHard ? 100 : 20) : gradeId === 2 ? (isHard ? 1000 : 100) : gradeId === 3 ? (isHard ? 10000 : 1000) : (isHard ? 100000 : 10000);
        leftValue = Math.floor(Math.random() * max) + 1;
        rightValue = leftValue + Math.floor(Math.random() * 10) - 5;
        if (rightValue <= 0) rightValue = leftValue + 1;
        
        if (Math.random() < 0.3) {
            rightValue = leftValue;
        }
        
        leftStr = `${leftValue}`;
        rightStr = `${rightValue}`;
    }

    let answer = '';
    let explanation = '';
    let explanationEn = '';
    
    if (leftValue > rightValue) {
        answer = '>';
        explanation = `Ta có ${leftStr} = ${leftValue} và ${rightStr} = ${rightValue}. Vì ${leftValue} > ${rightValue} nên điền dấu >.`;
        explanationEn = `We have ${leftStr} = ${leftValue} and ${rightStr} = ${rightValue}. Because ${leftValue} > ${rightValue}, we use >.`;
    } else if (leftValue < rightValue) {
        answer = '<';
        explanation = `Ta có ${leftStr} = ${leftValue} và ${rightStr} = ${rightValue}. Vì ${leftValue} < ${rightValue} nên điền dấu <.`;
        explanationEn = `We have ${leftStr} = ${leftValue} and ${rightStr} = ${rightValue}. Because ${leftValue} < ${rightValue}, we use <.`;
    } else {
        answer = '=';
        explanation = `Ta có ${leftStr} = ${leftValue} và ${rightStr} = ${rightValue}. Vì ${leftValue} = ${rightValue} nên điền dấu =.`;
        explanationEn = `We have ${leftStr} = ${leftValue} and ${rightStr} = ${rightValue}. Because ${leftValue} = ${rightValue}, we use =.`;
    }
    
    if (!compareExpressions || (leftStr === `${leftValue}` && rightStr === `${rightValue}`)) {
        if (leftValue > rightValue) {
            explanation = `Vì ${leftValue} lớn hơn ${rightValue} nên điền dấu >.`;
            explanationEn = `Because ${leftValue} is greater than ${rightValue}, we use >.`;
        } else if (leftValue < rightValue) {
            explanation = `Vì ${leftValue} bé hơn ${rightValue} nên điền dấu <.`;
            explanationEn = `Because ${leftValue} is less than ${rightValue}, we use <.`;
        } else {
            explanation = `Vì ${leftValue} bằng ${rightValue} nên điền dấu =.`;
            explanationEn = `Because ${leftValue} is equal to ${rightValue}, we use =.`;
        }
    }

    const qText = `Chọn dấu thích hợp điền vào chỗ chấm:`;
    const qTextEn = `Choose the appropriate sign to fill in the blank:`;

    const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText}\n\n${qTextEn}` : qText;
    const finalQExpl = language === 'en' ? explanationEn : language === 'vi-en' ? `${explanation} / ${explanationEn}` : explanation;

    return {
        id: `comp-${index}`,
        type: 'comparison',
        text: finalQText,
        leftStr: leftStr,
        rightStr: rightStr,
        correctAnswer: answer,
        explanation: finalQExpl
    };
}

function generateArithmeticQuestion(gradeId: number, levelId: string, type: QuestionType, index: number, language: string): Question {
  let num1 = 0, num2 = 0, answer = 0, text = '', textEn = '', explanation = '', explanationEn = '';
  
  // Determine operations based on grade
  let operations = ['+', '-'];
  if (gradeId >= 2) operations.push('x', '/');
  
  const operator = operations[Math.floor(Math.random() * operations.length)];
  const isHard = levelId === 'hard';
  const isMedium = levelId === 'medium';
  
  // 40% chance of being a word problem
  const isWordProblem = Math.random() < 0.4;
  
  // 30% chance to have 2 operations for grade 2 and above, or grade 1 hard
  const hasTwoOperations = (gradeId >= 2 || (gradeId === 1 && isHard)) && Math.random() < 0.3;

  if (hasTwoOperations) {
      let num3 = 0;
      let operator2 = operations[Math.floor(Math.random() * operations.length)];
      
      // Generate first part
      if (operator === '+') {
          [num1, num2, answer] = getAdditionNumbers(gradeId, isHard, isMedium);
      } else if (operator === '-') {
          [num1, num2, answer] = getSubtractionNumbers(gradeId, isHard, isMedium);
      } else if (operator === 'x') {
          const max1 = gradeId === 2 ? 5 : gradeId === 3 ? 10 : gradeId === 4 ? 100 : 1000;
          const max2 = gradeId === 2 ? 10 : gradeId === 3 ? 100 : gradeId === 4 ? 100 : 100;
          num1 = Math.floor(Math.random() * max1) + 2;
          num2 = Math.floor(Math.random() * max2) + 2;
          answer = num1 * num2;
      } else if (operator === '/') {
          const divisor = gradeId === 2 ? (Math.floor(Math.random() * 4) + 2) : gradeId === 3 ? (Math.floor(Math.random() * 9) + 2) : (Math.floor(Math.random() * 90) + 10);
          const quotient = gradeId === 2 ? (Math.floor(Math.random() * 10) + 1) : gradeId === 3 ? (Math.floor(Math.random() * 50) + 1) : (Math.floor(Math.random() * 100) + 1);
          num1 = divisor * quotient;
          num2 = divisor;
          answer = quotient;
      }

      // Generate second part based on the intermediate answer
      let finalAnswer = 0;
      if (operator2 === '+') {
          const maxAdd = gradeId === 1 ? 20 : gradeId === 2 ? 100 : 1000;
          num3 = Math.floor(Math.random() * maxAdd) + 1;
          finalAnswer = answer + num3;
      } else if (operator2 === '-') {
          num3 = Math.floor(Math.random() * answer); // Ensure positive result
          finalAnswer = answer - num3;
      } else if (operator2 === 'x') {
          const maxMult = gradeId === 2 ? 5 : 10;
          num3 = Math.floor(Math.random() * maxMult) + 1;
          finalAnswer = answer * num3;
      } else if (operator2 === '/') {
          // To ensure clean division, we need to adjust the intermediate answer
          // This is complex, so for simplicity, if it's division, we just do addition/subtraction instead
          const fallbackOp = (answer > 0 && Math.random() > 0.5) ? '-' : '+';
          operator2 = fallbackOp; // Update operator2 to the fallback operator
          if (fallbackOp === '+') {
              num3 = Math.floor(Math.random() * 20) + 1;
              finalAnswer = answer + num3;
          } else {
              num3 = Math.floor(Math.random() * answer) + 1;
              finalAnswer = answer - num3;
          }
      }

      let opStr1 = operator === 'x' ? '×' : operator === '/' ? ':' : operator;
      let opStr2 = operator2 === 'x' ? '×' : operator2 === '/' ? ':' : operator2;
      
      // Handle order of operations formatting (basic left-to-right for simplicity here, 
      // actual math rules apply but we construct it so left-to-right works or we add parentheses)
      const needsParentheses = (operator === '+' || operator === '-') && (operator2 === 'x' || operator2 === '/');
      
      if (isWordProblem) {
          const names = ['Việt', 'Mai', 'Nam', 'Hoa', 'Rô-bốt', 'Mi', 'Khoa'];
          const name1 = names[Math.floor(Math.random() * names.length)];
          let name2 = names[Math.floor(Math.random() * names.length)];
          while (name1 === name2) name2 = names[Math.floor(Math.random() * names.length)];
          let name3 = names[Math.floor(Math.random() * names.length)];
          while (name3 === name1 || name3 === name2) name3 = names[Math.floor(Math.random() * names.length)];
          
          const items = [
              { vi: 'quyển vở', en: 'notebooks' },
              { vi: 'viên bi', en: 'marbles' },
              { vi: 'quả táo', en: 'apples' },
              { vi: 'bông hoa', en: 'flowers' },
              { vi: 'chiếc kẹo', en: 'candies' },
              { vi: 'chiếc bút', en: 'pens' }
          ];
          const item = items[Math.floor(Math.random() * items.length)];

          // Construct a 2-step word problem
          let part1Vi = '', part1En = '';
          if (operator === '+') {
              part1Vi = `${name1} có ${num1} ${item.vi}, ${name2} cho ${name1} thêm ${num2} ${item.vi}.`;
              part1En = `${name1} has ${num1} ${item.en}, ${name2} gives ${name1} ${num2} more ${item.en}.`;
          } else if (operator === '-') {
              part1Vi = `${name1} có ${num1} ${item.vi}, ${name1} cho ${name2} ${num2} ${item.vi}.`;
              part1En = `${name1} has ${num1} ${item.en}, ${name1} gives ${name2} ${num2} ${item.en}.`;
          } else if (operator === 'x') {
              part1Vi = `${name1} mua ${num2} hộp ${item.vi}, mỗi hộp có ${num1} ${item.vi}.`;
              part1En = `${name1} buys ${num2} boxes of ${item.en}, each box has ${num1} ${item.en}.`;
          } else if (operator === '/') {
              part1Vi = `${name1} có ${num1} ${item.vi} chia đều vào ${num2} hộp.`;
              part1En = `${name1} has ${num1} ${item.en} divided equally into ${num2} boxes.`;
          }

          let part2Vi = '', part2En = '';
          if (operator2 === '+') {
              part2Vi = `Sau đó ${name3} lại cho ${name1} thêm ${num3} ${item.vi} nữa. Hỏi cuối cùng ${name1} có tất cả bao nhiêu ${item.vi}?`;
              part2En = `Then ${name3} gives ${name1} ${num3} more ${item.en}. How many ${item.en} does ${name1} have in total?`;
          } else if (operator2 === '-') {
              part2Vi = `Sau đó ${name1} lại cho ${name3} ${num3} ${item.vi}. Hỏi cuối cùng ${name1} còn lại bao nhiêu ${item.vi}?`;
              part2En = `Then ${name1} gives ${name3} ${num3} ${item.en}. How many ${item.en} does ${name1} have left?`;
          } else if (operator2 === 'x') {
              part2Vi = `Nếu số ${item.vi} đó gấp lên ${num3} lần thì được bao nhiêu ${item.vi}?`;
              part2En = `If that number of ${item.en} is multiplied by ${num3}, how many ${item.en} are there?`;
          } else if (operator2 === '/') {
              part2Vi = `Nếu chia đều số ${item.vi} đó cho ${num3} bạn thì mỗi bạn được bao nhiêu ${item.vi}?`;
              part2En = `If that number of ${item.en} is divided equally among ${num3} friends, how many ${item.en} does each friend get?`;
          }

          text = `${part1Vi} ${part2Vi}`;
          textEn = `${part1En} ${part2En}`;
          
          if (needsParentheses) {
              explanation = `Bước 1: ${num1} ${opStr1} ${num2} = ${answer}. Bước 2: ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
              explanationEn = `Step 1: ${num1} ${opStr1} ${num2} = ${answer}. Step 2: ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
          } else {
              explanation = `Ta có phép tính: ${num1} ${opStr1} ${num2} ${opStr2} ${num3} = ${finalAnswer}.`;
              explanationEn = `We have: ${num1} ${opStr1} ${num2} ${opStr2} ${num3} = ${finalAnswer}.`;
          }
      } else {
          if (needsParentheses) {
              text = `(${num1} ${opStr1} ${num2}) ${opStr2} ${num3} = ?`;
              textEn = `(${num1} ${opStr1} ${num2}) ${opStr2} ${num3} = ?`;
              explanation = `Thực hiện trong ngoặc trước: ${num1} ${opStr1} ${num2} = ${answer}. Sau đó: ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
              explanationEn = `Calculate inside parentheses first: ${num1} ${opStr1} ${num2} = ${answer}. Then: ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
          } else {
              text = `${num1} ${opStr1} ${num2} ${opStr2} ${num3} = ?`;
              textEn = `${num1} ${opStr1} ${num2} ${opStr2} ${num3} = ?`;
              explanation = `Thực hiện từ trái sang phải (hoặc nhân chia trước cộng trừ sau): ${num1} ${opStr1} ${num2} = ${answer}, tiếp theo ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
              explanationEn = `Calculate step by step: ${num1} ${opStr1} ${num2} = ${answer}, then ${answer} ${opStr2} ${num3} = ${finalAnswer}.`;
          }
      }
      
      answer = finalAnswer;

  } else {
      // Generate numbers based on grade and operation (Single operation)
      if (operator === '+') {
          [num1, num2, answer] = getAdditionNumbers(gradeId, isHard, isMedium);
      } else if (operator === '-') {
          [num1, num2, answer] = getSubtractionNumbers(gradeId, isHard, isMedium);
      } else if (operator === 'x') {
          const max1 = gradeId === 2 ? 5 : gradeId === 3 ? 10 : gradeId === 4 ? 100 : 1000;
          const max2 = gradeId === 2 ? 10 : gradeId === 3 ? 100 : gradeId === 4 ? 100 : 100;
          num1 = Math.floor(Math.random() * max1) + 2;
          num2 = Math.floor(Math.random() * max2) + 2;
          answer = num1 * num2;
      } else if (operator === '/') {
          const divisor = gradeId === 2 ? (Math.floor(Math.random() * 4) + 2) : gradeId === 3 ? (Math.floor(Math.random() * 9) + 2) : (Math.floor(Math.random() * 90) + 10);
          const quotient = gradeId === 2 ? (Math.floor(Math.random() * 10) + 1) : gradeId === 3 ? (Math.floor(Math.random() * 50) + 1) : (Math.floor(Math.random() * 100) + 1);
          num1 = divisor * quotient;
          num2 = divisor;
          answer = quotient;
      }

      if (isWordProblem) {
          const names = ['Việt', 'Mai', 'Nam', 'Hoa', 'Rô-bốt', 'Mi', 'Khoa'];
          const name1 = names[Math.floor(Math.random() * names.length)];
          let name2 = names[Math.floor(Math.random() * names.length)];
          while (name1 === name2) name2 = names[Math.floor(Math.random() * names.length)];
          
          const items = [
              { vi: 'quyển vở', en: 'notebooks' },
              { vi: 'viên bi', en: 'marbles' },
              { vi: 'quả táo', en: 'apples' },
              { vi: 'bông hoa', en: 'flowers' },
              { vi: 'chiếc kẹo', en: 'candies' },
              { vi: 'chiếc bút', en: 'pens' }
          ];
          const item = items[Math.floor(Math.random() * items.length)];

          if (operator === '+') {
              text = `${name1} có ${num1} ${item.vi}, ${name2} cho ${name1} thêm ${num2} ${item.vi}. Hỏi ${name1} có tất cả bao nhiêu ${item.vi}?`;
              textEn = `${name1} has ${num1} ${item.en}, ${name2} gives ${name1} ${num2} more ${item.en}. How many ${item.en} does ${name1} have in total?`;
              explanation = `Ta có phép tính: ${num1} + ${num2} = ${answer}.`;
              explanationEn = `We have: ${num1} + ${num2} = ${answer}.`;
          } else if (operator === '-') {
              text = `${name1} có ${num1} ${item.vi}, ${name1} cho ${name2} ${num2} ${item.vi}. Hỏi ${name1} còn lại bao nhiêu ${item.vi}?`;
              textEn = `${name1} has ${num1} ${item.en}, ${name1} gives ${name2} ${num2} ${item.en}. How many ${item.en} does ${name1} have left?`;
              explanation = `Ta có phép tính: ${num1} - ${num2} = ${answer}.`;
              explanationEn = `We have: ${num1} - ${num2} = ${answer}.`;
          } else if (operator === 'x') {
              text = `Mỗi hộp có ${num1} ${item.vi}. Hỏi ${num2} hộp như thế có tất cả bao nhiêu ${item.vi}?`;
              textEn = `Each box has ${num1} ${item.en}. How many ${item.en} are there in ${num2} such boxes?`;
              explanation = `Ta có phép tính: ${num1} x ${num2} = ${answer}.`;
              explanationEn = `We have: ${num1} x ${num2} = ${answer}.`;
          } else if (operator === '/') {
              text = `${name1} có ${num1} ${item.vi} chia đều vào ${num2} hộp. Hỏi mỗi hộp có bao nhiêu ${item.vi}?`;
              textEn = `${name1} has ${num1} ${item.en} divided equally into ${num2} boxes. How many ${item.en} are in each box?`;
              explanation = `Ta có phép tính: ${num1} : ${num2} = ${answer}.`;
              explanationEn = `We have: ${num1} : ${num2} = ${answer}.`;
          }
      } else {
          let opStr = operator;
          if (operator === 'x') opStr = '×';
          if (operator === '/') opStr = ':';
          
          text = `${num1} ${opStr} ${num2} = ?`;
          textEn = `${num1} ${opStr} ${num2} = ?`;
          
          if (operator === '+') {
              explanation = `${num1} cộng ${num2} bằng ${answer}.`;
              explanationEn = `${num1} plus ${num2} equals ${answer}.`;
          } else if (operator === '-') {
              explanation = `${num1} trừ ${num2} bằng ${answer}.`;
              explanationEn = `${num1} minus ${num2} equals ${answer}.`;
          } else if (operator === 'x') {
              explanation = `${num1} nhân ${num2} bằng ${answer}.`;
              explanationEn = `${num1} times ${num2} equals ${answer}.`;
          } else if (operator === '/') {
              explanation = `${num1} chia ${num2} bằng ${answer}.`;
              explanationEn = `${num1} divided by ${num2} equals ${answer}.`;
          }
      }
  }

  const finalQText = language === 'en' ? textEn : language === 'vi-en' ? `${text} / ${textEn}` : text;
  const finalQExpl = language === 'en' ? explanationEn : language === 'vi-en' ? `${explanation} / ${explanationEn}` : explanation;

  if (type === 'true-false') {
    const isCorrect = Math.random() > 0.5;
    const displayedAnswer = isCorrect ? answer : answer + Math.floor(Math.random() * 5) + 1;
    
    const tfText = language === 'en' ? `TRUE or FALSE?\n\nQuestion: ${textEn}\nAnswer: ${displayedAnswer}` :
                   language === 'vi-en' ? `ĐÚNG hay SAI? / TRUE or FALSE?\n\nHỏi/Question: ${text} / ${textEn}\nĐáp án/Answer: ${displayedAnswer}` :
                   `ĐÚNG hay SAI?\n\nHỏi: ${text}\nĐáp án: ${displayedAnswer}`;
                  
    const expl = isCorrect 
      ? (language === 'en' ? 'The statement is correct.' : language === 'vi-en' ? 'Khẳng định đúng. / The statement is correct.' : 'Khẳng định đúng.')
      : (language === 'en' ? `Incorrect, the correct answer is ${answer}.` : language === 'vi-en' ? `Sai rồi, kết quả đúng là ${answer}. / Incorrect, the correct answer is ${answer}.` : `Sai rồi, kết quả đúng là ${answer}.`);

    return {
      id: `arith-${index}`,
      type: 'true-false',
      text: tfText,
      correctAnswer: isCorrect ? 'true' : 'false',
      explanation: expl
    };
  }

  if (type === 'fill-in-blank' || type === 'short-answer') {
    return {
      id: `arith-${index}`,
      type: type,
      text: finalQText,
      correctAnswer: answer.toString(),
      explanation: finalQExpl,
      placeholder: language === 'en' ? 'Enter number...' : language === 'vi-en' ? 'Nhập số... / Enter number...' : 'Nhập số...'
    };
  }

  if (type === 'matching') {
      // Generate 4 pairs with unique answers
      const pairs: { left: string, right: string }[] = [];
      const usedAnswers = new Set<string>();
      
      while (pairs.length < 4) {
          let pNum1 = 0, pNum2 = 0, pAnswer = 0;
          if (operator === '+') {
              [pNum1, pNum2, pAnswer] = getAdditionNumbers(gradeId, levelId === 'hard', levelId === 'medium');
          } else if (operator === '-') {
              [pNum1, pNum2, pAnswer] = getSubtractionNumbers(gradeId, levelId === 'hard', levelId === 'medium');
          } else if (operator === 'x') {
              pNum1 = Math.floor(Math.random() * 9) + 2;
              pNum2 = Math.floor(Math.random() * 9) + 2;
              pAnswer = pNum1 * pNum2;
          } else if (operator === '/') {
              const pDivisor = Math.floor(Math.random() * 9) + 2;
              const pQuotient = Math.floor(Math.random() * 9) + 2;
              pNum1 = pDivisor * pQuotient;
              pNum2 = pDivisor;
              pAnswer = pQuotient;
          }
          
          const answerStr = `${pAnswer}`;
          if (!usedAnswers.has(answerStr)) {
              usedAnswers.add(answerStr);
              let opStr = operator;
              if (operator === 'x') opStr = '×';
              if (operator === '/') opStr = ':';
              
              pairs.push({ left: `${pNum1} ${opStr} ${pNum2}`, right: answerStr });
          }
      }
      
      const mText = language === 'en' ? 'Match the calculation with the correct answer:' :
                    language === 'vi-en' ? 'Hãy ghép phép tính với đáp án đúng: / Match the calculation with the correct answer:' :
                    'Hãy ghép phép tính với đáp án đúng:';
      const mExpl = language === 'en' ? 'You matched all pairs correctly!' :
                    language === 'vi-en' ? 'Bạn đã ghép đúng tất cả các cặp! / You matched all pairs correctly!' :
                    'Bạn đã ghép đúng tất cả các cặp!';
                    
      return {
          id: `arith-${index}`,
          type: 'matching',
          text: mText,
          correctAnswer: 'matching',
          explanation: mExpl,
          pairs: pairs
      };
  }

  // Generate options for multiple choice
  const options = new Set<string>();
  options.add(answer.toString());
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) + 1;
    const isPlus = Math.random() > 0.5;
    const wrongAnswer = isPlus ? answer + offset : answer - offset;
    if (wrongAnswer >= 0) {
      options.add(wrongAnswer.toString());
    }
  }

  return {
    id: `arith-${index}`,
    type: 'multiple-choice',
    text: finalQText,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    correctAnswer: answer.toString(),
    explanation: finalQExpl
  };
}

function generateGeometryQuestion(gradeId: number, levelId: string, type: QuestionType, index: number, language: string): Question {
  // SVG Data URIs for basic shapes
  const squareSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="%234f46e5" stroke="%23312e81" stroke-width="4"/></svg>`;
  const triangleSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="75,25 125,125 25,125" fill="%2310b981" stroke="%23047857" stroke-width="4"/></svg>`;
  const circleSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="50" fill="%23f59e0b" stroke="%23b45309" stroke-width="4"/></svg>`;
  const rectangleSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="40" width="120" height="70" fill="%23ef4444" stroke="%23991b1b" stroke-width="4"/></svg>`;
  const rightAngleSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><polyline points="25,25 25,125 125,125" fill="none" stroke="%233b82f6" stroke-width="6"/><rect x="25" y="105" width="20" height="20" fill="none" stroke="%233b82f6" stroke-width="2"/></svg>`;
  const parallelSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><line x1="25" y1="50" x2="125" y2="50" stroke="%238b5cf6" stroke-width="6"/><line x1="25" y1="100" x2="125" y2="100" stroke="%238b5cf6" stroke-width="6"/></svg>`;

  const isDynamic = Math.random() > 0.4;
  if (isDynamic) {
      if (gradeId <= 3 && Math.random() > 0.3) {
          const types = [
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="75" y1="25" x2="75" y2="125" stroke="%23333" stroke-width="4"/><line x1="25" y1="75" x2="125" y2="75" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'square',
                  answer: 5,
                  explVi: 'Có 4 hình vuông nhỏ và 1 hình vuông lớn bao ngoài. Tổng cộng 5 hình vuông.',
                  explEn: 'There are 4 small squares and 1 large outer square. Total 5 squares.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="40" width="120" height="70" fill="none" stroke="%23333" stroke-width="4"/><line x1="75" y1="40" x2="75" y2="110" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'rectangle',
                  answer: 3,
                  explVi: 'Có 2 hình chữ nhật nhỏ và 1 hình chữ nhật lớn bao ngoài. Tổng cộng 3 hình chữ nhật.',
                  explEn: 'There are 2 small rectangles and 1 large outer rectangle. Total 3 rectangles.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="25" y1="25" x2="125" y2="125" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'triangle',
                  answer: 2,
                  explVi: 'Đường chéo chia hình vuông thành 2 hình tam giác.',
                  explEn: 'The diagonal divides the square into 2 triangles.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="25" y1="25" x2="125" y2="125" stroke="%23333" stroke-width="4"/><line x1="125" y1="25" x2="25" y2="125" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'triangle',
                  answer: 8,
                  explVi: 'Có 4 hình tam giác nhỏ và 4 hình tam giác lớn (ghép từ 2 hình nhỏ). Tổng cộng 8 hình tam giác.',
                  explEn: 'There are 4 small triangles and 4 large triangles (made of 2 small ones). Total 8 triangles.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="75,25 125,111.6 25,111.6" fill="none" stroke="%23333" stroke-width="4"/><polygon points="100,68.3 50,68.3 75,111.6" fill="none" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'triangle',
                  answer: 5,
                  explVi: 'Có 4 hình tam giác nhỏ và 1 hình tam giác lớn bao ngoài. Tổng cộng 5 hình tam giác.',
                  explEn: 'There are 4 small triangles and 1 large outer triangle. Total 5 triangles.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="40" width="120" height="70" fill="none" stroke="%23333" stroke-width="4"/><line x1="55" y1="40" x2="55" y2="110" stroke="%23333" stroke-width="4"/><line x1="95" y1="40" x2="95" y2="110" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'rectangle',
                  answer: 6,
                  explVi: 'Có 3 hình nhỏ, 2 hình ghép đôi và 1 hình lớn. Tổng cộng 6 hình chữ nhật.',
                  explEn: 'There are 3 small, 2 double, and 1 large rectangle. Total 6 rectangles.'
              },
              {
                  svg: `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="75" y1="25" x2="75" y2="125" stroke="%23333" stroke-width="4"/><line x1="25" y1="75" x2="125" y2="75" stroke="%23333" stroke-width="4"/></svg>`,
                  target: 'rectangle',
                  answer: 9,
                  explVi: 'Có 4 hình vuông nhỏ, 4 hình chữ nhật ghép đôi và 1 hình vuông lớn (hình vuông cũng là hình chữ nhật). Tổng cộng 9 hình chữ nhật.',
                  explEn: 'There are 4 small squares, 4 double rectangles, and 1 large square (a square is a rectangle). Total 9 rectangles.'
              }
          ];
          
          let availableTypes = [];
          if (gradeId === 1) availableTypes = [0, 1, 2];
          else if (gradeId === 2) availableTypes = [0, 1, 2, 3, 4, 5];
          else availableTypes = [0, 1, 2, 3, 4, 5, 6];
          
          const selectedTypeIndex = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          const selectedType = types[selectedTypeIndex];
          
          let targetNameVi = '', targetNameEn = '';
          if (selectedType.target === 'square') {
              targetNameVi = 'hình vuông';
              targetNameEn = 'squares';
          } else if (selectedType.target === 'rectangle') {
              targetNameVi = 'hình chữ nhật';
              targetNameEn = 'rectangles';
          } else if (selectedType.target === 'triangle') {
              targetNameVi = 'hình tam giác';
              targetNameEn = 'triangles';
          }
          
          const qText = `Hình bên có bao nhiêu ${targetNameVi}?`;
          const qTextEn = `How many ${targetNameEn} are in the image?`;
          
          const answer = selectedType.answer.toString();
          const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
          const finalQExpl = language === 'en' ? selectedType.explEn : language === 'vi-en' ? `${selectedType.explVi} / ${selectedType.explEn}` : selectedType.explVi;
          
          const options = new Set<string>();
          options.add(answer);
          while (options.size < 4) {
              const wrongVal = selectedType.answer + Math.floor(Math.random() * 5) - 2;
              if (wrongVal > 0 && wrongVal !== selectedType.answer) {
                  options.add(wrongVal.toString());
              }
          }
          
          return {
              id: `geom-dyn-count-${index}`,
              type: 'multiple-choice',
              text: finalQText,
              imageUrl: `data:image/svg+xml;utf8,${selectedType.svg}`,
              options: Array.from(options).sort(() => Math.random() - 0.5),
              correctAnswer: answer,
              explanation: finalQExpl
          };
      }

      let qText = '', qTextEn = '', answer = '', expl = '', explEn = '';
      
      if (gradeId === 3) {
          const qType = Math.floor(Math.random() * 4);
          if (qType === 0) {
              const l = Math.floor(Math.random() * 10) + 5;
              const w = Math.floor(Math.random() * 4) + 1;
              const p = (l + w) * 2;
              qText = `Hình chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm. Chu vi là bao nhiêu?`;
              qTextEn = `A rectangle has length ${l}cm, width ${w}cm. What is its perimeter?`;
              answer = `${p}cm`;
              expl = `(${l} + ${w}) x 2 = ${p} (cm).`;
              explEn = `(${l} + ${w}) x 2 = ${p} (cm).`;
          } else if (qType === 1) {
              const l = Math.floor(Math.random() * 10) + 5;
              const w = Math.floor(Math.random() * 4) + 1;
              const a = l * w;
              qText = `Hình chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A rectangle has length ${l}cm, width ${w}cm. What is its area?`;
              answer = `${a}cm²`;
              expl = `${l} x ${w} = ${a} (cm²).`;
              explEn = `${l} x ${w} = ${a} (cm²).`;
          } else if (qType === 2) {
              const a = Math.floor(Math.random() * 10) + 3;
              const p = a * 4;
              qText = `Hình vuông có cạnh ${a}cm. Chu vi là bao nhiêu?`;
              qTextEn = `A square has side ${a}cm. What is its perimeter?`;
              answer = `${p}cm`;
              expl = `${a} x 4 = ${p} (cm).`;
              explEn = `${a} x 4 = ${p} (cm).`;
          } else {
              const a = Math.floor(Math.random() * 10) + 3;
              const area = a * a;
              qText = `Hình vuông có cạnh ${a}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A square has side ${a}cm. What is its area?`;
              answer = `${area}cm²`;
              expl = `${a} x ${a} = ${area} (cm²).`;
              explEn = `${a} x ${a} = ${area} (cm²).`;
          }
      } else if (gradeId === 4) {
          const qType = Math.floor(Math.random() * 2);
          if (qType === 0) {
              const b = Math.floor(Math.random() * 20) + 5;
              const h = Math.floor(Math.random() * 10) + 3;
              const a = b * h;
              qText = `Hình bình hành có độ dài đáy ${b}cm, chiều cao ${h}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A parallelogram has a base of ${b}cm and a height of ${h}cm. What is its area?`;
              answer = `${a}cm²`;
              expl = `${b} x ${h} = ${a} (cm²).`;
              explEn = `${b} x ${h} = ${a} (cm²).`;
          } else {
              const d1 = (Math.floor(Math.random() * 10) + 3) * 2;
              const d2 = (Math.floor(Math.random() * 10) + 3) * 2;
              const a = (d1 * d2) / 2;
              qText = `Hình thoi có độ dài hai đường chéo là ${d1}cm và ${d2}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A rhombus has diagonals of ${d1}cm and ${d2}cm. What is its area?`;
              answer = `${a}cm²`;
              expl = `(${d1} x ${d2}) : 2 = ${a} (cm²).`;
              explEn = `(${d1} x ${d2}) : 2 = ${a} (cm²).`;
          }
      } else if (gradeId === 5) {
          const qType = Math.floor(Math.random() * 4);
          if (qType === 0) {
              const b = (Math.floor(Math.random() * 10) + 3) * 2;
              const h = Math.floor(Math.random() * 10) + 3;
              const a = (b * h) / 2;
              qText = `Hình tam giác có độ dài đáy ${b}cm, chiều cao ${h}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A triangle has a base of ${b}cm and a height of ${h}cm. What is its area?`;
              answer = `${a}cm²`;
              expl = `(${b} x ${h}) : 2 = ${a} (cm²).`;
              explEn = `(${b} x ${h}) : 2 = ${a} (cm²).`;
          } else if (qType === 1) {
              const b1 = Math.floor(Math.random() * 10) + 5;
              const b2 = Math.floor(Math.random() * 5) + 2;
              const h = (Math.floor(Math.random() * 5) + 2) * 2;
              const a = ((b1 + b2) * h) / 2;
              qText = `Hình thang có độ dài hai đáy lần lượt là ${b1}cm và ${b2}cm, chiều cao ${h}cm. Diện tích là bao nhiêu?`;
              qTextEn = `A trapezoid has bases of ${b1}cm and ${b2}cm, and a height of ${h}cm. What is its area?`;
              answer = `${a}cm²`;
              expl = `(${b1} + ${b2}) x ${h} : 2 = ${a} (cm²).`;
              explEn = `(${b1} + ${b2}) x ${h} : 2 = ${a} (cm²).`;
          } else if (qType === 2) {
              const l = Math.floor(Math.random() * 5) + 3;
              const w = Math.floor(Math.random() * 3) + 2;
              const h = Math.floor(Math.random() * 4) + 2;
              const v = l * w * h;
              qText = `Hình hộp chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm, chiều cao ${h}cm. Thể tích là bao nhiêu?`;
              qTextEn = `A rectangular prism has length ${l}cm, width ${w}cm, height ${h}cm. What is its volume?`;
              answer = `${v}cm³`;
              expl = `${l} x ${w} x ${h} = ${v} (cm³).`;
              explEn = `${l} x ${w} x ${h} = ${v} (cm³).`;
          } else {
              const a = Math.floor(Math.random() * 5) + 2;
              const v = a * a * a;
              qText = `Hình lập phương có cạnh ${a}cm. Thể tích là bao nhiêu?`;
              qTextEn = `A cube has side ${a}cm. What is its volume?`;
              answer = `${v}cm³`;
              expl = `${a} x ${a} x ${a} = ${v} (cm³).`;
              explEn = `${a} x ${a} x ${a} = ${v} (cm³).`;
          }
      }
      
      if (qText !== '') {
          const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
          const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
          
          if (type === 'fill-in-blank' || type === 'short-answer') {
              return {
                  id: `geom-dyn-${index}`,
                  type: type,
                  text: finalQText,
                  correctAnswer: answer.replace(/[^0-9,.]/g, ''),
                  explanation: finalQExpl,
                  placeholder: language === 'en' ? 'Enter number...' : language === 'vi-en' ? 'Nhập số... / Enter number...' : 'Nhập số...'
              };
          }
          
          const options = new Set<string>();
          options.add(answer);
          const unit = answer.replace(/[0-9,.]/g, '');
          const val = parseFloat(answer.replace(/[^0-9,.]/g, ''));
          while (options.size < 4) {
              const wrongVal = val + Math.floor(Math.random() * 20) - 10;
              if (wrongVal > 0 && wrongVal !== val) {
                  options.add(`${wrongVal}${unit}`);
              }
          }
          
          return {
              id: `geom-dyn-${index}`,
              type: 'multiple-choice',
              text: finalQText,
              options: Array.from(options).sort(() => Math.random() - 0.5),
              correctAnswer: answer,
              explanation: finalQExpl
          };
      }
  }

  // Sample data for geometry questions
  const questionsByGrade: Record<number, any[]> = {
    1: [
      { text: "Hình bên dưới là hình gì?", textEn: "What shape is this?", answer: "Hình vuông", answerEn: "Square", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], optionsEn: ["Square", "Circle", "Triangle", "Rectangle"], expl: "Đây là hình vuông vì có 4 cạnh bằng nhau.", explEn: "This is a square because it has 4 equal sides.", img: squareSvg },
      { text: "Hình bên dưới là hình gì?", textEn: "What shape is this?", answer: "Hình tam giác", answerEn: "Triangle", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], optionsEn: ["Square", "Circle", "Triangle", "Rectangle"], expl: "Đây là hình tam giác vì có 3 cạnh.", explEn: "This is a triangle because it has 3 sides.", img: triangleSvg },
      { text: "Hình bên dưới là hình gì?", textEn: "What shape is this?", answer: "Hình tròn", answerEn: "Circle", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], optionsEn: ["Square", "Circle", "Triangle", "Rectangle"], expl: "Đây là hình tròn.", explEn: "This is a circle.", img: circleSvg },
      { text: "Hình vuông có mấy cạnh?", textEn: "How many sides does a square have?", answer: "4", answerEn: "4", options: ["3", "4", "5", "2"], optionsEn: ["3", "4", "5", "2"], expl: "Hình vuông có 4 cạnh bằng nhau.", explEn: "A square has 4 equal sides." },
      { text: "Hình tam giác có mấy cạnh?", textEn: "How many sides does a triangle have?", answer: "3", answerEn: "3", options: ["3", "4", "2", "5"], optionsEn: ["3", "4", "2", "5"], expl: "Hình tam giác có 3 cạnh.", explEn: "A triangle has 3 sides." },
      { text: "Quả bóng đá có dạng hình gì?", textEn: "What shape is a soccer ball?", answer: "Khối cầu", answerEn: "Sphere", options: ["Khối cầu", "Khối lập phương", "Khối hộp chữ nhật", "Hình tròn"], optionsEn: ["Sphere", "Cube", "Rectangular prism", "Circle"], expl: "Quả bóng có dạng khối cầu.", explEn: "A ball is a sphere." },
      { text: "Hộp quà thường có dạng hình gì?", textEn: "What shape is a gift box usually?", answer: "Khối lập phương", answerEn: "Cube", options: ["Khối lập phương", "Khối cầu", "Hình tròn", "Hình tam giác"], optionsEn: ["Cube", "Sphere", "Circle", "Triangle"], expl: "Hộp quà thường có dạng khối lập phương hoặc khối hộp chữ nhật.", explEn: "A gift box is usually a cube or rectangular prism." },
      { text: "Viên gạch lát nền thường có hình gì?", textEn: "What shape is a floor tile usually?", answer: "Hình vuông", answerEn: "Square", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Khối cầu"], optionsEn: ["Square", "Circle", "Triangle", "Sphere"], expl: "Viên gạch lát nền thường có dạng hình vuông.", explEn: "A floor tile is usually a square." },
      { text: "Quyển sách có dạng hình gì?", textEn: "What shape is a book?", answer: "Hình chữ nhật", answerEn: "Rectangle", options: ["Hình vuông", "Hình tròn", "Hình chữ nhật", "Hình tam giác"], optionsEn: ["Square", "Circle", "Rectangle", "Triangle"], expl: "Quyển sách thường có dạng hình chữ nhật.", explEn: "A book is usually a rectangle." },
      { text: "Bánh xe có dạng hình gì?", textEn: "What shape is a wheel?", answer: "Hình tròn", answerEn: "Circle", options: ["Hình vuông", "Hình tròn", "Hình chữ nhật", "Khối cầu"], optionsEn: ["Square", "Circle", "Rectangle", "Sphere"], expl: "Bánh xe có dạng hình tròn để dễ lăn.", explEn: "A wheel is a circle so it can roll easily." },
      { text: "Mặt bàn học thường có hình gì?", textEn: "What shape is a desk surface usually?", answer: "Hình chữ nhật", answerEn: "Rectangle", options: ["Hình chữ nhật", "Hình tròn", "Hình tam giác", "Khối cầu"], optionsEn: ["Rectangle", "Circle", "Triangle", "Sphere"], expl: "Mặt bàn thường có dạng hình chữ nhật.", explEn: "A desk surface is usually a rectangle." },
      { text: "Biển báo giao thông hình tam giác có mấy góc?", textEn: "How many corners does a triangular traffic sign have?", answer: "3", answerEn: "3", options: ["2", "3", "4", "5"], optionsEn: ["2", "3", "4", "5"], expl: "Hình tam giác luôn có 3 góc.", explEn: "A triangle always has 3 corners." },
      { text: "Đồng xu có dạng hình gì?", textEn: "What shape is a coin?", answer: "Hình tròn", answerEn: "Circle", options: ["Hình tròn", "Hình vuông", "Hình tam giác", "Hình chữ nhật"], optionsEn: ["Circle", "Square", "Triangle", "Rectangle"], expl: "Đồng xu có dạng hình tròn.", explEn: "A coin is a circle." },
      { text: "Cái bảng đen trong lớp có hình gì?", textEn: "What shape is the blackboard in the classroom?", answer: "Hình chữ nhật", answerEn: "Rectangle", options: ["Hình chữ nhật", "Hình vuông", "Hình tròn", "Hình tam giác"], optionsEn: ["Rectangle", "Square", "Circle", "Triangle"], expl: "Bảng đen thường có dạng hình chữ nhật.", explEn: "A blackboard is usually a rectangle." },
      { text: "Khối rubik có dạng hình gì?", textEn: "What shape is a Rubik's cube?", answer: "Khối lập phương", answerEn: "Cube", options: ["Khối lập phương", "Khối cầu", "Hình tròn", "Hình chữ nhật"], optionsEn: ["Cube", "Sphere", "Circle", "Rectangle"], expl: "Khối rubik là một khối lập phương.", explEn: "A Rubik's cube is a cube." },
      { text: "Cái tủ lạnh có dạng khối gì?", textEn: "What shape is a refrigerator?", answer: "Khối hộp chữ nhật", answerEn: "Rectangular prism", options: ["Khối hộp chữ nhật", "Khối lập phương", "Khối cầu", "Hình tròn"], optionsEn: ["Rectangular prism", "Cube", "Sphere", "Circle"], expl: "Tủ lạnh thường có dạng khối hộp chữ nhật.", explEn: "A refrigerator is usually a rectangular prism." },
      { text: "Lon nước ngọt có dạng khối gì?", textEn: "What shape is a soda can?", answer: "Khối trụ", answerEn: "Cylinder", options: ["Khối trụ", "Khối cầu", "Khối lập phương", "Khối hộp chữ nhật"], optionsEn: ["Cylinder", "Sphere", "Cube", "Rectangular prism"], expl: "Lon nước ngọt có dạng khối trụ.", explEn: "A soda can is a cylinder." },
      { text: "Cái nón lá có dạng hình gì?", textEn: "What shape is a conical hat?", answer: "Hình nón", answerEn: "Cone", options: ["Hình nón", "Hình tròn", "Hình tam giác", "Khối cầu"], optionsEn: ["Cone", "Circle", "Triangle", "Sphere"], expl: "Nón lá có dạng hình nón.", explEn: "A conical hat is a cone." },
      { text: "Hình bên có bao nhiêu hình tam giác?", textEn: "How many triangles are in the image?", answer: "2", answerEn: "2", options: ["1", "2", "3", "4"], optionsEn: ["1", "2", "3", "4"], expl: "Đường chéo chia hình vuông thành 2 hình tam giác.", explEn: "The diagonal divides the square into 2 triangles.", img: `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="25" y1="25" x2="125" y2="125" stroke="%23333" stroke-width="4"/></svg>` }
    ],
    2: [
      { text: "Hình bên dưới là hình gì?", textEn: "What shape is this?", answer: "Hình chữ nhật", answerEn: "Rectangle", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], optionsEn: ["Square", "Circle", "Triangle", "Rectangle"], expl: "Đây là hình chữ nhật.", explEn: "This is a rectangle.", img: rectangleSvg },
      { text: "Hình vuông có bao nhiêu đỉnh?", textEn: "How many vertices does a square have?", answer: "4", answerEn: "4", options: ["3", "4", "5", "6"], optionsEn: ["3", "4", "5", "6"], expl: "Hình vuông có 4 đỉnh và 4 cạnh.", explEn: "A square has 4 vertices and 4 sides.", img: squareSvg },
      { text: "Hình tam giác có bao nhiêu đỉnh?", textEn: "How many vertices does a triangle have?", answer: "3", answerEn: "3", options: ["3", "4", "5", "6"], optionsEn: ["3", "4", "5", "6"], expl: "Hình tam giác có 3 đỉnh.", explEn: "A triangle has 3 vertices.", img: triangleSvg },
      { text: "Đường gấp khúc ABCD gồm mấy đoạn thẳng?", textEn: "How many segments does the polyline ABCD have?", answer: "3", answerEn: "3", options: ["2", "3", "4", "5"], optionsEn: ["2", "3", "4", "5"], expl: "Gồm đoạn AB, BC và CD.", explEn: "It includes segments AB, BC, and CD." },
      { text: "Hình tứ giác có bao nhiêu đỉnh?", textEn: "How many vertices does a quadrilateral have?", answer: "4", answerEn: "4", options: ["3", "4", "5", "6"], optionsEn: ["3", "4", "5", "6"], expl: "Hình tứ giác có 4 đỉnh và 4 cạnh.", explEn: "A quadrilateral has 4 vertices and 4 sides." },
      { text: "Ba điểm thẳng hàng là ba điểm cùng nằm trên một...?", textEn: "Three collinear points are three points that lie on the same...?", answer: "Đường thẳng", answerEn: "Line", options: ["Đường thẳng", "Đường cong", "Hình tròn", "Đoạn thẳng"], optionsEn: ["Line", "Curve", "Circle", "Segment"], expl: "Ba điểm thẳng hàng cùng nằm trên một đường thẳng.", explEn: "Three collinear points lie on the same line." },
      { text: "Hình chữ nhật có mấy góc vuông?", textEn: "How many right angles does a rectangle have?", answer: "4", answerEn: "4", options: ["2", "3", "4", "5"], optionsEn: ["2", "3", "4", "5"], expl: "Hình chữ nhật có 4 góc vuông.", explEn: "A rectangle has 4 right angles." },
      { text: "Khối trụ có mấy mặt đáy?", textEn: "How many bases does a cylinder have?", answer: "2", answerEn: "2", options: ["1", "2", "3", "4"], optionsEn: ["1", "2", "3", "4"], expl: "Khối trụ có 2 mặt đáy là hình tròn.", explEn: "A cylinder has 2 circular bases." },
      { text: "Quả địa cầu có dạng khối gì?", textEn: "What shape is a globe?", answer: "Khối cầu", answerEn: "Sphere", options: ["Khối trụ", "Khối cầu", "Khối lập phương", "Hình tròn"], optionsEn: ["Cylinder", "Sphere", "Cube", "Circle"], expl: "Quả địa cầu có dạng khối cầu.", explEn: "A globe is a sphere." },
      { text: "Đoạn thẳng có mấy điểm đầu mút?", textEn: "How many endpoints does a segment have?", answer: "2", answerEn: "2", options: ["1", "2", "3", "0"], optionsEn: ["1", "2", "3", "0"], expl: "Đoạn thẳng bị giới hạn bởi 2 điểm đầu mút.", explEn: "A segment is bounded by 2 endpoints." },
      { text: "Hình tứ giác có mấy cạnh?", textEn: "How many sides does a quadrilateral have?", answer: "4", answerEn: "4", options: ["3", "4", "5", "6"], optionsEn: ["3", "4", "5", "6"], expl: "Tứ giác là hình có 4 cạnh.", explEn: "A quadrilateral is a shape with 4 sides." },
      { text: "Độ dài đường gấp khúc bằng tổng độ dài các...?", textEn: "The length of a polyline equals the sum of the lengths of its...?", answer: "Đoạn thẳng", answerEn: "Segments", options: ["Đoạn thẳng", "Đường thẳng", "Đỉnh", "Góc"], optionsEn: ["Segments", "Lines", "Vertices", "Angles"], expl: "Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng tạo nên nó.", explEn: "The length of a polyline equals the sum of the lengths of its segments." },
      { text: "Hình vuông có 4 cạnh như thế nào với nhau?", textEn: "How are the 4 sides of a square related?", answer: "Bằng nhau", answerEn: "Equal", options: ["Bằng nhau", "Khác nhau", "Song song", "Vuông góc"], optionsEn: ["Equal", "Different", "Parallel", "Perpendicular"], expl: "Hình vuông có 4 cạnh bằng nhau.", explEn: "A square has 4 equal sides." },
      { text: "Hình chữ nhật có 2 cạnh dài như thế nào với nhau?", textEn: "How are the 2 long sides of a rectangle related?", answer: "Bằng nhau", answerEn: "Equal", options: ["Bằng nhau", "Khác nhau", "Cắt nhau", "Vuông góc"], optionsEn: ["Equal", "Different", "Intersecting", "Perpendicular"], expl: "Hình chữ nhật có 2 cạnh dài bằng nhau và 2 cạnh ngắn bằng nhau.", explEn: "A rectangle has 2 equal long sides and 2 equal short sides." },
      { text: "Hình gồm 3 đoạn thẳng khép kín gọi là hình gì?", textEn: "A closed shape with 3 segments is called what?", answer: "Hình tam giác", answerEn: "Triangle", options: ["Hình tam giác", "Hình tứ giác", "Hình vuông", "Hình tròn"], optionsEn: ["Triangle", "Quadrilateral", "Square", "Circle"], expl: "Hình tam giác là hình khép kín tạo bởi 3 đoạn thẳng.", explEn: "A triangle is a closed shape formed by 3 segments." },
      { text: "Hình tứ giác có thể có mấy góc vuông?", textEn: "How many right angles can a quadrilateral have?", answer: "Có thể 0, 1, 2, 3 hoặc 4", answerEn: "Can be 0, 1, 2, 3 or 4", options: ["Chỉ 4", "Chỉ 0", "Có thể 0, 1, 2, 3 hoặc 4", "Chỉ 2"], optionsEn: ["Only 4", "Only 0", "Can be 0, 1, 2, 3 or 4", "Only 2"], expl: "Hình tứ giác có thể không có góc vuông nào, hoặc có 1, 2, 3, 4 góc vuông.", explEn: "A quadrilateral can have 0, 1, 2, 3, or 4 right angles." },
      { text: "Đường thẳng có bị giới hạn ở hai đầu không?", textEn: "Is a line bounded at both ends?", answer: "Không", answerEn: "No", options: ["Có", "Không", "Chỉ một đầu", "Tùy lúc"], optionsEn: ["Yes", "No", "Only one end", "Depends"], expl: "Đường thẳng kéo dài mãi mãi về hai phía.", explEn: "A line extends infinitely in both directions." },
      { text: "Hình bên có bao nhiêu hình chữ nhật?", textEn: "How many rectangles are in the image?", answer: "3", answerEn: "3", options: ["1", "2", "3", "4"], optionsEn: ["1", "2", "3", "4"], expl: "Có 2 hình chữ nhật nhỏ và 1 hình chữ nhật lớn bao ngoài.", explEn: "There are 2 small rectangles and 1 large outer rectangle.", img: `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="40" width="120" height="70" fill="none" stroke="%23333" stroke-width="4"/><line x1="75" y1="40" x2="75" y2="110" stroke="%23333" stroke-width="4"/></svg>` }

    ],
    3: [
      { text: "Góc trong hình bên dưới là góc gì?", textEn: "What angle is this?", answer: "Góc vuông", answerEn: "Right angle", options: ["Góc nhọn", "Góc tù", "Góc vuông", "Góc bẹt"], optionsEn: ["Acute angle", "Obtuse angle", "Right angle", "Straight angle"], expl: "Đây là góc vuông (90 độ).", explEn: "This is a right angle (90 degrees).", img: rightAngleSvg },
      { text: "Hình bên có bao nhiêu hình tam giác?", textEn: "How many triangles are in the image?", answer: "8", answerEn: "8", options: ["4", "6", "8", "10"], optionsEn: ["4", "6", "8", "10"], expl: "Có 4 hình tam giác nhỏ và 4 hình tam giác lớn (ghép từ 2 hình nhỏ).", explEn: "There are 4 small triangles and 4 large triangles (made of 2 small ones).", img: `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="100" height="100" fill="none" stroke="%23333" stroke-width="4"/><line x1="25" y1="25" x2="125" y2="125" stroke="%23333" stroke-width="4"/><line x1="125" y1="25" x2="25" y2="125" stroke="%23333" stroke-width="4"/></svg>` },
      { text: "Hình chữ nhật có chiều dài 5cm, chiều rộng 3cm. Chu vi là bao nhiêu?", textEn: "A rectangle has length 5cm, width 3cm. What is its perimeter?", answer: "16cm", answerEn: "16cm", options: ["15cm", "16cm", "8cm", "10cm"], optionsEn: ["15cm", "16cm", "8cm", "10cm"], expl: "(5 + 3) x 2 = 16 (cm).", explEn: "(5 + 3) x 2 = 16 (cm).", img: rectangleSvg },
      { text: "Hình vuông có cạnh 4cm. Diện tích là?", textEn: "A square has side 4cm. What is its area?", answer: "16cm²", answerEn: "16cm²", options: ["16cm²", "12cm²", "8cm²", "20cm²"], optionsEn: ["16cm²", "12cm²", "8cm²", "20cm²"], expl: "4 x 4 = 16 (cm²).", explEn: "4 x 4 = 16 (cm²).", img: squareSvg },
      { text: "Góc vuông thường được kiểm tra bằng dụng cụ gì?", textEn: "What tool is usually used to check a right angle?", answer: "Ê-ke", answerEn: "Set square", options: ["Thước kẻ", "Ê-ke", "Com-pa", "Bút chì"], optionsEn: ["Ruler", "Set square", "Compass", "Pencil"], expl: "Dùng Ê-ke để kiểm tra góc vuông.", explEn: "Use a set square to check a right angle." },
      { text: "Góc lớn hơn góc vuông là góc gì?", textEn: "What angle is larger than a right angle?", answer: "Góc tù", answerEn: "Obtuse angle", options: ["Góc nhọn", "Góc tù", "Góc bẹt", "Góc vuông"], optionsEn: ["Acute angle", "Obtuse angle", "Straight angle", "Right angle"], expl: "Góc tù lớn hơn góc vuông.", explEn: "An obtuse angle is larger than a right angle." },
      { text: "Góc nhỏ hơn góc vuông là góc gì?", textEn: "What angle is smaller than a right angle?", answer: "Góc nhọn", answerEn: "Acute angle", options: ["Góc nhọn", "Góc tù", "Góc bẹt", "Góc vuông"], optionsEn: ["Acute angle", "Obtuse angle", "Straight angle", "Right angle"], expl: "Góc nhọn nhỏ hơn góc vuông.", explEn: "An acute angle is smaller than a right angle." },
      { text: "Chu vi hình vuông có cạnh 5cm là bao nhiêu?", textEn: "What is the perimeter of a square with side 5cm?", answer: "20cm", answerEn: "20cm", options: ["15cm", "20cm", "25cm", "10cm"], optionsEn: ["15cm", "20cm", "25cm", "10cm"], expl: "5 x 4 = 20 (cm).", explEn: "5 x 4 = 20 (cm)." },
      { text: "Diện tích hình chữ nhật có chiều dài 6cm, chiều rộng 4cm là?", textEn: "What is the area of a rectangle with length 6cm, width 4cm?", answer: "24cm²", answerEn: "24cm²", options: ["20cm²", "24cm²", "10cm²", "36cm²"], optionsEn: ["20cm²", "24cm²", "10cm²", "36cm²"], expl: "6 x 4 = 24 (cm²).", explEn: "6 x 4 = 24 (cm²)." },
      { text: "Hình tròn có bao nhiêu tâm?", textEn: "How many centers does a circle have?", answer: "1", answerEn: "1", options: ["1", "2", "3", "Vô số"], optionsEn: ["1", "2", "3", "Infinite"], expl: "Mỗi hình tròn chỉ có 1 tâm duy nhất.", explEn: "Every circle has exactly 1 center." },
      { text: "Bán kính hình tròn bằng một nửa...?", textEn: "The radius of a circle is half of the...?", answer: "Đường kính", answerEn: "Diameter", options: ["Đường kính", "Chu vi", "Diện tích", "Cạnh"], optionsEn: ["Diameter", "Perimeter", "Area", "Side"], expl: "Bán kính bằng 1/2 đường kính.", explEn: "Radius is 1/2 of the diameter." },
      { text: "Sân trường hình chữ nhật có chiều dài 50m, chiều rộng 30m. Chu vi sân trường là?", textEn: "A rectangular school yard has length 50m, width 30m. What is its perimeter?", answer: "160m", answerEn: "160m", options: ["160m", "80m", "1500m", "100m"], optionsEn: ["160m", "80m", "1500m", "100m"], expl: "(50 + 30) x 2 = 160 (m).", explEn: "(50 + 30) x 2 = 160 (m)." },
      { text: "Một viên gạch hình vuông có cạnh 40cm. Chu vi viên gạch là?", textEn: "A square tile has side 40cm. What is its perimeter?", answer: "160cm", answerEn: "160cm", options: ["160cm", "80cm", "1600cm", "120cm"], optionsEn: ["160cm", "80cm", "1600cm", "120cm"], expl: "40 x 4 = 160 (cm).", explEn: "40 x 4 = 160 (cm)." },
      { text: "Điểm ở chính giữa của đường kính gọi là gì?", textEn: "What is the point exactly in the middle of a diameter called?", answer: "Tâm", answerEn: "Center", options: ["Tâm", "Bán kính", "Đỉnh", "Góc"], optionsEn: ["Center", "Radius", "Vertex", "Angle"], expl: "Tâm là trung điểm của đường kính.", explEn: "The center is the midpoint of the diameter." }
    ],
    4: [
      { text: "Hai đường thẳng trong hình bên dưới là hai đường thẳng...", textEn: "The two lines below are...", answer: "Song song", answerEn: "Parallel", options: ["Cắt nhau", "Song song", "Vuông góc", "Trùng nhau"], optionsEn: ["Intersecting", "Parallel", "Perpendicular", "Coincident"], expl: "Hai đường thẳng song song không bao giờ cắt nhau.", explEn: "Parallel lines never intersect.", img: parallelSvg },
      { text: "Góc bẹt có số đo bằng bao nhiêu độ?", textEn: "What is the measure of a straight angle in degrees?", answer: "180", answerEn: "180", options: ["90", "180", "60", "360"], optionsEn: ["90", "180", "60", "360"], expl: "Góc bẹt bằng hai góc vuông, là 180 độ.", explEn: "A straight angle is equal to two right angles, which is 180 degrees." },
      { text: "Góc vuông có số đo bằng bao nhiêu độ?", textEn: "What is the measure of a right angle in degrees?", answer: "90", answerEn: "90", options: ["90", "180", "60", "45"], optionsEn: ["90", "180", "60", "45"], expl: "Góc vuông có số đo là 90 độ.", explEn: "A right angle measures 90 degrees.", img: rightAngleSvg },
      { text: "Hai đường thẳng song song là hai đường thẳng...", textEn: "Two parallel lines are two lines that...", answer: "Không bao giờ cắt nhau", answerEn: "Never intersect", options: ["Cắt nhau tại 1 điểm", "Không bao giờ cắt nhau", "Vuông góc với nhau", "Trùng nhau"], optionsEn: ["Intersect at 1 point", "Never intersect", "Are perpendicular", "Are coincident"], expl: "Hai đường thẳng song song không bao giờ cắt nhau.", explEn: "Parallel lines never intersect." },
      { text: "Hình thoi có hai đường chéo...", textEn: "A rhombus has two diagonals that are...", answer: "Vuông góc với nhau", answerEn: "Perpendicular to each other", options: ["Bằng nhau", "Vuông góc với nhau", "Song song", "Không cắt nhau"], optionsEn: ["Equal", "Perpendicular to each other", "Parallel", "Do not intersect"], expl: "Hình thoi có hai đường chéo vuông góc với nhau và cắt nhau tại trung điểm mỗi đường.", explEn: "A rhombus has two diagonals that are perpendicular to each other and bisect each other." },
      { text: "Hình bình hành có các cặp cạnh đối diện...", textEn: "A parallelogram has opposite sides that are...", answer: "Song song và bằng nhau", answerEn: "Parallel and equal", options: ["Chỉ song song", "Chỉ bằng nhau", "Song song và bằng nhau", "Vuông góc"], optionsEn: ["Only parallel", "Only equal", "Parallel and equal", "Perpendicular"], expl: "Hình bình hành có các cặp cạnh đối diện song song và bằng nhau.", explEn: "A parallelogram has opposite sides that are parallel and equal." },
      { text: "Hai đường thẳng vuông góc tạo thành mấy góc vuông?", textEn: "How many right angles do two perpendicular lines form?", answer: "4", answerEn: "4", options: ["1", "2", "3", "4"], optionsEn: ["1", "2", "3", "4"], expl: "Hai đường thẳng vuông góc cắt nhau tạo thành 4 góc vuông.", explEn: "Two perpendicular lines intersect to form 4 right angles." },
      { text: "Diện tích hình bình hành bằng...", textEn: "The area of a parallelogram is...", answer: "Đáy nhân chiều cao", answerEn: "Base times height", options: ["Đáy nhân chiều cao", "Đáy cộng chiều cao", "Đáy nhân chiều cao chia 2", "Cạnh nhân cạnh"], optionsEn: ["Base times height", "Base plus height", "Base times height divided by 2", "Side times side"], expl: "S = a x h.", explEn: "S = a x h." },
      { text: "Diện tích hình thoi bằng...", textEn: "The area of a rhombus is...", answer: "Tích hai đường chéo chia 2", answerEn: "Product of two diagonals divided by 2", options: ["Tích hai đường chéo", "Tích hai đường chéo chia 2", "Tổng hai đường chéo", "Cạnh nhân cạnh"], optionsEn: ["Product of two diagonals", "Product of two diagonals divided by 2", "Sum of two diagonals", "Side times side"], expl: "S = (m x n) : 2.", explEn: "S = (m x n) : 2." },
      { text: "Hình thoi có mấy cạnh bằng nhau?", textEn: "How many equal sides does a rhombus have?", answer: "4", answerEn: "4", options: ["2", "3", "4", "Không có"], optionsEn: ["2", "3", "4", "None"], expl: "Hình thoi có 4 cạnh bằng nhau.", explEn: "A rhombus has 4 equal sides." },
      { text: "Một mảnh đất hình bình hành có độ dài đáy 20m, chiều cao 10m. Diện tích mảnh đất là?", textEn: "A parallelogram-shaped plot of land has a base of 20m and a height of 10m. What is its area?", answer: "200m²", answerEn: "200m²", options: ["200m²", "100m²", "30m²", "60m²"], optionsEn: ["200m²", "100m²", "30m²", "60m²"], expl: "20 x 10 = 200 (m²).", explEn: "20 x 10 = 200 (m²)." },
      { text: "Một tấm kính hình thoi có hai đường chéo là 10cm và 8cm. Diện tích tấm kính là?", textEn: "A rhombus-shaped glass has diagonals of 10cm and 8cm. What is its area?", answer: "40cm²", answerEn: "40cm²", options: ["80cm²", "40cm²", "18cm²", "36cm²"], optionsEn: ["80cm²", "40cm²", "18cm²", "36cm²"], expl: "(10 x 8) : 2 = 40 (cm²).", explEn: "(10 x 8) : 2 = 40 (cm²)." }
    ],
    5: [
      { text: "Muốn tính diện tích hình tam giác ta làm thế nào?", textEn: "How do you calculate the area of a triangle?", answer: "Đáy nhân chiều cao chia 2", answerEn: "Base times height divided by 2", options: ["Đáy nhân chiều cao", "Đáy nhân chiều cao chia 2", "Đáy cộng chiều cao nhân 2", "Cạnh nhân cạnh"], optionsEn: ["Base times height", "Base times height divided by 2", "Base plus height times 2", "Side times side"], expl: "S = (a x h) : 2", explEn: "S = (a x h) : 2", img: triangleSvg },
      { text: "Hình lập phương có mấy mặt?", textEn: "How many faces does a cube have?", answer: "6", answerEn: "6", options: ["4", "6", "8", "12"], optionsEn: ["4", "6", "8", "12"], expl: "Hình lập phương có 6 mặt là các hình vuông bằng nhau.", explEn: "A cube has 6 equal square faces." },
      { text: "Công thức tính chu vi hình tròn bán kính r là?", textEn: "What is the formula for the perimeter of a circle with radius r?", answer: "r x 2 x 3,14", answerEn: "r x 2 x 3.14", options: ["r x 3,14", "r x r x 3,14", "r x 2 x 3,14", "d x 3,14 : 2"], optionsEn: ["r x 3.14", "r x r x 3.14", "r x 2 x 3.14", "d x 3.14 : 2"], expl: "C = r x 2 x 3,14 hoặc C = d x 3,14.", explEn: "C = r x 2 x 3.14 or C = d x 3.14.", img: circleSvg },
      { text: "Diện tích hình thang bằng...", textEn: "The area of a trapezoid is...", answer: "Tổng hai đáy nhân chiều cao chia 2", answerEn: "Sum of two bases times height divided by 2", options: ["Tổng hai đáy nhân chiều cao", "Tổng hai đáy nhân chiều cao chia 2", "Đáy lớn nhân chiều cao", "Đáy bé nhân chiều cao"], optionsEn: ["Sum of two bases times height", "Sum of two bases times height divided by 2", "Large base times height", "Small base times height"], expl: "S = (a + b) x h : 2.", explEn: "S = (a + b) x h : 2." },
      { text: "Thể tích hình hộp chữ nhật bằng...", textEn: "The volume of a rectangular prism is...", answer: "Dài x Rộng x Cao", answerEn: "Length x Width x Height", options: ["Dài x Rộng", "Dài x Rộng x Cao", "Dài + Rộng + Cao", "Chu vi đáy x Cao"], optionsEn: ["Length x Width", "Length x Width x Height", "Length + Width + Height", "Base perimeter x Height"], expl: "V = a x b x c.", explEn: "V = a x b x c." },
      { text: "Thể tích hình lập phương cạnh a là...", textEn: "The volume of a cube with side a is...", answer: "a x a x a", answerEn: "a x a x a", options: ["a x 3", "a x a x 6", "a x a x a", "a x a x 4"], optionsEn: ["a x 3", "a x a x 6", "a x a x a", "a x a x 4"], expl: "V = a x a x a.", explEn: "V = a x a x a." },
      { text: "Diện tích toàn phần hình lập phương cạnh a là...", textEn: "The total surface area of a cube with side a is...", answer: "a x a x 6", answerEn: "a x a x 6", options: ["a x a x 4", "a x a x 6", "a x a x a", "a x 6"], optionsEn: ["a x a x 4", "a x a x 6", "a x a x a", "a x 6"], expl: "Stp = a x a x 6.", explEn: "Stp = a x a x 6." },
      { text: "Hình hộp chữ nhật có mấy đỉnh?", textEn: "How many vertices does a rectangular prism have?", answer: "8", answerEn: "8", options: ["4", "6", "8", "12"], optionsEn: ["4", "6", "8", "12"], expl: "Hình hộp chữ nhật có 8 đỉnh.", explEn: "A rectangular prism has 8 vertices." },
      { text: "Diện tích xung quanh hình hộp chữ nhật bằng...", textEn: "The lateral surface area of a rectangular prism is...", answer: "Chu vi đáy nhân chiều cao", answerEn: "Base perimeter times height", options: ["Chu vi đáy nhân chiều cao", "Diện tích đáy nhân chiều cao", "Dài nhân rộng", "Tổng 3 kích thước"], optionsEn: ["Base perimeter times height", "Base area times height", "Length times width", "Sum of 3 dimensions"], expl: "Sxq = Chu vi đáy x Chiều cao.", explEn: "Sxq = Base perimeter x Height." },
      { text: "Đường kính hình tròn là 6cm, chu vi là bao nhiêu?", textEn: "The diameter of a circle is 6cm, what is its perimeter?", answer: "18,84cm", answerEn: "18.84cm", options: ["18,84cm", "9,42cm", "28,26cm", "37,68cm"], optionsEn: ["18.84cm", "9.42cm", "28.26cm", "37.68cm"], expl: "C = d x 3,14 = 6 x 3,14 = 18,84 (cm).", explEn: "C = d x 3.14 = 6 x 3.14 = 18.84 (cm)." },
      { text: "Một bể cá hình hộp chữ nhật có chiều dài 2m, chiều rộng 1m, chiều cao 1m. Thể tích bể cá là?", textEn: "A rectangular fish tank has length 2m, width 1m, height 1m. What is its volume?", answer: "2m³", answerEn: "2m³", options: ["2m³", "4m³", "3m³", "1m³"], optionsEn: ["2m³", "4m³", "3m³", "1m³"], expl: "V = 2 x 1 x 1 = 2 (m³).", explEn: "V = 2 x 1 x 1 = 2 (m³)." },
      { text: "Một hình tam giác có đáy 10cm, chiều cao 5cm. Diện tích là?", textEn: "A triangle has base 10cm, height 5cm. What is its area?", answer: "25cm²", answerEn: "25cm²", options: ["50cm²", "25cm²", "15cm²", "30cm²"], optionsEn: ["50cm²", "25cm²", "15cm²", "30cm²"], expl: "S = (10 x 5) : 2 = 25 (cm²).", explEn: "S = (10 x 5) : 2 = 25 (cm²)." }
    ]
  };

  // Use a pseudo-random shuffle based on gradeId and topicId to ensure we get different questions
  // but for simplicity here we just use the index directly. Since there are 10 questions and we ask 10,
  // index % length will pick all 10 unique questions!
  const gradeQs = questionsByGrade[gradeId] || questionsByGrade[1];
  const q = gradeQs[index % gradeQs.length];

  const qText = language === 'en' ? q.textEn : language === 'vi-en' ? `${q.text} / ${q.textEn}` : q.text;
  const qAnswer = language === 'en' ? q.answerEn : language === 'vi-en' ? `${q.answer} / ${q.answerEn}` : q.answer;
  const qExpl = language === 'en' ? q.explEn : language === 'vi-en' ? `${q.expl} / ${q.explEn}` : q.expl;
  const qOptions = language === 'en' ? q.optionsEn : language === 'vi-en' ? q.options.map((o: string, i: number) => `${o} / ${q.optionsEn[i]}`) : q.options;

  // Adapt to types
  if (type === 'matching') {
    // Pick 4 random questions from the grade to form pairs with unique answers
    const shuffledQs = [...gradeQs].sort(() => Math.random() - 0.5);
    const selectedQs = [];
    const usedAnswers = new Set<string>();
    
    for (const sq of shuffledQs) {
      const sqAnswer = language === 'en' ? sq.answerEn : language === 'vi-en' ? `${sq.answer} / ${sq.answerEn}` : sq.answer;
      if (!usedAnswers.has(sqAnswer)) {
        usedAnswers.add(sqAnswer);
        selectedQs.push(sq);
        if (selectedQs.length === 4) break;
      }
    }
    
    // Fallback if not enough unique answers
    if (selectedQs.length < 4) {
      for (const sq of shuffledQs) {
        if (selectedQs.length === 4) break;
        if (!selectedQs.includes(sq)) {
          selectedQs.push(sq);
        }
      }
    }

    const pairs = selectedQs.map(sq => {
      const sqText = language === 'en' ? sq.textEn.replace('What shape is this?', 'Shape with feature: ' + sq.explEn) :
                     language === 'vi-en' ? `${sq.text.replace('Hình bên dưới là hình gì?', 'Hình có đặc điểm: ' + sq.expl)} / ${sq.textEn.replace('What shape is this?', 'Shape with feature: ' + sq.explEn)}` :
                     sq.text.replace('Hình bên dưới là hình gì?', 'Hình có đặc điểm: ' + sq.expl);
      const sqAnswer = language === 'en' ? sq.answerEn : language === 'vi-en' ? `${sq.answer} / ${sq.answerEn}` : sq.answer;
      return {
        left: sqText,
        right: sqAnswer
      };
    });
    
    const mText = language === 'en' ? 'Match the question with the correct answer:' :
                  language === 'vi-en' ? 'Hãy ghép câu hỏi với đáp án đúng: / Match the question with the correct answer:' :
                  'Hãy ghép câu hỏi với đáp án đúng:';
    const mExpl = language === 'en' ? 'You matched all pairs correctly!' :
                  language === 'vi-en' ? 'Bạn đã ghép đúng tất cả các cặp! / You matched all pairs correctly!' :
                  'Bạn đã ghép đúng tất cả các cặp!';
                  
    return {
      id: `geo-${index}`,
      type: 'matching',
      text: mText,
      correctAnswer: 'matching',
      explanation: mExpl,
      pairs
    };
  }

  if (type === 'true-false') {
    const isCorrect = Math.random() > 0.5;
    const displayedAnswer = isCorrect ? qAnswer : (qOptions.find((o: string) => o !== qAnswer) || "Sai / False");
    
    const tfText = language === 'en' ? `TRUE or FALSE?\n\nQuestion: ${q.textEn}\nAnswer: ${displayedAnswer}` :
                   language === 'vi-en' ? `ĐÚNG hay SAI? / TRUE or FALSE?\n\nHỏi/Question: ${q.text} / ${q.textEn}\nĐáp án/Answer: ${displayedAnswer}` :
                   `ĐÚNG hay SAI?\n\nHỏi: ${q.text}\nĐáp án: ${displayedAnswer}`;
                   
    return {
      id: `geo-${index}`,
      type: 'true-false',
      text: tfText,
      correctAnswer: isCorrect ? 'true' : 'false',
      explanation: qExpl,
      imageUrl: q.img
    };
  }

  if (type === 'fill-in-blank' || type === 'short-answer') {
    return {
      id: `geo-${index}`,
      type: type,
      text: qText,
      correctAnswer: qAnswer,
      explanation: qExpl,
      placeholder: language === 'en' ? 'Enter your answer...' : language === 'vi-en' ? 'Nhập câu trả lời... / Enter your answer...' : 'Nhập câu trả lời...',
      imageUrl: q.img
    };
  }

  return {
    id: `geo-${index}`,
    type: 'multiple-choice',
    text: qText,
    options: qOptions.sort(() => Math.random() - 0.5),
    correctAnswer: qAnswer,
    explanation: qExpl,
    imageUrl: q.img
  };
}

function generateMeasurementQuestion(gradeId: number, levelId: string, type: QuestionType, index: number, language: string): Question {
  const isDynamic = Math.random() > 0.3;
  
  if (isDynamic) {
      let qText = '', qTextEn = '', answer = '', expl = '', explEn = '';
      
      if (gradeId === 1) {
          const qType = Math.floor(Math.random() * 5);
          if (qType === 0) {
              const [a, b, ans] = getAdditionNumbers(1, levelId === 'hard', levelId === 'medium');
              qText = `Sợi dây dài ${a}cm, nối thêm ${b}cm. Sợi dây dài tất cả bao nhiêu cm?`;
              qTextEn = `A string is ${a}cm long, add ${b}cm. How long is the string in total?`;
              answer = `${ans}cm`;
              expl = `${a} + ${b} = ${ans} (cm).`;
              explEn = `${a} + ${b} = ${ans} (cm).`;
          } else if (qType === 1) {
              const [a, b, ans] = getSubtractionNumbers(1, levelId === 'hard', levelId === 'medium');
              qText = `Sợi dây dài ${a}cm, cắt đi ${b}cm. Còn lại bao nhiêu cm?`;
              qTextEn = `A string is ${a}cm long, cut off ${b}cm. How much is left?`;
              answer = `${ans}cm`;
              expl = `${a} - ${b} = ${ans} (cm).`;
              explEn = `${a} - ${b} = ${ans} (cm).`;
          } else if (qType === 2) {
              const hour = Math.floor(Math.random() * 12) + 1;
              qText = `Đồng hồ chỉ mấy giờ?`;
              qTextEn = `What time is it on the clock?`;
              
              const ansVi = `${hour} giờ`;
              const ansEn = `${hour} o'clock`;
              answer = language === 'en' ? ansEn : language === 'vi-en' ? `${ansVi} / ${ansEn}` : ansVi;
              
              expl = `Kim dài chỉ số 12, kim ngắn chỉ số ${hour} nên là ${hour} giờ đúng.`;
              explEn = `The long hand is at 12, the short hand is at ${hour}, so it is ${hour} o'clock.`;
              
              const hx = 75 + 35 * Math.sin(hour * Math.PI / 6);
              const hy = 75 - 35 * Math.cos(hour * Math.PI / 6);
              let numbersSvg = '';
              for (let i = 1; i <= 12; i++) {
                  const nx = 75 + 52 * Math.sin(i * Math.PI / 6);
                  const ny = 75 - 52 * Math.cos(i * Math.PI / 6);
                  numbersSvg += `<text x="${nx}" y="${ny}" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23333" text-anchor="middle" dominant-baseline="central">${i}</text>`;
              }
              
              const clockSvg = `data:image/svg+xml;utf8,<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="70" fill="white" stroke="%233b82f6" stroke-width="4"/>${numbersSvg}<line x1="75" y1="75" x2="${hx}" y2="${hy}" stroke="%23333" stroke-width="5" stroke-linecap="round"/><line x1="75" y1="75" x2="75" y2="20" stroke="%23ef4444" stroke-width="3" stroke-linecap="round"/><circle cx="75" cy="75" r="4" fill="%23333"/></svg>`;
              
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wrongHour = Math.floor(Math.random() * 12) + 1;
                  if (wrongHour !== hour) {
                      const wrongVi = `${wrongHour} giờ`;
                      const wrongEn = `${wrongHour} o'clock`;
                      options.add(language === 'en' ? wrongEn : language === 'vi-en' ? `${wrongVi} / ${wrongEn}` : wrongVi);
                  }
              }
              
              return {
                  id: `meas-dyn-${index}`,
                  type: 'multiple-choice',
                  text: language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText,
                  imageUrl: clockSvg,
                  options: Array.from(options).sort(() => Math.random() - 0.5),
                  correctAnswer: answer,
                  explanation: language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl
              };
          } else if (qType === 3) {
              const hour = Math.floor(Math.random() * 12) + 1;
              qText = `Kim ngắn chỉ số ${hour}, kim dài chỉ số 12. Hỏi đồng hồ chỉ mấy giờ?`;
              qTextEn = `The short hand points to ${hour}, the long hand points to 12. What time is it?`;
              
              const ansVi = `${hour} giờ`;
              const ansEn = `${hour} o'clock`;
              answer = language === 'en' ? ansEn : language === 'vi-en' ? `${ansVi} / ${ansEn}` : ansVi;
              
              expl = `Kim dài chỉ số 12, kim ngắn chỉ số ${hour} nên là ${hour} giờ đúng.`;
              explEn = `The long hand is at 12, the short hand is at ${hour}, so it is ${hour} o'clock.`;
              
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wrongHour = Math.floor(Math.random() * 12) + 1;
                  if (wrongHour !== hour) {
                      const wrongVi = `${wrongHour} giờ`;
                      const wrongEn = `${wrongHour} o'clock`;
                      options.add(language === 'en' ? wrongEn : language === 'vi-en' ? `${wrongVi} / ${wrongEn}` : wrongVi);
                  }
              }
              
              return {
                  id: `meas-dyn-${index}`,
                  type: 'multiple-choice',
                  text: language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText,
                  options: Array.from(options).sort(() => Math.random() - 0.5),
                  correctAnswer: answer,
                  explanation: language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl
              };
          } else {
              const startHour = Math.floor(Math.random() * 8) + 1;
              const addHour = Math.floor(Math.random() * 3) + 1;
              const endHour = startHour + addHour;
              qText = `Bây giờ là ${startHour} giờ. Hỏi ${addHour} giờ nữa là mấy giờ?`;
              qTextEn = `It is ${startHour} o'clock now. What time will it be in ${addHour} hours?`;
              
              const ansVi = `${endHour} giờ`;
              const ansEn = `${endHour} o'clock`;
              answer = language === 'en' ? ansEn : language === 'vi-en' ? `${ansVi} / ${ansEn}` : ansVi;
              
              expl = `${startHour} + ${addHour} = ${endHour} (giờ).`;
              explEn = `${startHour} + ${addHour} = ${endHour} (hours).`;
              
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wrongHour = Math.floor(Math.random() * 12) + 1;
                  if (wrongHour !== endHour) {
                      const wrongVi = `${wrongHour} giờ`;
                      const wrongEn = `${wrongHour} o'clock`;
                      options.add(language === 'en' ? wrongEn : language === 'vi-en' ? `${wrongVi} / ${wrongEn}` : wrongVi);
                  }
              }
              
              return {
                  id: `meas-dyn-${index}`,
                  type: 'multiple-choice',
                  text: language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText,
                  options: Array.from(options).sort(() => Math.random() - 0.5),
                  correctAnswer: answer,
                  explanation: language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl
              };
          }
      } else if (gradeId === 2) {
          const qType = Math.floor(Math.random() * 3);
          if (qType === 0) {
              const a = Math.floor(Math.random() * 20) + 5;
              const b = Math.floor(Math.random() * 10) + 2;
              qText = `Con chó nặng ${a}kg, con mèo nặng ${b}kg. Cả hai con nặng bao nhiêu kg?`;
              qTextEn = `A dog weighs ${a}kg, a cat weighs ${b}kg. How much do they weigh in total?`;
              answer = `${a + b}kg`;
              expl = `${a} + ${b} = ${a + b} (kg).`;
              explEn = `${a} + ${b} = ${a + b} (kg).`;
          } else if (qType === 1) {
              const a = Math.floor(Math.random() * 15) + 10;
              const b = Math.floor(Math.random() * 8) + 2;
              qText = `Thùng có ${a} lít nước, dùng hết ${b} lít. Còn lại bao nhiêu lít?`;
              qTextEn = `A tank has ${a} liters of water, used ${b} liters. How many liters are left?`;
              answer = `${a - b} lít`;
              expl = `${a} - ${b} = ${a - b} (lít).`;
              explEn = `${a} - ${b} = ${a - b} (liters).`;
          } else {
              const a = Math.floor(Math.random() * 5) + 7;
              const b = Math.floor(Math.random() * 3) + 1;
              qText = `Từ ${a} giờ sáng đến ${a + b} giờ sáng là mấy giờ?`;
              qTextEn = `From ${a} AM to ${a + b} AM is how many hours?`;
              answer = `${b} giờ`;
              expl = `${a + b} - ${a} = ${b} (giờ).`;
              explEn = `${a + b} - ${a} = ${b} (hours).`;
          }
      } else if (gradeId === 3) {
          const qType = Math.floor(Math.random() * 3);
          if (qType === 0) {
              const a = Math.floor(Math.random() * 5) + 2;
              const b = Math.floor(Math.random() * 800) + 100;
              qText = `Mẹ mua ${a} kg thịt và ${b} g cá. Hỏi mẹ mua tất cả bao nhiêu gam?`;
              qTextEn = `Mom bought ${a} kg of meat and ${b} g of fish. How many grams did she buy in total?`;
              answer = `${a * 1000 + b} g`;
              expl = `${a} kg = ${a * 1000} g. ${a * 1000} + ${b} = ${a * 1000 + b} (g).`;
              explEn = `${a} kg = ${a * 1000} g. ${a * 1000} + ${b} = ${a * 1000 + b} (g).`;
          } else if (qType === 1) {
              const a = Math.floor(Math.random() * 3) + 1;
              const b = Math.floor(Math.random() * 5) + 2;
              const c = Math.floor(Math.random() * 100) + 50;
              qText = `Một chai nước có ${a} lít. Rót ra ${b} cốc, mỗi cốc ${c} ml. Trong chai còn lại bao nhiêu ml?`;
              qTextEn = `A bottle has ${a} liters of water. Pour into ${b} cups, ${c} ml each. How many ml are left?`;
              const left = a * 1000 - b * c;
              answer = `${left} ml`;
              expl = `Rót ra: ${b} x ${c} = ${b * c} ml. Còn lại: ${a * 1000} - ${b * c} = ${left} ml.`;
              explEn = `Poured out: ${b} x ${c} = ${b * c} ml. Left: ${a * 1000} - ${b * c} = ${left} ml.`;
          } else {
              const a = Math.floor(Math.random() * 10) + 2;
              const b = Math.floor(Math.random() * 9) + 1;
              qText = `Đoạn thẳng AB dài ${a} cm ${b} mm. Hỏi đoạn thẳng AB dài bao nhiêu mm?`;
              qTextEn = `Segment AB is ${a} cm ${b} mm long. How long is segment AB in mm?`;
              answer = `${a * 10 + b} mm`;
              expl = `${a} cm = ${a * 10} mm. ${a * 10} + ${b} = ${a * 10 + b} (mm).`;
              explEn = `${a} cm = ${a * 10} mm. ${a * 10} + ${b} = ${a * 10 + b} (mm).`;
          }
      } else if (gradeId === 4) {
          const qType = Math.floor(Math.random() * 3);
          if (qType === 0) {
              const a = Math.floor(Math.random() * 5) + 2;
              const b = Math.floor(Math.random() * 8) + 1;
              qText = `Một xe tải chở ${a} tấn hàng, xe thứ hai chở ${b} tạ hàng. Cả hai xe chở bao nhiêu kg hàng?`;
              qTextEn = `A truck carries ${a} tons of goods, a second truck carries ${b} quintals. How many kg do they carry in total?`;
              answer = `${a * 1000 + b * 100} kg`;
              expl = `${a} tấn = ${a * 1000} kg. ${b} tạ = ${b * 100} kg. ${a * 1000} + ${b * 100} = ${a * 1000 + b * 100} (kg).`;
              explEn = `${a} tons = ${a * 1000} kg. ${b} quintals = ${b * 100} kg. ${a * 1000} + ${b * 100} = ${a * 1000 + b * 100} (kg).`;
          } else if (qType === 1) {
              const a = Math.floor(Math.random() * 5) + 2;
              const b = Math.floor(Math.random() * 40) + 10;
              qText = `${a} phút ${b} giây bằng bao nhiêu giây?`;
              qTextEn = `How many seconds is ${a} minutes ${b} seconds?`;
              answer = `${a * 60 + b}`;
              expl = `${a} phút = ${a * 60} giây. ${a * 60} + ${b} = ${a * 60 + b} (giây).`;
              explEn = `${a} minutes = ${a * 60} seconds. ${a * 60} + ${b} = ${a * 60 + b} (seconds).`;
          } else {
              const a = Math.floor(Math.random() * 10) + 2;
              qText = `${a} m² bằng bao nhiêu dm²?`;
              qTextEn = `How many dm² is ${a} m²?`;
              answer = `${a * 100}`;
              expl = `1 m² = 100 dm². ${a} m² = ${a * 100} dm².`;
              explEn = `1 m² = 100 dm². ${a} m² = ${a * 100} dm².`;
          }
      } else if (gradeId === 5) {
          const qType = Math.floor(Math.random() * 25);
          if (qType === 0) {
              // Length conversion
              const m = Math.floor(Math.random() * 10) + 2;
              const cm = Math.floor(Math.random() * 90) + 10;
              qText = `Đổi ${m} m ${cm} cm = ... cm. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${m} m ${cm} cm = ... cm. The correct number is:`;
              answer = `${m * 100 + cm}`;
              expl = `1 m = 100 cm. ${m} m = ${m * 100} cm. Vậy ${m} m ${cm} cm = ${m * 100 + cm} cm.`;
              explEn = `1 m = 100 cm. ${m} m = ${m * 100} cm. So ${m} m ${cm} cm = ${m * 100 + cm} cm.`;
          } else if (qType === 1) {
              // Mass conversion
              const kg = Math.floor(Math.random() * 5) + 1;
              const g = Math.floor(Math.random() * 500) + 100;
              qText = `Đổi ${kg} kg ${g} g = ... g. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${kg} kg ${g} g = ... g. The correct number is:`;
              answer = `${kg * 1000 + g}`;
              expl = `1 kg = 1000 g. ${kg} kg = ${kg * 1000} g. Vậy ${kg} kg ${g} g = ${kg * 1000 + g} g.`;
              explEn = `1 kg = 1000 g. ${kg} kg = ${kg * 1000} g. So ${kg} kg ${g} g = ${kg * 1000 + g} g.`;
          } else if (qType === 2) {
              // Area conversion
              const m2 = Math.floor(Math.random() * 10) + 2;
              const dm2 = Math.floor(Math.random() * 90) + 10;
              qText = `Đổi ${m2} m² ${dm2} dm² = ... dm². Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${m2} m² ${dm2} dm² = ... dm². The correct number is:`;
              answer = `${m2 * 100 + dm2}`;
              expl = `1 m² = 100 dm². ${m2} m² = ${m2 * 100} dm². Vậy ${m2} m² ${dm2} dm² = ${m2 * 100 + dm2} dm².`;
              explEn = `1 m² = 100 dm². ${m2} m² = ${m2 * 100} dm². So ${m2} m² ${dm2} dm² = ${m2 * 100 + dm2} dm².`;
          } else if (qType === 3) {
              // Volume conversion
              const m3 = Math.floor(Math.random() * 5) + 2;
              const dm3 = Math.floor(Math.random() * 500) + 100;
              qText = `Đổi ${m3} m³ ${dm3} dm³ = ... dm³. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${m3} m³ ${dm3} dm³ = ... dm³. The correct number is:`;
              answer = `${m3 * 1000 + dm3}`;
              expl = `1 m³ = 1000 dm³. ${m3} m³ = ${m3 * 1000} dm³. Vậy ${m3} m³ ${dm3} dm³ = ${m3 * 1000 + dm3} dm³.`;
              explEn = `1 m³ = 1000 dm³. ${m3} m³ = ${m3 * 1000} dm³. So ${m3} m³ ${dm3} dm³ = ${m3 * 1000 + dm3} dm³.`;
          } else if (qType === 4) {
              // Time conversion: mixed to single
              const subtypes = [
                  { unit1: 'năm', unit1En: 'years', unit2: 'tháng', unit2En: 'months', factor: 12 },
                  { unit1: 'ngày', unit1En: 'days', unit2: 'giờ', unit2En: 'hours', factor: 24 },
                  { unit1: 'giờ', unit1En: 'hours', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { unit1: 'phút', unit1En: 'minutes', unit2: 'giây', unit2En: 'seconds', factor: 60 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const v1 = Math.floor(Math.random() * 5) + 2;
              const v2 = Math.floor(Math.random() * (st.factor - 1)) + 1;
              
              qText = `Số thích hợp điền vào chỗ chấm: ${v1} ${st.unit1} ${v2} ${st.unit2} = ... ${st.unit2}`;
              qTextEn = `The correct number to fill in the blank: ${v1} ${st.unit1En} ${v2} ${st.unit2En} = ... ${st.unit2En}`;
              answer = `${v1 * st.factor + v2}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. ${v1} ${st.unit1} = ${v1 * st.factor} ${st.unit2}. Vậy ${v1} ${st.unit1} ${v2} ${st.unit2} = ${v1 * st.factor + v2} ${st.unit2}.`;
              explEn = `1 ${st.unit1En.replace(/s$/, '')} = ${st.factor} ${st.unit2En}. ${v1} ${st.unit1En} = ${v1 * st.factor} ${st.unit2En}. So ${v1} ${st.unit1En} ${v2} ${st.unit2En} = ${v1 * st.factor + v2} ${st.unit2En}.`;
          } else if (qType === 5) {
              // Time conversion: single to mixed
              const subtypes = [
                  { unit1: 'năm', unit1En: 'years', unit2: 'tháng', unit2En: 'months', factor: 12 },
                  { unit1: 'ngày', unit1En: 'days', unit2: 'giờ', unit2En: 'hours', factor: 24 },
                  { unit1: 'giờ', unit1En: 'hours', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { unit1: 'phút', unit1En: 'minutes', unit2: 'giây', unit2En: 'seconds', factor: 60 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const v1 = Math.floor(Math.random() * 5) + 2;
              const v2 = Math.floor(Math.random() * (st.factor - 1)) + 1;
              const total = v1 * st.factor + v2;
              
              qText = `Điền số thích hợp: ${total} ${st.unit2} = ... ${st.unit1} ... ${st.unit2}. Đáp án viết liền nhau (VD: ${v1} ${st.unit1} ${v2} ${st.unit2})`;
              qTextEn = `Fill in the blank: ${total} ${st.unit2En} = ... ${st.unit1En} ... ${st.unit2En}. Write answer together (e.g., ${v1} ${st.unit1En} ${v2} ${st.unit2En})`;
              answer = `${v1} ${st.unit1} ${v2} ${st.unit2}`;
              expl = `Ta có ${total} : ${st.factor} = ${v1} (dư ${v2}). Vậy ${total} ${st.unit2} = ${v1} ${st.unit1} ${v2} ${st.unit2}.`;
              explEn = `We have ${total} : ${st.factor} = ${v1} (remainder ${v2}). So ${total} ${st.unit2En} = ${v1} ${st.unit1En} ${v2} ${st.unit2En}.`;
              
              const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
              const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
              if (type === 'fill-in-blank' || type === 'short-answer') {
                  return { id: `meas-dyn-${index}`, type: type, text: finalQText, correctAnswer: answer, explanation: finalQExpl, placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...' };
              }
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const w1 = v1 + Math.floor(Math.random() * 3) - 1;
                  const w2 = v2 + Math.floor(Math.random() * 10) - 5;
                  if (w1 > 0 && w2 > 0 && (w1 !== v1 || w2 !== v2)) {
                      options.add(`${w1} ${st.unit1} ${w2} ${st.unit2}`);
                  }
              }
              return { id: `meas-dyn-${index}`, type: 'multiple-choice', text: finalQText, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: answer, explanation: finalQExpl };
          } else if (qType === 6) {
              // Time conversion: fraction to single
              const subtypes = [
                  { num: 3, den: 4, unit1: 'thế kỉ', unit1En: 'century', unit2: 'năm', unit2En: 'years', factor: 100 },
                  { num: 7, den: 8, unit1: 'ngày', unit1En: 'day', unit2: 'giờ', unit2En: 'hours', factor: 24 },
                  { num: 2, den: 5, unit1: 'giờ', unit1En: 'hour', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { num: 3, den: 10, unit1: 'phút', unit1En: 'minute', unit2: 'giây', unit2En: 'seconds', factor: 60 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              
              qText = `Số thích hợp điền vào chỗ chấm: ${st.num}/${st.den} ${st.unit1} = ... ${st.unit2}`;
              qTextEn = `The correct number to fill in the blank: ${st.num}/${st.den} ${st.unit1En} = ... ${st.unit2En}`;
              answer = `${(st.factor * st.num) / st.den}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. ${st.num}/${st.den} ${st.unit1} = ${st.factor} x ${st.num}/${st.den} = ${(st.factor * st.num) / st.den} ${st.unit2}.`;
              explEn = `1 ${st.unit1En} = ${st.factor} ${st.unit2En}. ${st.num}/${st.den} ${st.unit1En} = ${st.factor} x ${st.num}/${st.den} = ${(st.factor * st.num) / st.den} ${st.unit2En}.`;
          } else if (qType === 7) {
              // Time conversion: single to decimal
              const subtypes = [
                  { val: 45, unit1: 'phút', unit1En: 'minutes', unit2: 'giờ', unit2En: 'hours', factor: 60 },
                  { val: 12, unit1: 'phút', unit1En: 'minutes', unit2: 'giờ', unit2En: 'hours', factor: 60 },
                  { val: 15, unit1: 'giây', unit1En: 'seconds', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { val: 36, unit1: 'tháng', unit1En: 'months', unit2: 'năm', unit2En: 'years', factor: 12 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              
              qText = `Viết số thập phân thích hợp: ${st.val} ${st.unit1} = ... ${st.unit2}`;
              qTextEn = `Write the appropriate decimal number: ${st.val} ${st.unit1En} = ... ${st.unit2En}`;
              answer = `${st.val / st.factor}`;
              expl = `Ta có ${st.val} ${st.unit1} = ${st.val}/${st.factor} ${st.unit2} = ${st.val / st.factor} ${st.unit2}.`;
              explEn = `We have ${st.val} ${st.unit1En} = ${st.val}/${st.factor} ${st.unit2En} = ${st.val / st.factor} ${st.unit2En}.`;
          } else if (qType === 8) {
              // Time conversion: mixed to decimal
              const subtypes = [
                  { v1: 2, v2: 15, unit1: 'giờ', unit1En: 'hours', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { v1: 5, v2: 12, unit1: 'phút', unit1En: 'minutes', unit2: 'giây', unit2En: 'seconds', factor: 60 },
                  { v1: 1, v2: 30, unit1: 'giờ', unit1En: 'hours', unit2: 'phút', unit2En: 'minutes', factor: 60 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              
              qText = `Viết số thập phân thích hợp: ${st.v1} ${st.unit1} ${st.v2} ${st.unit2} = ... ${st.unit1}`;
              qTextEn = `Write the appropriate decimal number: ${st.v1} ${st.unit1En} ${st.v2} ${st.unit2En} = ... ${st.unit1En}`;
              answer = `${st.v1 + st.v2 / st.factor}`;
              expl = `Ta có ${st.v2} ${st.unit2} = ${st.v2}/${st.factor} ${st.unit1} = ${st.v2 / st.factor} ${st.unit1}. Vậy ${st.v1} ${st.unit1} ${st.v2} ${st.unit2} = ${st.v1} + ${st.v2 / st.factor} = ${st.v1 + st.v2 / st.factor} ${st.unit1}.`;
              explEn = `We have ${st.v2} ${st.unit2En} = ${st.v2}/${st.factor} ${st.unit1En} = ${st.v2 / st.factor} ${st.unit1En}. So ${st.v1} ${st.unit1En} ${st.v2} ${st.unit2En} = ${st.v1} + ${st.v2 / st.factor} = ${st.v1 + st.v2 / st.factor} ${st.unit1En}.`;
          } else if (qType === 9) {
              // Time arithmetic: addition
              const h1 = Math.floor(Math.random() * 10) + 1;
              const m1 = Math.floor(Math.random() * 40) + 20;
              const h2 = Math.floor(Math.random() * 10) + 1;
              const m2 = Math.floor(Math.random() * 40) + 20;
              
              qText = `Tính: ${h1} giờ ${m1} phút + ${h2} giờ ${m2} phút = ...`;
              qTextEn = `Calculate: ${h1} hours ${m1} minutes + ${h2} hours ${m2} minutes = ...`;
              
              let totalH = h1 + h2;
              let totalM = m1 + m2;
              let explExtra = '';
              let explExtraEn = '';
              
              if (totalM >= 60) {
                  explExtra = ` = ${totalH + 1} giờ ${totalM - 60} phút`;
                  explExtraEn = ` = ${totalH + 1} hours ${totalM - 60} minutes`;
                  totalH += 1;
                  totalM -= 60;
              }
              
              answer = `${totalH} giờ ${totalM} phút`;
              expl = `Ta cộng riêng từng đơn vị: ${h1} + ${h2} = ${h1 + h2} (giờ); ${m1} + ${m2} = ${m1 + m2} (phút). Kết quả là ${h1 + h2} giờ ${m1 + m2} phút${explExtra}.`;
              explEn = `Add each unit separately: ${h1} + ${h2} = ${h1 + h2} (hours); ${m1} + ${m2} = ${m1 + m2} (minutes). The result is ${h1 + h2} hours ${m1 + m2} minutes${explExtraEn}.`;
              
              const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
              const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
              if (type === 'fill-in-blank' || type === 'short-answer') {
                  return { id: `meas-dyn-${index}`, type: type, text: finalQText, correctAnswer: answer, explanation: finalQExpl, placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...' };
              }
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wH = totalH + Math.floor(Math.random() * 3) - 1;
                  const wM = totalM + Math.floor(Math.random() * 20) - 10;
                  if (wH > 0 && wM > 0 && (wH !== totalH || wM !== totalM)) {
                      options.add(`${wH} giờ ${wM} phút`);
                  }
              }
              return { id: `meas-dyn-${index}`, type: 'multiple-choice', text: finalQText, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: answer, explanation: finalQExpl };
          } else if (qType === 10) {
              // Time arithmetic: subtraction
              let m1 = Math.floor(Math.random() * 30) + 20;
              let s1 = Math.floor(Math.random() * 30) + 10;
              const m2 = Math.floor(Math.random() * (m1 - 10)) + 1;
              const s2 = Math.floor(Math.random() * 30) + 30; // Make s2 > s1 to force borrowing
              
              qText = `Tính: ${m1} phút ${s1} giây - ${m2} phút ${s2} giây = ...`;
              qTextEn = `Calculate: ${m1} minutes ${s1} seconds - ${m2} minutes ${s2} seconds = ...`;
              
              let explBorrow = '';
              let explBorrowEn = '';
              let calcM1 = m1;
              let calcS1 = s1;
              
              if (s1 < s2) {
                  calcM1 -= 1;
                  calcS1 += 60;
                  explBorrow = `Vì ${s1} giây không trừ được ${s2} giây, ta đổi ${m1} phút ${s1} giây = ${calcM1} phút ${calcS1} giây. `;
                  explBorrowEn = `Since ${s1} seconds cannot subtract ${s2} seconds, we convert ${m1} minutes ${s1} seconds = ${calcM1} minutes ${calcS1} seconds. `;
              }
              
              const ansM = calcM1 - m2;
              const ansS = calcS1 - s2;
              
              answer = `${ansM} phút ${ansS} giây`;
              expl = `${explBorrow}Ta trừ riêng từng đơn vị: ${calcM1} - ${m2} = ${ansM} (phút); ${calcS1} - ${s2} = ${ansS} (giây). Kết quả là ${ansM} phút ${ansS} giây.`;
              explEn = `${explBorrowEn}Subtract each unit separately: ${calcM1} - ${m2} = ${ansM} (minutes); ${calcS1} - ${s2} = ${ansS} (seconds). The result is ${ansM} minutes ${ansS} seconds.`;
              
              const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
              const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
              if (type === 'fill-in-blank' || type === 'short-answer') {
                  return { id: `meas-dyn-${index}`, type: type, text: finalQText, correctAnswer: answer, explanation: finalQExpl, placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...' };
              }
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wM = ansM + Math.floor(Math.random() * 3) - 1;
                  const wS = ansS + Math.floor(Math.random() * 20) - 10;
                  if (wM > 0 && wS > 0 && (wM !== ansM || wS !== ansS)) {
                      options.add(`${wM} phút ${wS} giây`);
                  }
              }
              return { id: `meas-dyn-${index}`, type: 'multiple-choice', text: finalQText, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: answer, explanation: finalQExpl };
          } else if (qType === 11) {
              // Time arithmetic: multiplication
              const m = Math.floor(Math.random() * 10) + 2;
              const s = Math.floor(Math.random() * 20) + 10;
              const factor = Math.floor(Math.random() * 4) + 2;
              
              qText = `Tính: ${m} phút ${s} giây x ${factor} = ...`;
              qTextEn = `Calculate: ${m} minutes ${s} seconds x ${factor} = ...`;
              
              let totalM = m * factor;
              let totalS = s * factor;
              let explExtra = '';
              let explExtraEn = '';
              
              if (totalS >= 60) {
                  const addM = Math.floor(totalS / 60);
                  const remS = totalS % 60;
                  explExtra = ` = ${totalM + addM} phút ${remS} giây`;
                  explExtraEn = ` = ${totalM + addM} minutes ${remS} seconds`;
                  totalM += addM;
                  totalS = remS;
              }
              
              answer = `${totalM} phút ${totalS} giây`;
              expl = `Ta nhân riêng từng đơn vị: ${m} x ${factor} = ${m * factor} (phút); ${s} x ${factor} = ${s * factor} (giây). Kết quả là ${m * factor} phút ${s * factor} giây${explExtra}.`;
              explEn = `Multiply each unit separately: ${m} x ${factor} = ${m * factor} (minutes); ${s} x ${factor} = ${s * factor} (seconds). The result is ${m * factor} minutes ${s * factor} seconds${explExtraEn}.`;
              
              const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
              const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
              if (type === 'fill-in-blank' || type === 'short-answer') {
                  return { id: `meas-dyn-${index}`, type: type, text: finalQText, correctAnswer: answer, explanation: finalQExpl, placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...' };
              }
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wM = totalM + Math.floor(Math.random() * 3) - 1;
                  const wS = totalS + Math.floor(Math.random() * 20) - 10;
                  if (wM > 0 && wS >= 0 && (wM !== totalM || wS !== totalS)) {
                      options.add(`${wM} phút ${wS} giây`);
                  }
              }
              return { id: `meas-dyn-${index}`, type: 'multiple-choice', text: finalQText, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: answer, explanation: finalQExpl };
          } else if (qType === 12) {
              // Time arithmetic: division
              const h = Math.floor(Math.random() * 10) + 10;
              const m = Math.floor(Math.random() * 50) + 10;
              const divisor = Math.floor(Math.random() * 4) + 2;
              
              const totalMinutes = h * 60 + m;
              const adjustedTotalMinutes = totalMinutes - (totalMinutes % divisor);
              const adjH = Math.floor(adjustedTotalMinutes / 60);
              const adjM = adjustedTotalMinutes % 60;
              
              const ansTotalMinutes = adjustedTotalMinutes / divisor;
              const ansH = Math.floor(ansTotalMinutes / 60);
              const ansM = ansTotalMinutes % 60;
              
              qText = `Tính: ${adjH} giờ ${adjM} phút : ${divisor} = ...`;
              qTextEn = `Calculate: ${adjH} hours ${adjM} minutes : ${divisor} = ...`;
              
              answer = ansH > 0 ? `${ansH} giờ ${ansM} phút` : `${ansM} phút`;
              
              let step1H = Math.floor(adjH / divisor);
              let remH = adjH % divisor;
              let step1M = remH * 60 + adjM;
              let step2M = step1M / divisor;
              
              expl = `Ta chia lần lượt từ trái sang phải: ${adjH} chia ${divisor} được ${step1H} (giờ), dư ${remH} giờ. Đổi ${remH} giờ = ${remH * 60} phút. ${remH * 60} phút + ${adjM} phút = ${step1M} phút. ${step1M} chia ${divisor} được ${step2M} (phút). Kết quả là ${answer}.`;
              explEn = `Divide from left to right: ${adjH} divided by ${divisor} is ${step1H} (hours), remainder ${remH} hours. Convert ${remH} hours = ${remH * 60} minutes. ${remH * 60} minutes + ${adjM} minutes = ${step1M} minutes. ${step1M} divided by ${divisor} is ${step2M} (minutes). The result is ${answer}.`;
              
              const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
              const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
              if (type === 'fill-in-blank' || type === 'short-answer') {
                  return { id: `meas-dyn-${index}`, type: type, text: finalQText, correctAnswer: answer, explanation: finalQExpl, placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...' };
              }
              const options = new Set<string>();
              options.add(answer);
              while (options.size < 4) {
                  const wH = ansH + Math.floor(Math.random() * 3) - 1;
                  const wM = ansM + Math.floor(Math.random() * 20) - 10;
                  if (ansH > 0) {
                      if (wH >= 0 && wM >= 0 && (wH !== ansH || wM !== ansM)) {
                          options.add(wH > 0 ? `${wH} giờ ${wM} phút` : `${wM} phút`);
                      }
                  } else {
                      if (wM > 0 && wM !== ansM) {
                          options.add(`${wM} phút`);
                      }
                  }
              }
              return { id: `meas-dyn-${index}`, type: 'multiple-choice', text: finalQText, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: answer, explanation: finalQExpl };
          } else if (qType === 13) {
              // Velocity - distance
              const v = Math.floor(Math.random() * 30) + 20;
              const t = Math.floor(Math.random() * 3) + 2;
              qText = `Một ô tô đi với vận tốc ${v} km/giờ trong ${t} giờ. Quãng đường ô tô đi được là bao nhiêu km?`;
              qTextEn = `A car travels at ${v} km/h for ${t} hours. What is the distance traveled?`;
              answer = `${v * t} km`;
              expl = `Quãng đường = Vận tốc x Thời gian = ${v} x ${t} = ${v * t} (km).`;
              explEn = `Distance = Speed x Time = ${v} x ${t} = ${v * t} (km).`;
          } else if (qType === 14) {
              // Velocity - speed
              const v = Math.floor(Math.random() * 20) + 30;
              const t = Math.floor(Math.random() * 3) + 2;
              const s = v * t;
              qText = `Một xe máy đi quãng đường ${s} km trong ${t} giờ. Vận tốc của xe máy là bao nhiêu km/giờ?`;
              qTextEn = `A motorbike travels a distance of ${s} km in ${t} hours. What is the speed of the motorbike in km/h?`;
              answer = `${v} km/giờ`;
              expl = `Vận tốc = Quãng đường : Thời gian = ${s} : ${t} = ${v} (km/giờ).`;
              explEn = `Speed = Distance : Time = ${s} : ${t} = ${v} (km/h).`;
          } else if (qType === 15) {
              // Velocity - time
              const v = Math.floor(Math.random() * 15) + 10;
              const t = Math.floor(Math.random() * 3) + 2;
              const s = v * t;
              qText = `Một người đi xe đạp với vận tốc ${v} km/giờ. Hỏi người đó đi quãng đường ${s} km hết bao nhiêu thời gian?`;
              qTextEn = `A cyclist travels at a speed of ${v} km/h. How long does it take to travel a distance of ${s} km?`;
              answer = `${t} giờ`;
              expl = `Thời gian = Quãng đường : Vận tốc = ${s} : ${v} = ${t} (giờ).`;
              explEn = `Time = Distance : Speed = ${s} : ${v} = ${t} (hours).`;
          } else if (qType === 16) {
              // Area conversion with hectare (ha)
              const subtypes = [
                  { unit1: 'ha', unit1En: 'ha', unit2: 'm²', unit2En: 'm²', factor: 10000 },
                  { unit1: 'km²', unit1En: 'km²', unit2: 'ha', unit2En: 'ha', factor: 100 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const val = Math.floor(Math.random() * 15) + 2;
              
              qText = `Đổi ${val} ${st.unit1} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${val} ${st.unit1En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${val * st.factor}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. Vậy ${val} ${st.unit1} = ${val * st.factor} ${st.unit2}.`;
              explEn = `1 ${st.unit1En} = ${st.factor} ${st.unit2En}. So ${val} ${st.unit1En} = ${val * st.factor} ${st.unit2En}.`;
          } else if (qType === 17) {
              // Mass conversion with tấn, tạ, yến
              const subtypes = [
                  { unit1: 'tấn', unit1En: 'tons', unit2: 'kg', unit2En: 'kg', factor: 1000 },
                  { unit1: 'tạ', unit1En: 'quintals', unit2: 'kg', unit2En: 'kg', factor: 100 },
                  { unit1: 'yến', unit1En: 'decagrams (yen)', unit2: 'kg', unit2En: 'kg', factor: 10 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const val1 = Math.floor(Math.random() * 8) + 2;
              const val2 = Math.floor(Math.random() * (st.factor - 1)) + 1;
              
              qText = `Đổi ${val1} ${st.unit1} ${val2} ${st.unit2} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${val1} ${st.unit1En} ${val2} ${st.unit2En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${val1 * st.factor + val2}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. ${val1} ${st.unit1} = ${val1 * st.factor} ${st.unit2}. Vậy ${val1} ${st.unit1} ${val2} ${st.unit2} = ${val1 * st.factor + val2} ${st.unit2}.`;
              explEn = `1 ${st.unit1En.split(' ')[0]} = ${st.factor} ${st.unit2En}. ${val1} ${st.unit1En} = ${val1 * st.factor} ${st.unit2En}. So ${val1} ${st.unit1En} ${val2} ${st.unit2En} = ${val1 * st.factor + val2} ${st.unit2En}.`;
          } else if (qType === 18) {
              // Length conversion with km, m
              const km = Math.floor(Math.random() * 10) + 2;
              const m = Math.floor(Math.random() * 900) + 10;
              qText = `Đổi ${km} km ${m} m = ... m. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${km} km ${m} m = ... m. The correct number is:`;
              answer = `${km * 1000 + m}`;
              expl = `1 km = 1000 m. ${km} km = ${km * 1000} m. Vậy ${km} km ${m} m = ${km * 1000 + m} m.`;
              explEn = `1 km = 1000 m. ${km} km = ${km * 1000} m. So ${km} km ${m} m = ${km * 1000 + m} m.`;
          } else if (qType === 19) {
              // Volume conversion with cm3
              const subtypes = [
                  { unit1: 'dm³', unit1En: 'dm³', unit2: 'cm³', unit2En: 'cm³', factor: 1000 },
                  { unit1: 'm³', unit1En: 'm³', unit2: 'dm³', unit2En: 'dm³', factor: 1000 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const val = Math.floor(Math.random() * 10) + 2;
              const fraction = [0.25, 0.5, 0.75][Math.floor(Math.random() * 3)];
              const decVal = val + fraction;
              
              qText = `Đổi ${decVal} ${st.unit1} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${decVal} ${st.unit1En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${decVal * st.factor}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. Vậy ${decVal} ${st.unit1} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2}.`;
              explEn = `1 ${st.unit1En} = ${st.factor} ${st.unit2En}. So ${decVal} ${st.unit1En} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2En}.`;
          } else if (qType === 20) {
              // Decimal to single unit (Length/Mass)
              const subtypes = [
                  { unit1: 'm', unit1En: 'm', unit2: 'cm', unit2En: 'cm', factor: 100 },
                  { unit1: 'kg', unit1En: 'kg', unit2: 'g', unit2En: 'g', factor: 1000 },
                  { unit1: 'tấn', unit1En: 'tons', unit2: 'kg', unit2En: 'kg', factor: 1000 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const val = Math.floor(Math.random() * 10) + 1;
              const dec = Math.floor(Math.random() * 9) + 1;
              const decVal = parseFloat(`${val}.${dec}`);
              
              qText = `Đổi ${decVal} ${st.unit1} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${decVal} ${st.unit1En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${decVal * st.factor}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. Vậy ${decVal} ${st.unit1} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2}.`;
              explEn = `1 ${st.unit1En} = ${st.factor} ${st.unit2En}. So ${decVal} ${st.unit1En} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2En}.`;
          } else if (qType === 21) {
              // Fraction to single unit (Mass/Length/Area)
              const subtypes = [
                  { num: 1, den: 2, unit1: 'kg', unit1En: 'kg', unit2: 'g', unit2En: 'g', factor: 1000 },
                  { num: 3, den: 4, unit1: 'm', unit1En: 'm', unit2: 'cm', unit2En: 'cm', factor: 100 },
                  { num: 1, den: 5, unit1: 'ha', unit1En: 'ha', unit2: 'm²', unit2En: 'm²', factor: 10000 },
                  { num: 2, den: 5, unit1: 'tấn', unit1En: 'tons', unit2: 'kg', unit2En: 'kg', factor: 1000 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              
              qText = `Đổi ${st.num}/${st.den} ${st.unit1} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${st.num}/${st.den} ${st.unit1En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${(st.factor * st.num) / st.den}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. Vậy ${st.num}/${st.den} ${st.unit1} = ${st.factor} x ${st.num}/${st.den} = ${(st.factor * st.num) / st.den} ${st.unit2}.`;
              explEn = `1 ${st.unit1En} = ${st.factor} ${st.unit2En}. So ${st.num}/${st.den} ${st.unit1En} = ${st.factor} x ${st.num}/${st.den} = ${(st.factor * st.num) / st.den} ${st.unit2En}.`;
          } else if (qType === 22) {
              // Time conversion: decimal to smaller unit
              const subtypes = [
                  { unit1: 'năm', unit1En: 'years', unit2: 'tháng', unit2En: 'months', factor: 12 },
                  { unit1: 'ngày', unit1En: 'days', unit2: 'giờ', unit2En: 'hours', factor: 24 },
                  { unit1: 'giờ', unit1En: 'hours', unit2: 'phút', unit2En: 'minutes', factor: 60 },
                  { unit1: 'phút', unit1En: 'minutes', unit2: 'giây', unit2En: 'seconds', factor: 60 }
              ];
              const st = subtypes[Math.floor(Math.random() * subtypes.length)];
              const val = Math.floor(Math.random() * 5) + 1;
              const fraction = [0.5, 0.25, 0.75][Math.floor(Math.random() * 3)];
              const decVal = val + fraction;
              
              qText = `Đổi ${decVal} ${st.unit1} = ... ${st.unit2}. Số thích hợp điền vào chỗ chấm là:`;
              qTextEn = `Convert ${decVal} ${st.unit1En} = ... ${st.unit2En}. The correct number is:`;
              answer = `${decVal * st.factor}`;
              expl = `1 ${st.unit1} = ${st.factor} ${st.unit2}. Vậy ${decVal} ${st.unit1} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2}.`;
              explEn = `1 ${st.unit1En.replace(/s$/, '')} = ${st.factor} ${st.unit2En}. So ${decVal} ${st.unit1En} = ${decVal} x ${st.factor} = ${decVal * st.factor} ${st.unit2En}.`;
          } else if (qType === 23) {
              // Velocity - average speed with decimal time
              const v = Math.floor(Math.random() * 20) + 30; // 30 to 49
              const tDec = [1.5, 2.5, 3.5][Math.floor(Math.random() * 3)];
              const s = v * tDec;
              
              qText = `Một ô tô đi quãng đường ${s} km trong ${tDec} giờ. Vận tốc của ô tô là bao nhiêu km/giờ?`;
              qTextEn = `A car travels a distance of ${s} km in ${tDec} hours. What is the speed of the car in km/h?`;
              answer = `${v} km/giờ`;
              expl = `Vận tốc = Quãng đường : Thời gian = ${s} : ${tDec} = ${v} (km/giờ).`;
              explEn = `Speed = Distance : Time = ${s} : ${tDec} = ${v} (km/h).`;
          } else {
              // Velocity - time with decimal result
              const v = Math.floor(Math.random() * 10) * 5 + 30; // 30, 35, 40, 45...
              const tDec = [1.5, 2.5, 1.2, 2.4][Math.floor(Math.random() * 4)];
              const s = Math.round(v * tDec * 10) / 10;
              
              qText = `Một xe máy đi với vận tốc ${v} km/giờ. Hỏi xe máy đi quãng đường ${s} km hết bao nhiêu thời gian (tính bằng giờ)?`;
              qTextEn = `A motorbike travels at a speed of ${v} km/h. How long does it take to travel a distance of ${s} km (in hours)?`;
              answer = `${tDec} giờ`;
              expl = `Thời gian = Quãng đường : Vận tốc = ${s} : ${v} = ${tDec} (giờ).`;
              explEn = `Time = Distance : Speed = ${s} : ${v} = ${tDec} (hours).`;
          }
      }
      
      if (qText !== '') {
          const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
          const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;
          
          if (type === 'fill-in-blank' || type === 'short-answer') {
              return {
                  id: `meas-dyn-${index}`,
                  type: type,
                  text: finalQText,
                  correctAnswer: answer.replace(/[^0-9,.]/g, ''),
                  explanation: finalQExpl,
                  placeholder: language === 'en' ? 'Enter number...' : language === 'vi-en' ? 'Nhập số... / Enter number...' : 'Nhập số...'
              };
          }
          
          const options = new Set<string>();
          options.add(answer);
          const unit = answer.replace(/[0-9,.]/g, '').trim();
          const val = parseFloat(answer.replace(/[^0-9,.]/g, ''));
          while (options.size < 4) {
              const wrongVal = val + Math.floor(Math.random() * 20) - 10;
              if (wrongVal > 0 && wrongVal !== val) {
                  options.add(unit ? `${wrongVal} ${unit}` : `${wrongVal}`);
              }
          }
          
          return {
              id: `meas-dyn-${index}`,
              type: 'multiple-choice',
              text: finalQText,
              options: Array.from(options).sort(() => Math.random() - 0.5),
              correctAnswer: answer,
              explanation: finalQExpl
          };
      }
  }

   const questionsByGrade: Record<number, any[]> = {
    1: [
      { text: "1 tuần lễ có mấy ngày?", textEn: "How many days are in a week?", answer: "7", answerEn: "7", options: ["5", "6", "7", "8"], optionsEn: ["5", "6", "7", "8"], expl: "Một tuần có 7 ngày: Thứ 2 đến Chủ nhật.", explEn: "A week has 7 days: Monday to Sunday." },
      { text: "Đồng hồ chỉ 12 giờ thì kim ngắn chỉ số mấy?", textEn: "When the clock shows 12 o'clock, which number does the short hand point to?", answer: "12", answerEn: "12", options: ["12", "6", "3", "1"], optionsEn: ["12", "6", "3", "1"], expl: "12 giờ đúng thì cả kim ngắn và kim dài đều chỉ số 12.", explEn: "At exactly 12 o'clock, both the short and long hands point to 12." },
      { text: "Gang tay của em dài khoảng bao nhiêu?", textEn: "How long is your hand span approximately?", answer: "15 cm", answerEn: "15 cm", options: ["15 cm", "1 m", "1 km", "1 mm"], optionsEn: ["15 cm", "1 m", "1 km", "1 mm"], expl: "Gang tay học sinh lớp 1 khoảng 10-15cm.", explEn: "A 1st grader's hand span is about 10-15cm." },
      { text: "Một ngày có mấy giờ?", textEn: "How many hours are in a day?", answer: "24", answerEn: "24", options: ["12", "24", "10", "60"], optionsEn: ["12", "24", "10", "60"], expl: "Một ngày có 24 giờ.", explEn: "A day has 24 hours." },
      { text: "Hôm nay là thứ Ba, ngày mai là thứ mấy?", textEn: "Today is Tuesday, what day is tomorrow?", answer: "Thứ Tư", answerEn: "Wednesday", options: ["Thứ Hai", "Thứ Tư", "Thứ Năm", "Chủ nhật"], optionsEn: ["Monday", "Wednesday", "Thursday", "Sunday"], expl: "Sau thứ Ba là thứ Tư.", explEn: "After Tuesday is Wednesday." },
      { text: "Sợi dây dài 10cm, cắt đi 3cm còn lại bao nhiêu?", textEn: "A string is 10cm long, cut off 3cm, how much is left?", answer: "7cm", answerEn: "7cm", options: ["7cm", "13cm", "6cm", "8cm"], optionsEn: ["7cm", "13cm", "6cm", "8cm"], expl: "10 - 3 = 7 (cm).", explEn: "10 - 3 = 7 (cm)." },
      { text: "Tháng 1 có bao nhiêu ngày?", textEn: "How many days are in January?", answer: "31", answerEn: "31", options: ["30", "31", "28", "29"], optionsEn: ["30", "31", "28", "29"], expl: "Tháng 1 có 31 ngày.", explEn: "January has 31 days." },
      { text: "Kim dài của đồng hồ chỉ phút hay chỉ giờ?", textEn: "Does the long hand of a clock point to minutes or hours?", answer: "Chỉ phút", answerEn: "Minutes", options: ["Chỉ phút", "Chỉ giờ", "Chỉ giây", "Chỉ ngày"], optionsEn: ["Minutes", "Hours", "Seconds", "Days"], expl: "Kim dài chỉ phút, kim ngắn chỉ giờ.", explEn: "The long hand points to minutes, the short hand points to hours." },
      { text: "1 chục bằng bao nhiêu?", textEn: "How much is 1 ten?", answer: "10", answerEn: "10", options: ["1", "10", "100", "12"], optionsEn: ["1", "10", "100", "12"], expl: "1 chục = 10.", explEn: "1 ten = 10." },
      { text: "Buổi sáng em đi học lúc mấy giờ?", textEn: "What time do you go to school in the morning?", answer: "7 giờ", answerEn: "7 o'clock", options: ["7 giờ", "12 giờ", "20 giờ", "24 giờ"], optionsEn: ["7 o'clock", "12 o'clock", "20 o'clock", "24 o'clock"], expl: "Học sinh thường đi học lúc 7 giờ sáng.", explEn: "Students usually go to school at 7 AM." },
      { text: "Hôm qua là thứ Hai, hôm nay là thứ mấy?", textEn: "Yesterday was Monday, what day is today?", answer: "Thứ Ba", answerEn: "Tuesday", options: ["Thứ Ba", "Chủ nhật", "Thứ Tư", "Thứ Năm"], optionsEn: ["Tuesday", "Sunday", "Wednesday", "Thursday"], expl: "Sau thứ Hai là thứ Ba.", explEn: "After Monday is Tuesday." },
      { text: "Một năm có bao nhiêu tháng?", textEn: "How many months are in a year?", answer: "12", answerEn: "12", options: ["10", "11", "12", "13"], optionsEn: ["10", "11", "12", "13"], expl: "Một năm có 12 tháng từ tháng 1 đến tháng 12.", explEn: "A year has 12 months from January to December." },
      { text: "Đồng hồ chỉ 6 giờ thì kim dài chỉ số mấy?", textEn: "When the clock shows 6 o'clock, which number does the long hand point to?", answer: "12", answerEn: "12", options: ["6", "12", "3", "9"], optionsEn: ["6", "12", "3", "9"], expl: "Khi giờ đúng, kim dài luôn chỉ số 12.", explEn: "On the hour, the long hand always points to 12." },
      { text: "Thước kẻ của em thường dài bao nhiêu?", textEn: "How long is your ruler usually?", answer: "20 cm", answerEn: "20 cm", options: ["20 cm", "2 m", "20 m", "2 km"], optionsEn: ["20 cm", "2 m", "20 m", "2 km"], expl: "Thước kẻ học sinh thường dài 20cm hoặc 30cm.", explEn: "A student ruler is usually 20cm or 30cm long." },
      { text: "Tháng 2 thường có bao nhiêu ngày?", textEn: "How many days does February usually have?", answer: "28", answerEn: "28", options: ["30", "31", "28", "29"], optionsEn: ["30", "31", "28", "29"], expl: "Tháng 2 thường có 28 ngày (năm nhuận có 29 ngày).", explEn: "February usually has 28 days (29 in a leap year)." }
    ],
    2: [
      { text: "1 dm bằng bao nhiêu cm?", textEn: "How many cm is 1 dm?", answer: "10", answerEn: "10", options: ["10", "100", "1", "20"], optionsEn: ["10", "100", "1", "20"], expl: "1 dm = 10 cm.", explEn: "1 dm = 10 cm." },
      { text: "1 ngày có bao nhiêu giờ?", textEn: "How many hours are in a day?", answer: "24", answerEn: "24", options: ["12", "24", "10", "60"], optionsEn: ["12", "24", "10", "60"], expl: "Một ngày có 24 giờ.", explEn: "A day has 24 hours." },
      { text: "Đơn vị nào dùng để đo cân nặng?", textEn: "Which unit is used to measure weight?", answer: "kg", answerEn: "kg", options: ["kg", "lít", "km", "giờ"], optionsEn: ["kg", "liter", "km", "hour"], expl: "Ki-lô-gam (kg) dùng để đo khối lượng (cân nặng).", explEn: "Kilogram (kg) is used to measure weight." },
      { text: "1 mét bằng bao nhiêu dm?", textEn: "How many dm is 1 meter?", answer: "10", answerEn: "10", options: ["10", "100", "1", "1000"], optionsEn: ["10", "100", "1", "1000"], expl: "1 m = 10 dm.", explEn: "1 m = 10 dm." },
      { text: "1 mét bằng bao nhiêu cm?", textEn: "How many cm is 1 meter?", answer: "100", answerEn: "100", options: ["10", "100", "1000", "1"], optionsEn: ["10", "100", "1000", "1"], expl: "1 m = 100 cm.", explEn: "1 m = 100 cm." },
      { text: "1 lít nước cộng 2 lít nước bằng mấy lít?", textEn: "1 liter of water plus 2 liters of water equals how many liters?", answer: "3 lít", answerEn: "3 liters", options: ["2 lít", "3 lít", "4 lít", "1 lít"], optionsEn: ["2 liters", "3 liters", "4 liters", "1 liter"], expl: "1 + 2 = 3 (lít).", explEn: "1 + 2 = 3 (liters)." },
      { text: "Quả dưa hấu nặng khoảng bao nhiêu?", textEn: "How much does a watermelon weigh approximately?", answer: "3 kg", answerEn: "3 kg", options: ["3 kg", "30 kg", "300 kg", "3 g"], optionsEn: ["3 kg", "30 kg", "300 kg", "3 g"], expl: "Quả dưa hấu thường nặng khoảng 2-5 kg.", explEn: "A watermelon usually weighs about 2-5 kg." },
      { text: "Bút chì dài khoảng bao nhiêu?", textEn: "How long is a pencil approximately?", answer: "15 cm", answerEn: "15 cm", options: ["15 cm", "15 m", "15 mm", "15 dm"], optionsEn: ["15 cm", "15 m", "15 mm", "15 dm"], expl: "Bút chì thường dài khoảng 15 cm.", explEn: "A pencil is usually about 15 cm long." },
      { text: "1 giờ có bao nhiêu phút?", textEn: "How many minutes are in 1 hour?", answer: "60", answerEn: "60", options: ["30", "60", "24", "100"], optionsEn: ["30", "60", "24", "100"], expl: "1 giờ = 60 phút.", explEn: "1 hour = 60 minutes." },
      { text: "Tháng 2 thường có bao nhiêu ngày?", textEn: "How many days does February usually have?", answer: "28", answerEn: "28", options: ["28", "30", "31", "29"], optionsEn: ["28", "30", "31", "29"], expl: "Tháng 2 thường có 28 ngày (năm nhuận có 29 ngày).", explEn: "February usually has 28 days (leap year has 29 days)." },
      { text: "Mẹ mua 5 kg gạo, sau đó mua thêm 2 kg nữa. Hỏi mẹ đã mua tất cả bao nhiêu kg gạo?", textEn: "Mom bought 5 kg of rice, then bought 2 kg more. How many kg of rice did she buy in total?", answer: "7 kg", answerEn: "7 kg", options: ["3 kg", "7 kg", "10 kg", "5 kg"], optionsEn: ["3 kg", "7 kg", "10 kg", "5 kg"], expl: "5 + 2 = 7 (kg).", explEn: "5 + 2 = 7 (kg)." },
      { text: "Bình nước có 5 lít nước. Rót ra 2 lít. Trong bình còn lại bao nhiêu lít?", textEn: "A water bottle has 5 liters of water. Pour out 2 liters. How many liters are left in the bottle?", answer: "3 lít", answerEn: "3 liters", options: ["7 lít", "3 lít", "2 lít", "5 lít"], optionsEn: ["7 liters", "3 liters", "2 liters", "5 liters"], expl: "5 - 2 = 3 (lít).", explEn: "5 - 2 = 3 (liters)." },
      { text: "Một gang tay của em dài khoảng 15 cm. Hai gang tay dài khoảng bao nhiêu?", textEn: "One of your hand spans is about 15 cm long. How long are two hand spans approximately?", answer: "30 cm", answerEn: "30 cm", options: ["15 cm", "20 cm", "30 cm", "40 cm"], optionsEn: ["15 cm", "20 cm", "30 cm", "40 cm"], expl: "15 + 15 = 30 (cm).", explEn: "15 + 15 = 30 (cm)." },
      { text: "Con chó cân nặng 12 kg, con mèo cân nặng 3 kg. Con chó nặng hơn con mèo bao nhiêu kg?", textEn: "A dog weighs 12 kg, a cat weighs 3 kg. How many kg heavier is the dog than the cat?", answer: "9 kg", answerEn: "9 kg", options: ["15 kg", "9 kg", "10 kg", "4 kg"], optionsEn: ["15 kg", "9 kg", "10 kg", "4 kg"], expl: "12 - 3 = 9 (kg).", explEn: "12 - 3 = 9 (kg)." },
      { text: "Từ 7 giờ sáng đến 9 giờ sáng là mấy giờ?", textEn: "From 7 AM to 9 AM is how many hours?", answer: "2 giờ", answerEn: "2 hours", options: ["1 giờ", "2 giờ", "3 giờ", "4 giờ"], optionsEn: ["1 hour", "2 hours", "3 hours", "4 hours"], expl: "9 - 7 = 2 (giờ).", explEn: "9 - 7 = 2 (hours)." }
    ],
    3: [
      { text: "1 kg bằng bao nhiêu gam?", textEn: "How many grams is 1 kg?", answer: "1000", answerEn: "1000", options: ["100", "1000", "10", "500"], optionsEn: ["100", "1000", "10", "500"], expl: "1 kg = 1000 g.", explEn: "1 kg = 1000 g." },
      { text: "Năm nhuận có bao nhiêu ngày?", textEn: "How many days are in a leap year?", answer: "366", answerEn: "366", options: ["365", "366", "360", "350"], optionsEn: ["365", "366", "360", "350"], expl: "Năm nhuận có 366 ngày (tháng 2 có 29 ngày).", explEn: "A leap year has 366 days (February has 29 days)." },
      { text: "Nhiệt độ cơ thể người bình thường khoảng bao nhiêu?", textEn: "What is the normal human body temperature approximately?", answer: "37 độ C", answerEn: "37 degrees C", options: ["37 độ C", "100 độ C", "0 độ C", "20 độ C"], optionsEn: ["37 degrees C", "100 degrees C", "0 degrees C", "20 degrees C"], expl: "Nhiệt độ cơ thể khoảng 37 độ C.", explEn: "Body temperature is about 37 degrees C." },
      { text: "1 km bằng bao nhiêu mét?", textEn: "How many meters is 1 km?", answer: "1000", answerEn: "1000", options: ["100", "1000", "10", "10000"], optionsEn: ["100", "1000", "10", "10000"], expl: "1 km = 1000 m.", explEn: "1 km = 1000 m." },
      { text: "1 mm là đơn vị đo gì?", textEn: "What does 1 mm measure?", answer: "Độ dài", answerEn: "Length", options: ["Độ dài", "Khối lượng", "Thời gian", "Nhiệt độ"], optionsEn: ["Length", "Mass", "Time", "Temperature"], expl: "Mi-li-mét (mm) là đơn vị đo độ dài.", explEn: "Millimeter (mm) is a unit of length." },
      { text: "1000 ml bằng bao nhiêu lít?", textEn: "How many liters is 1000 ml?", answer: "1", answerEn: "1", options: ["1", "10", "100", "1000"], optionsEn: ["1", "10", "100", "1000"], expl: "1 lít = 1000 ml.", explEn: "1 liter = 1000 ml." },
      { text: "Nước sôi ở bao nhiêu độ C?", textEn: "At what temperature does water boil in degrees C?", answer: "100 độ C", answerEn: "100 degrees C", options: ["100 độ C", "0 độ C", "37 độ C", "50 độ C"], optionsEn: ["100 degrees C", "0 degrees C", "37 degrees C", "50 degrees C"], expl: "Nước sôi ở 100 độ C.", explEn: "Water boils at 100 degrees C." },
      { text: "Nước đá đang tan ở bao nhiêu độ C?", textEn: "At what temperature does ice melt in degrees C?", answer: "0 độ C", answerEn: "0 degrees C", options: ["0 độ C", "100 độ C", "37 độ C", "10 độ C"], optionsEn: ["0 degrees C", "100 degrees C", "37 degrees C", "10 degrees C"], expl: "Nước đá tan ở 0 độ C.", explEn: "Ice melts at 0 degrees C." },
      { text: "Tờ tiền có mệnh giá lớn nhất hiện nay là bao nhiêu?", textEn: "What is the largest denomination banknote currently?", answer: "500.000 đồng", answerEn: "500,000 VND", options: ["500.000 đồng", "200.000 đồng", "100.000 đồng", "1.000.000 đồng"], optionsEn: ["500,000 VND", "200,000 VND", "100,000 VND", "1,000,000 VND"], expl: "Tờ tiền lớn nhất của Việt Nam hiện nay là 500.000 đồng.", explEn: "The largest banknote in Vietnam currently is 500,000 VND." },
      { text: "1 năm có bao nhiêu tháng?", textEn: "How many months are in 1 year?", answer: "12", answerEn: "12", options: ["10", "12", "4", "365"], optionsEn: ["10", "12", "4", "365"], expl: "Một năm có 12 tháng.", explEn: "A year has 12 months." },
      { text: "Mẹ mua 1 kg thịt lợn và 500 g thịt bò. Hỏi mẹ mua tất cả bao nhiêu gam thịt?", textEn: "Mom bought 1 kg of pork and 500 g of beef. How many grams of meat did she buy in total?", answer: "1500 g", answerEn: "1500 g", options: ["1500 g", "600 g", "1050 g", "501 g"], optionsEn: ["1500 g", "600 g", "1050 g", "501 g"], expl: "1 kg = 1000 g. 1000 + 500 = 1500 (g).", explEn: "1 kg = 1000 g. 1000 + 500 = 1500 (g)." },
      { text: "Quãng đường từ nhà đến trường dài 2 km. Em đã đi được 1000 m. Hỏi em còn phải đi bao nhiêu mét nữa?", textEn: "The distance from home to school is 2 km. You have walked 1000 m. How many more meters do you have to walk?", answer: "1000 m", answerEn: "1000 m", options: ["1000 m", "2000 m", "3000 m", "1 km"], optionsEn: ["1000 m", "2000 m", "3000 m", "1 km"], expl: "2 km = 2000 m. 2000 - 1000 = 1000 (m).", explEn: "2 km = 2000 m. 2000 - 1000 = 1000 (m)." },
      { text: "Một chai nước ngọt có 1 lít rưỡi (1500 ml). Rót ra 3 cốc, mỗi cốc 200 ml. Trong chai còn lại bao nhiêu ml?", textEn: "A soda bottle has 1.5 liters (1500 ml). Pour into 3 cups, 200 ml each. How many ml are left in the bottle?", answer: "900 ml", answerEn: "900 ml", options: ["900 ml", "1300 ml", "1100 ml", "600 ml"], optionsEn: ["900 ml", "1300 ml", "1100 ml", "600 ml"], expl: "Rót ra: 3 x 200 = 600 ml. Còn lại: 1500 - 600 = 900 ml.", explEn: "Poured out: 3 x 200 = 600 ml. Left: 1500 - 600 = 900 ml." },
      { text: "Bây giờ là 8 giờ sáng. 30 phút nữa là mấy giờ?", textEn: "It is 8 AM now. What time is it in 30 minutes?", answer: "8 giờ 30 phút", answerEn: "8:30 AM", options: ["8 giờ 30 phút", "9 giờ", "7 giờ 30 phút", "8 giờ 15 phút"], optionsEn: ["8:30 AM", "9:00 AM", "7:30 AM", "8:15 AM"], expl: "8 giờ + 30 phút = 8 giờ 30 phút.", explEn: "8 hours + 30 minutes = 8 hours 30 minutes." },
      { text: "Mỗi ngày em uống 2 lít nước. Hỏi trong 1 tuần em uống bao nhiêu lít nước?", textEn: "You drink 2 liters of water every day. How many liters of water do you drink in 1 week?", answer: "14 lít", answerEn: "14 liters", options: ["10 lít", "14 lít", "7 lít", "12 lít"], optionsEn: ["10 liters", "14 liters", "7 liters", "12 liters"], expl: "1 tuần = 7 ngày. 2 x 7 = 14 (lít).", explEn: "1 week = 7 days. 2 x 7 = 14 (liters)." }
    ],
    4: [
      { text: "1 thế kỷ bằng bao nhiêu năm?", textEn: "How many years are in 1 century?", answer: "100", answerEn: "100", options: ["10", "100", "1000", "50"], optionsEn: ["10", "100", "1000", "50"], expl: "1 thế kỷ = 100 năm.", explEn: "1 century = 100 years." },
      { text: "3 tấn bằng bao nhiêu kg?", textEn: "How many kg is 3 tons?", answer: "3000", answerEn: "3000", options: ["300", "3000", "30", "30000"], optionsEn: ["300", "3000", "30", "30000"], expl: "1 tấn = 1000 kg nên 3 tấn = 3000 kg.", explEn: "1 ton = 1000 kg so 3 tons = 3000 kg." },
      { text: "1 phút 30 giây bằng bao nhiêu giây?", textEn: "How many seconds is 1 minute 30 seconds?", answer: "90", answerEn: "90", options: ["60", "90", "130", "100"], optionsEn: ["60", "90", "130", "100"], expl: "1 phút = 60 giây. 60 + 30 = 90 giây.", explEn: "1 minute = 60 seconds. 60 + 30 = 90 seconds." },
      { text: "1 tạ bằng bao nhiêu kg?", textEn: "How many kg is 1 quintal (tạ)?", answer: "100", answerEn: "100", options: ["10", "100", "1000", "1"], optionsEn: ["10", "100", "1000", "1"], expl: "1 tạ = 100 kg.", explEn: "1 quintal (tạ) = 100 kg." },
      { text: "1 yến bằng bao nhiêu kg?", textEn: "How many kg is 1 yến?", answer: "10", answerEn: "10", options: ["1", "10", "100", "1000"], optionsEn: ["1", "10", "100", "1000"], expl: "1 yến = 10 kg.", explEn: "1 yến = 10 kg." },
      { text: "Năm 2000 thuộc thế kỷ thứ mấy?", textEn: "Which century does the year 2000 belong to?", answer: "20", answerEn: "20", options: ["19", "20", "21", "2000"], optionsEn: ["19", "20", "21", "2000"], expl: "Năm 2000 là năm cuối cùng của thế kỷ 20.", explEn: "The year 2000 is the last year of the 20th century." },
      { text: "1 m² bằng bao nhiêu dm²?", textEn: "How many dm² is 1 m²?", answer: "100", answerEn: "100", options: ["10", "100", "1000", "10000"], optionsEn: ["10", "100", "1000", "10000"], expl: "1 m² = 100 dm².", explEn: "1 m² = 100 dm²." },
      { text: "1 km² bằng bao nhiêu m²?", textEn: "How many m² is 1 km²?", answer: "1.000.000", answerEn: "1,000,000", options: ["1.000", "10.000", "100.000", "1.000.000"], optionsEn: ["1,000", "10,000", "100,000", "1,000,000"], expl: "1 km² = 1.000.000 m².", explEn: "1 km² = 1,000,000 m²." },
      { text: "2 ngày rưỡi bằng bao nhiêu giờ?", textEn: "How many hours is 2 and a half days?", answer: "60", answerEn: "60", options: ["48", "60", "72", "36"], optionsEn: ["48", "60", "72", "36"], expl: "2,5 x 24 = 60 giờ.", explEn: "2.5 x 24 = 60 hours." },
      { text: "5 phút bằng bao nhiêu giây?", textEn: "How many seconds is 5 minutes?", answer: "300", answerEn: "300", options: ["50", "300", "500", "60"], optionsEn: ["50", "300", "500", "60"], expl: "5 x 60 = 300 giây.", explEn: "5 x 60 = 300 seconds." },
      { text: "Một con voi cân nặng 2 tấn, một con trâu cân nặng 5 tạ. Con voi nặng hơn con trâu bao nhiêu kg?", textEn: "An elephant weighs 2 tons, a buffalo weighs 5 quintals. How many kg heavier is the elephant than the buffalo?", answer: "1500 kg", answerEn: "1500 kg", options: ["1500 kg", "2500 kg", "150 kg", "3000 kg"], optionsEn: ["1500 kg", "2500 kg", "150 kg", "3000 kg"], expl: "2 tấn = 2000 kg. 5 tạ = 500 kg. 2000 - 500 = 1500 (kg).", explEn: "2 tons = 2000 kg. 5 quintals = 500 kg. 2000 - 500 = 1500 (kg)." },
      { text: "Một thửa ruộng hình chữ nhật có diện tích 1000 m². Hỏi diện tích đó bằng bao nhiêu héc-ta?", textEn: "A rectangular field has an area of 1000 m². What is its area in hectares?", answer: "0,1 ha", answerEn: "0.1 ha", options: ["1 ha", "0,1 ha", "10 ha", "0,01 ha"], optionsEn: ["1 ha", "0.1 ha", "10 ha", "0.01 ha"], expl: "1 ha = 10000 m². 1000 m² = 0,1 ha.", explEn: "1 ha = 10000 m². 1000 m² = 0.1 ha." }
    ],
    5: [
      { text: "Vận tốc 40 km/giờ có nghĩa là gì?", textEn: "What does a speed of 40 km/h mean?", answer: "1 giờ đi được 40km", answerEn: "Travel 40km in 1 hour", options: ["1 giờ đi được 40km", "1 phút đi được 40km", "40 giờ đi được 1km", "Đi hết 40km"], optionsEn: ["Travel 40km in 1 hour", "Travel 40km in 1 minute", "Travel 1km in 40 hours", "Travel 40km total"], expl: "Vận tốc 40 km/giờ nghĩa là trong 1 giờ đi được quãng đường 40km.", explEn: "A speed of 40 km/h means traveling a distance of 40km in 1 hour." },
      { text: "2,5 giờ bằng bao nhiêu phút?", textEn: "How many minutes is 2.5 hours?", answer: "150", answerEn: "150", options: ["120", "150", "250", "100"], optionsEn: ["120", "150", "250", "100"], expl: "2,5 x 60 = 150 phút.", explEn: "2.5 x 60 = 150 minutes." },
      { text: "1 ha (hecta) bằng bao nhiêu mét vuông?", textEn: "How many square meters is 1 ha (hectare)?", answer: "10000", answerEn: "10000", options: ["100", "1000", "10000", "100000"], optionsEn: ["100", "1000", "10000", "100000"], expl: "1 ha = 10 000 m².", explEn: "1 ha = 10,000 m²." },
      { text: "1 m³ bằng bao nhiêu dm³?", textEn: "How many dm³ is 1 m³?", answer: "1000", answerEn: "1000", options: ["10", "100", "1000", "10000"], optionsEn: ["10", "100", "1000", "10000"], expl: "1 m³ = 1000 dm³.", explEn: "1 m³ = 1000 dm³." },
      { text: "1 lít bằng bao nhiêu dm³?", textEn: "How many dm³ is 1 liter?", answer: "1", answerEn: "1", options: ["1", "10", "100", "1000"], optionsEn: ["1", "10", "100", "1000"], expl: "1 lít = 1 dm³.", explEn: "1 liter = 1 dm³." },
      { text: "25% của 100kg là bao nhiêu?", textEn: "What is 25% of 100kg?", answer: "25kg", answerEn: "25kg", options: ["25kg", "50kg", "75kg", "100kg"], optionsEn: ["25kg", "50kg", "75kg", "100kg"], expl: "100 x 25% = 25 (kg).", explEn: "100 x 25% = 25 (kg)." },
      { text: "1,5 tấn bằng bao nhiêu kg?", textEn: "How many kg is 1.5 tons?", answer: "1500", answerEn: "1500", options: ["150", "1500", "15000", "15"], optionsEn: ["150", "1500", "15000", "15"], expl: "1,5 x 1000 = 1500 (kg).", explEn: "1.5 x 1000 = 1500 (kg)." },
      { text: "3/4 giờ bằng bao nhiêu phút?", textEn: "How many minutes is 3/4 of an hour?", answer: "45", answerEn: "45", options: ["30", "45", "60", "15"], optionsEn: ["30", "45", "60", "15"], expl: "60 x 3/4 = 45 (phút).", explEn: "60 x 3/4 = 45 (minutes)." },
      { text: "1 năm rưỡi bằng bao nhiêu tháng?", textEn: "How many months is 1 and a half years?", answer: "18", answerEn: "18", options: ["12", "15", "18", "24"], optionsEn: ["12", "15", "18", "24"], expl: "1,5 x 12 = 18 (tháng).", explEn: "1.5 x 12 = 18 (months)." },
      { text: "Vận tốc âm thanh trong không khí khoảng bao nhiêu?", textEn: "What is the approximate speed of sound in air?", answer: "340 m/s", answerEn: "340 m/s", options: ["340 m/s", "300.000 km/s", "100 m/s", "1000 m/s"], optionsEn: ["340 m/s", "300,000 km/s", "100 m/s", "1000 m/s"], expl: "Vận tốc âm thanh trong không khí khoảng 340 m/s.", explEn: "The speed of sound in air is about 340 m/s." },
      { text: "Một bể nước có thể tích 2 m³. Hỏi bể đó chứa được tối đa bao nhiêu lít nước?", textEn: "A water tank has a volume of 2 m³. What is the maximum number of liters of water it can hold?", answer: "2000 lít", answerEn: "2000 liters", options: ["2000 lít", "200 lít", "20 lít", "20000 lít"], optionsEn: ["2000 liters", "200 liters", "20 liters", "20000 liters"], expl: "1 m³ = 1000 dm³ = 1000 lít. 2 m³ = 2000 lít.", explEn: "1 m³ = 1000 dm³ = 1000 liters. 2 m³ = 2000 liters." },
      { text: "Quãng đường AB dài 120km. Một ô tô đi với vận tốc 40 km/giờ. Hỏi ô tô đi hết quãng đường trong bao lâu?", textEn: "The distance AB is 120km. A car travels at a speed of 40 km/h. How long does it take the car to travel the distance?", answer: "3 giờ", answerEn: "3 hours", options: ["3 giờ", "4 giờ", "2 giờ", "5 giờ"], optionsEn: ["3 hours", "4 hours", "2 hours", "5 hours"], expl: "Thời gian = Quãng đường : Vận tốc = 120 : 40 = 3 (giờ).", explEn: "Time = Distance / Speed = 120 / 40 = 3 (hours)." }
    ]
  };

  const gradeQs = questionsByGrade[gradeId] || questionsByGrade[1];
  const q = gradeQs[index % gradeQs.length];

  const qText = language === 'en' ? q.textEn : language === 'vi-en' ? `${q.text} / ${q.textEn}` : q.text;
  const qAnswer = language === 'en' ? q.answerEn : language === 'vi-en' ? `${q.answer} / ${q.answerEn}` : q.answer;
  const qExpl = language === 'en' ? q.explEn : language === 'vi-en' ? `${q.expl} / ${q.explEn}` : q.expl;
  const qOptions = language === 'en' ? q.optionsEn : language === 'vi-en' ? q.options.map((o: string, i: number) => `${o} / ${q.optionsEn[i]}`) : q.options;

  if (type === 'matching') {
    // Pick 4 random questions from the grade to form pairs with unique answers
    const shuffledQs = [...gradeQs].sort(() => Math.random() - 0.5);
    const selectedQs = [];
    const usedAnswers = new Set<string>();
    
    for (const sq of shuffledQs) {
      const sqAnswer = language === 'en' ? sq.answerEn : language === 'vi-en' ? `${sq.answer} / ${sq.answerEn}` : sq.answer;
      if (!usedAnswers.has(sqAnswer)) {
        usedAnswers.add(sqAnswer);
        selectedQs.push(sq);
        if (selectedQs.length === 4) break;
      }
    }
    
    // Fallback if not enough unique answers
    if (selectedQs.length < 4) {
      for (const sq of shuffledQs) {
        if (selectedQs.length === 4) break;
        if (!selectedQs.includes(sq)) {
          selectedQs.push(sq);
        }
      }
    }

    const pairs = selectedQs.map(sq => {
      const sqText = language === 'en' ? sq.textEn : language === 'vi-en' ? `${sq.text} / ${sq.textEn}` : sq.text;
      const sqAnswer = language === 'en' ? sq.answerEn : language === 'vi-en' ? `${sq.answer} / ${sq.answerEn}` : sq.answer;
      return {
        left: sqText,
        right: sqAnswer
      };
    });
    
    const mText = language === 'en' ? 'Match the question with the correct answer:' :
                  language === 'vi-en' ? 'Hãy ghép câu hỏi với đáp án đúng: / Match the question with the correct answer:' :
                  'Hãy ghép câu hỏi với đáp án đúng:';
    const mExpl = language === 'en' ? 'You matched all pairs correctly!' :
                  language === 'vi-en' ? 'Bạn đã ghép đúng tất cả các cặp! / You matched all pairs correctly!' :
                  'Bạn đã ghép đúng tất cả các cặp!';
                  
    return {
      id: `meas-${index}`,
      type: 'matching',
      text: mText,
      correctAnswer: 'matching',
      explanation: mExpl,
      pairs
    };
  }

  if (type === 'fill-in-blank' || type === 'short-answer') {
    return {
      id: `meas-${index}`,
      type: type,
      text: qText,
      correctAnswer: qAnswer,
      explanation: qExpl,
      placeholder: language === 'en' ? 'Enter number or text...' : language === 'vi-en' ? 'Nhập số hoặc chữ... / Enter number or text...' : 'Nhập số hoặc chữ...'
    };
  }
  
  // Measurement mostly fits multiple choice or fill in blank. True/false is okay too.
  if (type === 'true-false') {
     const isCorrect = Math.random() > 0.5;
     const displayedAnswer = isCorrect ? qAnswer : (qOptions.find((o: string) => o !== qAnswer) || "0");
     
     const tfText = language === 'en' ? `TRUE or FALSE?\n\nQuestion: ${q.textEn}\nAnswer: ${displayedAnswer}` :
                    language === 'vi-en' ? `ĐÚNG hay SAI? / TRUE or FALSE?\n\nHỏi/Question: ${q.text} / ${q.textEn}\nĐáp án/Answer: ${displayedAnswer}` :
                    `ĐÚNG hay SAI?\n\nHỏi: ${q.text}\nĐáp án: ${displayedAnswer}`;
                    
     return {
        id: `meas-${index}`,
        type: 'true-false',
        text: tfText,
        correctAnswer: isCorrect ? 'true' : 'false',
        explanation: qExpl
     };
  }

  return {
    id: `meas-${index}`,
    type: 'multiple-choice',
    text: qText,
    options: qOptions.sort(() => Math.random() - 0.5),
    correctAnswer: qAnswer,
    explanation: qExpl
  };
}

function generateMotionQuestion(gradeId: number, levelId: string, type: QuestionType, index: number, language: string): Question {
    // Grade 5 only
    const isHard = levelId === 'hard';
    const isMedium = levelId === 'medium';
    
    // Randomize V, T, S
    const v = Math.floor(Math.random() * 40) + 15; // 15 to 54
    const t = Math.floor(Math.random() * 5) + 2; // 2 to 6
    const s = v * t;
    
    // Randomly pick question type: 0 = find S, 1 = find V, 2 = find T
    const qType = Math.floor(Math.random() * 3);
    
    let qText, qTextEn, qAnswer, qAnswerEn, qExpl, qExplEn;
    let qOptions: string[] = [];
    let qOptionsEn: string[] = [];
    
    if (qType === 0) {
        // Find S
        qText = `Một ô tô đi với vận tốc ${v} km/giờ. Sau ${t} giờ ô tô đi được bao nhiêu km?`;
        qTextEn = `A car travels at a speed of ${v} km/h. How many km does it travel in ${t} hours?`;
        qAnswer = `${s}`;
        qAnswerEn = `${s}`;
        qExpl = `Quãng đường = Vận tốc x Thời gian = ${v} x ${t} = ${s} (km).`;
        qExplEn = `Distance = Speed x Time = ${v} x ${t} = ${s} (km).`;
        qOptions = [`${s}`, `${s + 10}`, `${s - 10}`, `${s + v}`];
    } else if (qType === 1) {
        // Find V
        qText = `Một xe máy đi được quãng đường ${s}km trong ${t} giờ. Vận tốc của xe máy là bao nhiêu km/giờ?`;
        qTextEn = `A motorbike travels a distance of ${s}km in ${t} hours. What is the speed of the motorbike in km/h?`;
        qAnswer = `${v}`;
        qAnswerEn = `${v}`;
        qExpl = `Vận tốc = Quãng đường : Thời gian = ${s} : ${t} = ${v} (km/giờ).`;
        qExplEn = `Speed = Distance / Time = ${s} / ${t} = ${v} (km/h).`;
        qOptions = [`${v}`, `${v + 5}`, `${v - 5}`, `${v + 10}`];
    } else {
        // Find T
        qText = `Một người đi xe đạp quãng đường ${s}km với vận tốc ${v} km/giờ. Thời gian đi là bao nhiêu giờ?`;
        qTextEn = `A person rides a bicycle a distance of ${s}km at a speed of ${v} km/h. How many hours does the journey take?`;
        qAnswer = `${t}`;
        qAnswerEn = `${t}`;
        qExpl = `Thời gian = Quãng đường : Vận tốc = ${s} : ${v} = ${t} (giờ).`;
        qExplEn = `Time = Distance / Speed = ${s} / ${v} = ${t} (hours).`;
        qOptions = [`${t}`, `${t + 1}`, `${t - 1}`, `${t + 2}`];
    }
    
    // Shuffle options
    qOptions.sort(() => Math.random() - 0.5);
    qOptionsEn = [...qOptions]; // Numbers are the same in both languages

    const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
    const finalQAnswer = language === 'en' ? qAnswerEn : language === 'vi-en' ? `${qAnswer} / ${qAnswerEn}` : qAnswer;
    const finalQExpl = language === 'en' ? qExplEn : language === 'vi-en' ? `${qExpl} / ${qExplEn}` : qExpl;
    const finalQOptions = language === 'en' ? qOptionsEn : language === 'vi-en' ? qOptions.map((o: string, i: number) => `${o} / ${qOptionsEn[i]}`) : qOptions;

    if (type === 'matching') {
        // For matching, we generate 4 dynamic pairs with unique answers
        const pairs: { left: string, right: string }[] = [];
        const usedAnswers = new Set<string>();
        
        while (pairs.length < 4) {
            const pv = Math.floor(Math.random() * 30) + 10;
            const pt = Math.floor(Math.random() * 4) + 2;
            const ps = pv * pt;
            const pType = Math.floor(Math.random() * 3);
            
            let pLeft, pRight;
            if (pType === 0) {
                pLeft = language === 'en' ? `Distance: v=${pv}km/h, t=${pt}h` : language === 'vi-en' ? `Quãng đường: v=${pv}km/h, t=${pt}h / Distance: v=${pv}km/h, t=${pt}h` : `Quãng đường: v=${pv}km/h, t=${pt}h`;
                pRight = `${ps}`;
            } else if (pType === 1) {
                pLeft = language === 'en' ? `Speed: s=${ps}km, t=${pt}h` : language === 'vi-en' ? `Vận tốc: s=${ps}km, t=${pt}h / Speed: s=${ps}km, t=${pt}h` : `Vận tốc: s=${ps}km, t=${pt}h`;
                pRight = `${pv}`;
            } else {
                pLeft = language === 'en' ? `Time: s=${ps}km, v=${pv}km/h` : language === 'vi-en' ? `Thời gian: s=${ps}km, v=${pv}km/h / Time: s=${ps}km, v=${pv}km/h` : `Thời gian: s=${ps}km, v=${pv}km/h`;
                pRight = `${pt}`;
            }
            
            if (!usedAnswers.has(pRight)) {
                usedAnswers.add(pRight);
                pairs.push({ left: pLeft, right: pRight });
            }
        }
        
        const mText = language === 'en' ? 'Match the question with the correct answer:' :
                      language === 'vi-en' ? 'Hãy ghép câu hỏi với đáp án đúng: / Match the question with the correct answer:' :
                      'Hãy ghép câu hỏi với đáp án đúng:';
        const mExpl = language === 'en' ? 'You matched all pairs correctly!' :
                      language === 'vi-en' ? 'Bạn đã ghép đúng tất cả các cặp! / You matched all pairs correctly!' :
                      'Bạn đã ghép đúng tất cả các cặp!';
                      
        return {
            id: `motion-${index}`,
            type: 'matching',
            text: mText,
            correctAnswer: 'matching',
            explanation: mExpl,
            pairs: pairs
        };
    }

    if (type === 'fill-in-blank' || type === 'short-answer') {
        return {
            id: `motion-${index}`,
            type: type,
            text: finalQText,
            correctAnswer: finalQAnswer,
            explanation: finalQExpl,
            placeholder: language === 'en' ? 'Enter number...' : language === 'vi-en' ? 'Nhập số... / Enter number...' : 'Nhập số...'
        };
    }

    if (type === 'true-false') {
        const isCorrectStatement = Math.random() > 0.5;
        const wrongAnswer = qOptions.find(o => o !== qAnswer) || `${parseInt(qAnswer) + 5}`;
        const statementAnswer = isCorrectStatement ? qAnswer : wrongAnswer;
        const statementAnswerEn = isCorrectStatement ? qAnswerEn : (qOptionsEn[qOptions.indexOf(wrongAnswer)] || wrongAnswer);
        
        const tfText = language === 'en' ? `TRUE or FALSE?\n\nQuestion: ${qTextEn}\nAnswer: ${statementAnswerEn}` :
                       language === 'vi-en' ? `ĐÚNG hay SAI? / TRUE or FALSE?\n\nHỏi/Question: ${qText} / ${qTextEn}\nĐáp án/Answer: ${statementAnswer}` :
                       `ĐÚNG hay SAI?\n\nHỏi: ${qText}\nĐáp án: ${statementAnswer}`;
                       
        return {
            id: `motion-${index}`,
            type: 'true-false',
            text: tfText,
            correctAnswer: isCorrectStatement ? 'true' : 'false',
            explanation: finalQExpl
        };
    }
    
    return {
        id: `motion-${index}`,
        type: 'multiple-choice',
        text: finalQText,
        options: finalQOptions,
        correctAnswer: finalQAnswer,
        explanation: finalQExpl
    };
}

function generatePieChartSvg(data: { label: string, value: number, color: string }[], showLegend: boolean = false, showPercentage: boolean = true): string {
    const width = showLegend ? 400 : 200;
    const height = 200;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
    const cx = 100;
    const cy = 100;
    const r = 90;
    let startAngle = -Math.PI / 2; // Start from top
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        
        let pathD;
        if (sliceAngle >= 2 * Math.PI - 0.001) {
            pathD = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
        } else {
            pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        }
        
        svg += `<path d="${pathD}" fill="${item.color}" stroke="#fff" stroke-width="1" />`;
        
        const midAngle = startAngle + sliceAngle / 2;
        const textR = r * 0.6;
        const tx = cx + textR * Math.cos(midAngle);
        const ty = cy + textR * Math.sin(midAngle);
        
        const percentage = Math.round((item.value / total) * 100) + '%';
        
        if (!showLegend) {
            svg += `<text x="${tx}" y="${ty - 8}" font-family="Arial" font-size="14" font-weight="bold" fill="#000" text-anchor="middle">${item.label}</text>`;
            if (showPercentage) {
                svg += `<text x="${tx}" y="${ty + 12}" font-family="Arial" font-size="16" font-weight="bold" fill="#000" text-anchor="middle">${percentage}</text>`;
            }
        } else {
            if (showPercentage) {
                svg += `<text x="${tx}" y="${ty + 5}" font-family="Arial" font-size="16" font-weight="bold" fill="#000" text-anchor="middle">${percentage}</text>`;
            }
            
            const legendY = 40 + index * 30;
            svg += `<rect x="220" y="${legendY - 12}" width="16" height="16" fill="${item.color}" />`;
            svg += `<text x="245" y="${legendY + 2}" font-family="Arial" font-size="16" fill="${item.color}">${item.label}</text>`;
        }
        
        startAngle = endAngle;
    });
    
    svg += `</svg>`;
    return svg;
}

function generateBarChartSvg(
    title: string,
    xAxisLabel: string,
    yAxisLabel: string,
    labels: string[],
    data: number[],
    yMax: number,
    yStep: number,
    barColor: string = '#3b82f6'
): string {
    const width = 500;
    const height = 350;
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: white; border-radius: 8px;">`;
    
    // Title
    svg += `<text x="${width / 2}" y="30" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#1f2937">${title}</text>`;
    
    // Y-axis label
    svg += `<text x="${margin.left - 10}" y="${margin.top - 15}" font-family="Arial" font-size="12" text-anchor="end" fill="#4b5563">${yAxisLabel}</text>`;
    
    // X-axis label
    svg += `<text x="${width - margin.right + 10}" y="${height - margin.bottom + 15}" font-family="Arial" font-size="12" text-anchor="start" fill="#4b5563">${xAxisLabel}</text>`;

    // Y-axis grid lines and labels
    for (let y = 0; y <= yMax; y += yStep) {
        const yPos = margin.top + chartHeight - (y / yMax) * chartHeight;
        svg += `<line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="#e5e7eb" stroke-width="1" />`;
        svg += `<text x="${margin.left - 10}" y="${yPos + 4}" font-family="Arial" font-size="12" text-anchor="end" fill="#4b5563">${y}</text>`;
    }

    // X-axis and Y-axis main lines
    svg += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" stroke="#9ca3af" stroke-width="2" />`;
    svg += `<line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${width - margin.right}" y2="${margin.top + chartHeight}" stroke="#9ca3af" stroke-width="2" />`;

    // Bars
    const barWidth = Math.min(40, (chartWidth / labels.length) * 0.6);
    const spacing = chartWidth / labels.length;

    data.forEach((value, i) => {
        const xPos = margin.left + i * spacing + spacing / 2;
        const barHeight = (value / yMax) * chartHeight;
        const yPos = margin.top + chartHeight - barHeight;

        // Bar
        svg += `<rect x="${xPos - barWidth / 2}" y="${yPos}" width="${barWidth}" height="${barHeight}" fill="${barColor}" />`;
        
        // Value label on top of bar
        svg += `<text x="${xPos}" y="${yPos - 8}" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="${barColor}">${value}</text>`;
        
        // X-axis label
        svg += `<text x="${xPos}" y="${margin.top + chartHeight + 20}" font-family="Arial" font-size="14" text-anchor="middle" fill="#4b5563">${labels[i]}</text>`;
    });

    svg += `</svg>`;
    return svg;
}

function generateTableSvg(headers: string[], rows: string[][], colWidths?: number[]): string {
    const defaultColWidth = 120;
    const widths = colWidths || headers.map(() => defaultColWidth);
    const width = widths.reduce((a, b) => a + b, 0);
    const rowHeight = 40;
    const height = (rows.length + 1) * rowHeight;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
    svg += `<style>
        .header { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #1f2937; }
        .cell { font-family: Arial, sans-serif; font-size: 16px; fill: #4b5563; }
        .line { stroke: #e5e7eb; stroke-width: 1; }
    </style>`;
    
    // Draw background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" stroke="#d1d5db" stroke-width="2" rx="8" />`;
    
    // Draw header background
    svg += `<path d="M 0 8 Q 0 0 8 0 L ${width - 8} 0 Q ${width} 0 ${width} 8 L ${width} ${rowHeight} L 0 ${rowHeight} Z" fill="#f3f4f6" />`;
    
    // Draw horizontal lines
    for (let i = 1; i <= rows.length; i++) {
        const y = i * rowHeight;
        svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" class="line" />`;
    }
    
    // Draw vertical lines
    let currentX = 0;
    for (let i = 0; i < headers.length - 1; i++) {
        currentX += widths[i];
        svg += `<line x1="${currentX}" y1="0" x2="${currentX}" y2="${height}" class="line" />`;
    }
    
    // Draw headers
    currentX = 0;
    headers.forEach((header, i) => {
        const x = currentX + widths[i] / 2;
        const y = rowHeight / 2 + 6;
        svg += `<text x="${x}" y="${y}" class="header" text-anchor="middle">${header}</text>`;
        currentX += widths[i];
    });
    
    // Draw rows
    rows.forEach((row, rowIndex) => {
        currentX = 0;
        row.forEach((cell, colIndex) => {
            const x = currentX + widths[colIndex] / 2;
            const y = (rowIndex + 1) * rowHeight + rowHeight / 2 + 6;
            svg += `<text x="${x}" y="${y}" class="cell" text-anchor="middle">${cell}</text>`;
            currentX += widths[colIndex];
        });
    });
    
    svg += `</svg>`;
    return svg;
}

function generateStatisticsProbabilityQuestion(gradeId: number, levelId: string, type: QuestionType, index: number, language: string): Question {
    let qText = '', qTextEn = '', answer = '', expl = '', explEn = '';
    let imageUrl: string | undefined = undefined;
    let options = new Set<string>();

    if (gradeId === 2) {
        const qType = Math.floor(Math.random() * 2);
        if (qType === 0) {
            // Probability: certain, possible, impossible
            const randomNum = Math.floor(Math.random() * 10) + 1;
            const randomColor1 = ["đỏ", "xanh", "vàng"][Math.floor(Math.random() * 3)];
            const randomColor2 = ["đen", "trắng", "tím"][Math.floor(Math.random() * 3)];

            const scenarios = [
                { vi: "Mặt trời mọc ở hướng Đông.", en: "The sun rises in the East.", ansVi: "Chắc chắn", ansEn: "Certain" },
                { vi: "Ngày mai trời sẽ mưa.", en: "It will rain tomorrow.", ansVi: "Có thể", ansEn: "Possible" },
                { vi: "Một con chó biết bay.", en: "A dog can fly.", ansVi: "Không thể", ansEn: "Impossible" },
                { vi: `Gieo xúc xắc được mặt ${randomNum + 6} chấm.`, en: `Rolling a ${randomNum + 6} on a standard die.`, ansVi: "Không thể", ansEn: "Impossible" },
                { vi: `Lấy được bóng ${randomColor1} từ hộp chỉ có bóng ${randomColor2}.`, en: `Drawing a ${randomColor1} ball from a box with only ${randomColor2} balls.`, ansVi: "Không thể", ansEn: "Impossible" },
                { vi: `Lấy được bóng ${randomColor1} từ hộp có bóng ${randomColor1} và ${randomColor2}.`, en: `Drawing a ${randomColor1} ball from a box with ${randomColor1} and ${randomColor2} balls.`, ansVi: "Có thể", ansEn: "Possible" }
            ];
            const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
            qText = `Khả năng xảy ra của sự kiện: "${sc.vi}" là gì?`;
            qTextEn = `What is the probability of the event: "${sc.en}"?`;
            answer = language === 'en' ? sc.ansEn : language === 'vi-en' ? `${sc.ansVi} / ${sc.ansEn}` : sc.ansVi;
            expl = `Sự kiện này là ${sc.ansVi}.`;
            explEn = `This event is ${sc.ansEn}.`;
            options.add(language === 'en' ? "Certain" : language === 'vi-en' ? "Chắc chắn / Certain" : "Chắc chắn");
            options.add(language === 'en' ? "Possible" : language === 'vi-en' ? "Có thể / Possible" : "Có thể");
            options.add(language === 'en' ? "Impossible" : language === 'vi-en' ? "Không thể / Impossible" : "Không thể");
        } else {
            // Counting
            const allItems = [
                { vi: "Táo", en: "Apple" }, { vi: "Chuối", en: "Banana" }, { vi: "Nho", en: "Grape" }, { vi: "Dâu", en: "Strawberry" },
                { vi: "Cam", en: "Orange" }, { vi: "Xoài", en: "Mango" }, { vi: "Lê", en: "Pear" }, { vi: "Đào", en: "Peach" }
            ];
            const selectedItems = allItems.sort(() => 0.5 - Math.random()).slice(0, 4);
            const items = selectedItems.map(item => item.vi);
            const itemsEn = selectedItems.map(item => item.en);
            const counts = items.map(() => Math.floor(Math.random() * 15) + 5); // 5 to 19
            const targetIdx = Math.floor(Math.random() * items.length);
            
            const headers = language === 'en' ? ["Fruit", "Quantity"] : language === 'vi-en' ? ["Loại quả / Fruit", "Số lượng / Quantity"] : ["Loại quả", "Số lượng"];
            const rows = items.map((item, i) => [language === 'en' ? itemsEn[i] : item, counts[i].toString()]);
            const colWidths = [150, 150];
            const svgString = generateTableSvg(headers, rows, colWidths);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            qText = `Dựa vào bảng số liệu, có bao nhiêu quả ${items[targetIdx]}?`;
            qTextEn = `Based on the data table, how many ${itemsEn[targetIdx]}s are there?`;
            answer = `${counts[targetIdx]}`;
            expl = `Nhìn vào bảng, số lượng ${items[targetIdx]} là ${counts[targetIdx]}.`;
            explEn = `Looking at the table, the quantity of ${itemsEn[targetIdx]} is ${counts[targetIdx]}.`;
            options.add(answer);
            while (options.size < 4) {
                const wrong = counts[targetIdx] + Math.floor(Math.random() * 9) - 4;
                if (wrong > 0 && wrong !== counts[targetIdx]) options.add(`${wrong}`);
            }
        }
    } else if (gradeId === 3) {
        const qType = Math.floor(Math.random() * 2);
        if (qType === 0) {
            // Data table
            const allNames = ["An", "Bình", "Cường", "Dũng", "Hoa", "Mai", "Lan", "Hùng", "Tuấn", "Minh"];
            // Shuffle and pick 4 names
            const names = allNames.sort(() => 0.5 - Math.random()).slice(0, 4);
            const scores = names.map(() => Math.floor(Math.random() * 6) + 5); // 5 to 10
            const targetIdx = Math.floor(Math.random() * names.length);
            
            const headers = language === 'en' ? ["Student", "Score"] : language === 'vi-en' ? ["Học sinh / Student", "Điểm / Score"] : ["Học sinh", "Điểm"];
            const rows = names.map((name, i) => [name, scores[i].toString()]);
            const colWidths = [150, 150];
            const svgString = generateTableSvg(headers, rows, colWidths);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            qText = `Dựa vào bảng số liệu, bạn ${names[targetIdx]} được bao nhiêu điểm?`;
            qTextEn = `Based on the data table, how many points did ${names[targetIdx]} get?`;
            answer = `${scores[targetIdx]}`;
            expl = `Nhìn vào bảng, điểm của ${names[targetIdx]} là ${scores[targetIdx]}.`;
            explEn = `Looking at the table, ${names[targetIdx]}'s score is ${scores[targetIdx]}.`;
            options.add(answer);
            while (options.size < 4) {
                const wrong = scores[targetIdx] + Math.floor(Math.random() * 7) - 3;
                if (wrong >= 0 && wrong <= 10 && wrong !== scores[targetIdx]) options.add(`${wrong}`);
            }
        } else {
            // Probability 1 event (dice, cards, spinner)
            const numCards = Math.floor(Math.random() * 5) + 3; // 3 to 7
            const targetCard = Math.floor(Math.random() * numCards) + 1;
            const impossibleCard = numCards + Math.floor(Math.random() * 3) + 1;
            
            const scenarios = [
                {
                    vi: "Gieo một con xúc xắc. Khả năng nhận được mặt có số chấm lớn hơn 6 là:",
                    en: "Roll a die. The possibility of getting a face with more than 6 dots is:",
                    ansVi: "Không thể", ansEn: "Impossible",
                    explVi: "Xúc xắc chỉ có các mặt từ 1 đến 6 chấm.", explEn: "A die only has faces from 1 to 6 dots."
                },
                {
                    vi: `Rút một thẻ từ bộ thẻ đánh số từ 1 đến ${numCards}. Khả năng rút được thẻ số ${targetCard} là:`,
                    en: `Draw a card from a set numbered 1 to ${numCards}. The possibility of drawing card number ${targetCard} is:`,
                    ansVi: "Có thể", ansEn: "Possible",
                    explVi: `Trong bộ thẻ có thẻ số ${targetCard} nên có thể rút được.`, explEn: `The set contains card number ${targetCard}, so it is possible.`
                },
                {
                    vi: `Rút một thẻ từ bộ thẻ đánh số từ 1 đến ${numCards}. Khả năng rút được thẻ số ${impossibleCard} là:`,
                    en: `Draw a card from a set numbered 1 to ${numCards}. The possibility of drawing card number ${impossibleCard} is:`,
                    ansVi: "Không thể", ansEn: "Impossible",
                    explVi: `Trong bộ thẻ không có thẻ số ${impossibleCard}.`, explEn: `The set does not contain card number ${impossibleCard}.`
                },
                {
                    vi: "Quay một vòng quay chỉ có màu đỏ. Khả năng kim chỉ vào màu đỏ là:",
                    en: "Spin a spinner with only red color. The possibility of the pointer landing on red is:",
                    ansVi: "Chắc chắn", ansEn: "Certain",
                    explVi: "Vòng quay chỉ có màu đỏ nên chắc chắn kim sẽ chỉ vào màu đỏ.", explEn: "The spinner is only red, so it will certainly land on red."
                }
            ];
            const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
            qText = sc.vi;
            qTextEn = sc.en;
            answer = language === 'en' ? sc.ansEn : language === 'vi-en' ? `${sc.ansVi} / ${sc.ansEn}` : sc.ansVi;
            expl = sc.explVi;
            explEn = sc.explEn;
            options.add(language === 'en' ? "Certain" : language === 'vi-en' ? "Chắc chắn / Certain" : "Chắc chắn");
            options.add(language === 'en' ? "Possible" : language === 'vi-en' ? "Có thể / Possible" : "Có thể");
            options.add(language === 'en' ? "Impossible" : language === 'vi-en' ? "Không thể / Impossible" : "Không thể");
        }
    } else if (gradeId === 4) {
        const qType = Math.floor(Math.random() * 4);
        if (qType === 0) {
            // Average
            const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"];
            const monthsEn = ["Month 1", "Month 2", "Month 3", "Month 4"];
            const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 30) + 10);
            const sum = nums.reduce((a, b) => a + b, 0);
            // make sum divisible by 4
            const rem = sum % 4;
            if (rem !== 0) nums[0] += (4 - rem);
            const newSum = nums.reduce((a, b) => a + b, 0);
            const avg = newSum / 4;
            
            const headers = language === 'en' ? ["Month", "Books Read"] : language === 'vi-en' ? ["Tháng / Month", "Số sách / Books"] : ["Tháng", "Số sách"];
            const rows = months.map((m, i) => [language === 'en' ? monthsEn[i] : m, nums[i].toString()]);
            const colWidths = [150, 150];
            const svgString = generateTableSvg(headers, rows, colWidths);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            qText = `Dựa vào bảng số liệu, trung bình mỗi tháng đọc được bao nhiêu quyển sách?`;
            qTextEn = `Based on the data table, what is the average number of books read per month?`;
            answer = `${avg}`;
            expl = `Trung bình cộng = (${nums.join(" + ")}) : 4 = ${newSum} : 4 = ${avg}.`;
            explEn = `Average = (${nums.join(" + ")}) : 4 = ${newSum} : 4 = ${avg}.`;
            options.add(answer);
            while (options.size < 4) {
                const wrong = avg + Math.floor(Math.random() * 15) - 7;
                if (wrong > 0 && wrong !== avg) options.add(`${wrong}`);
            }
        } else if (qType === 1) {
            // Bar chart - Rainy days
            const months = ["Tháng 1", "Tháng 2", "Tháng 3"];
            const monthsEn = ["Month 1", "Month 2", "Month 3"];
            const data = [
                Math.floor(Math.random() * 10 + 1) * 2, // 2, 4, 6, ..., 20
                Math.floor(Math.random() * 10 + 2) * 2, // 4, 6, ..., 22
                Math.floor(Math.random() * 10 + 1) * 2  // 2, 4, ..., 20
            ];
            // Ensure data[1] is different from data[0] to ask comparison
            while (data[1] === data[0]) {
                data[1] = Math.floor(Math.random() * 10 + 2) * 2;
            }
            
            const title = language === 'en' ? "NUMBER OF RAINY DAYS IN FIRST 3 MONTHS" : "SỐ NGÀY CÓ MƯA TRONG BA THÁNG ĐẦU NĂM";
            const yLabel = language === 'en' ? "(Days)" : "(Ngày)";
            const xLabel = language === 'en' ? "(Month)" : "(Tháng)";
            const labels = language === 'en' ? monthsEn : months;
            
            const svgString = generateBarChartSvg(title, xLabel, yLabel, labels, data, 30, 5, '#ea580c'); // orange-600
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            const subType = Math.floor(Math.random() * 2);
            if (subType === 0) {
                // Which month has the most rainy days?
                const maxVal = Math.max(...data);
                const maxIdx = data.indexOf(maxVal);
                qText = `Dựa vào biểu đồ, tháng nào có nhiều ngày mưa nhất?`;
                qTextEn = `Based on the chart, which month has the most rainy days?`;
                answer = language === 'en' ? monthsEn[maxIdx] : language === 'vi-en' ? `${months[maxIdx]} / ${monthsEn[maxIdx]}` : months[maxIdx];
                expl = `Tháng có cột cao nhất là ${months[maxIdx]} với ${maxVal} ngày mưa.`;
                explEn = `The month with the highest bar is ${monthsEn[maxIdx]} with ${maxVal} rainy days.`;
                
                months.forEach((m, i) => {
                    options.add(language === 'en' ? monthsEn[i] : language === 'vi-en' ? `${m} / ${monthsEn[i]}` : m);
                });
            } else {
                // How many more rainy days in Month 2 than Month 1?
                const diff = Math.abs(data[1] - data[0]);
                const moreIdx = data[1] > data[0] ? 1 : 0;
                const lessIdx = data[1] > data[0] ? 0 : 1;
                qText = `Dựa vào biểu đồ, ${months[moreIdx]} mưa nhiều hơn ${months[lessIdx]} bao nhiêu ngày?`;
                qTextEn = `Based on the chart, how many more rainy days are there in ${monthsEn[moreIdx]} than in ${monthsEn[lessIdx]}?`;
                answer = `${diff}`;
                expl = `${months[moreIdx]} có ${data[moreIdx]} ngày, ${months[lessIdx]} có ${data[lessIdx]} ngày. Số ngày nhiều hơn là: ${data[moreIdx]} - ${data[lessIdx]} = ${diff} (ngày).`;
                explEn = `${monthsEn[moreIdx]} has ${data[moreIdx]} days, ${monthsEn[lessIdx]} has ${data[lessIdx]} days. The difference is: ${data[moreIdx]} - ${data[lessIdx]} = ${diff} (days).`;
                
                options.add(answer);
                while (options.size < 4) {
                    const wrong = diff + Math.floor(Math.random() * 10) - 5;
                    if (wrong > 0 && wrong !== diff) options.add(`${wrong}`);
                }
            }
        } else if (qType === 2) {
            // Bar chart - Library students
            const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];
            const daysEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            
            // Generate data where two days have the same value, and sum is divisible by 5
            let data = [0, 0, 0, 0, 0];
            let sum = 1;
            let sameVal = 0;
            while (sum % 5 !== 0) {
                sameVal = Math.floor(Math.random() * 10 + 5) * 5; // 25, 30, ..., 70
                data = [
                    Math.floor(Math.random() * 10 + 2) * 5, // 10-50
                    sameVal,
                    sameVal,
                    Math.floor(Math.random() * 10 + 12) * 5, // 60-110
                    Math.floor(Math.random() * 10 + 20) * 5  // 100-150
                ];
                sum = data.reduce((a, b) => a + b, 0);
            }
            
            const title = language === 'en' ? "NUMBER OF STUDENTS VISITING LIBRARY" : "SỐ HỌC SINH ĐẾN THƯ VIỆN MƯỢN SÁCH";
            const yLabel = language === 'en' ? "(Students)" : "(Học sinh)";
            const xLabel = language === 'en' ? "(Day)" : "(Ngày)";
            const labels = language === 'en' ? daysEn : days;
            
            const svgString = generateBarChartSvg(title, xLabel, yLabel, labels, data, 160, 20, '#0ea5e9'); // sky-500
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            const subType = Math.floor(Math.random() * 2);
            if (subType === 0) {
                // Which days have the same number of students?
                qText = `Dựa vào biểu đồ, những ngày nào có số học sinh đến thư viện mượn sách bằng nhau?`;
                qTextEn = `Based on the chart, which days have the same number of students visiting the library?`;
                const ansStr = language === 'en' ? `${daysEn[1]} and ${daysEn[2]}` : language === 'vi-en' ? `${days[1]} và ${days[2]} / ${daysEn[1]} and ${daysEn[2]}` : `${days[1]} và ${days[2]}`;
                answer = ansStr;
                expl = `Nhìn vào biểu đồ, ${days[1]} và ${days[2]} đều có ${sameVal} học sinh.`;
                explEn = `Looking at the chart, both ${daysEn[1]} and ${daysEn[2]} have ${sameVal} students.`;
                
                options.add(answer);
                options.add(language === 'en' ? `${daysEn[0]} and ${daysEn[1]}` : language === 'vi-en' ? `${days[0]} và ${days[1]} / ${daysEn[0]} and ${daysEn[1]}` : `${days[0]} và ${days[1]}`);
                options.add(language === 'en' ? `${daysEn[2]} and ${daysEn[3]}` : language === 'vi-en' ? `${days[2]} và ${days[3]} / ${daysEn[2]} and ${daysEn[3]}` : `${days[2]} và ${days[3]}`);
                options.add(language === 'en' ? `${daysEn[3]} and ${daysEn[4]}` : language === 'vi-en' ? `${days[3]} và ${days[4]} / ${daysEn[3]} and ${daysEn[4]}` : `${days[3]} và ${days[4]}`);
            } else {
                // Average
                const avg = sum / 5;
                qText = `Dựa vào biểu đồ, trung bình mỗi ngày có bao nhiêu học sinh đến thư viện mượn sách?`;
                qTextEn = `Based on the chart, what is the average number of students visiting the library per day?`;
                answer = `${avg}`;
                expl = `Tổng số học sinh trong 5 ngày là: ${data.join(" + ")} = ${sum}. Trung bình mỗi ngày có: ${sum} : 5 = ${avg} (học sinh).`;
                explEn = `Total students in 5 days is: ${data.join(" + ")} = ${sum}. Average per day is: ${sum} : 5 = ${avg} (students).`;
                
                options.add(answer);
                while (options.size < 4) {
                    const wrong = avg + Math.floor(Math.random() * 20) - 10;
                    if (wrong > 0 && wrong !== avg) options.add(`${wrong}`);
                }
            }
        } else {
            // Probability (coin toss, drawing balls)
            const scenarios = [
                {
                    vi: "Tung một đồng xu. Khả năng xuất hiện mặt sấp là:",
                    en: "Toss a coin. The possibility of getting heads is:",
                    ansVi: "Có thể", ansEn: "Possible",
                    explVi: "Đồng xu có 2 mặt sấp và ngửa, nên có thể xuất hiện mặt sấp.", explEn: "A coin has heads and tails, so getting heads is possible."
                },
                {
                    vi: "Trong hộp có 5 quả bóng đỏ. Lấy ngẫu nhiên 1 quả bóng. Khả năng lấy được bóng xanh là:",
                    en: "A box has 5 red balls. Draw 1 ball randomly. The possibility of drawing a blue ball is:",
                    ansVi: "Không thể", ansEn: "Impossible",
                    explVi: "Hộp chỉ có bóng đỏ nên không thể lấy được bóng xanh.", explEn: "The box only has red balls, so drawing a blue ball is impossible."
                },
                {
                    vi: "Trong hộp có 3 bóng xanh và 2 bóng vàng. Lấy ngẫu nhiên 1 quả bóng. Khả năng lấy được bóng xanh là:",
                    en: "A box has 3 blue balls and 2 yellow balls. Draw 1 ball randomly. The possibility of drawing a blue ball is:",
                    ansVi: "Có thể", ansEn: "Possible",
                    explVi: "Hộp có bóng xanh nên có thể lấy được bóng xanh.", explEn: "The box contains blue balls, so drawing a blue ball is possible."
                }
            ];
            const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
            qText = sc.vi;
            qTextEn = sc.en;
            answer = language === 'en' ? sc.ansEn : language === 'vi-en' ? `${sc.ansVi} / ${sc.ansEn}` : sc.ansVi;
            expl = sc.explVi;
            explEn = sc.explEn;
            options.add(language === 'en' ? "Certain" : language === 'vi-en' ? "Chắc chắn / Certain" : "Chắc chắn");
            options.add(language === 'en' ? "Possible" : language === 'vi-en' ? "Có thể / Possible" : "Có thể");
            options.add(language === 'en' ? "Impossible" : language === 'vi-en' ? "Không thể / Impossible" : "Không thể");
        }
    } else {
        // Grade 5
        const qType = Math.floor(Math.random() * 4);
        if (qType === 0) {
            // Percentage / Pie chart reading
            const p1 = Math.floor(Math.random() * 20 + 20); // 20-39
            const p2 = Math.floor(Math.random() * 20 + 20); // 20-39
            const p3 = 100 - p1 - p2;
            const items = ["Toán", "Tiếng Việt", "Tiếng Anh"];
            const itemsEn = ["Math", "Vietnamese", "English"];
            const targetIdx = Math.floor(Math.random() * 3);
            const targetP = [p1, p2, p3][targetIdx];
            
            const chartData = [
                { label: language === 'en' ? itemsEn[0] : items[0], value: p1, color: '#4CAF50' },
                { label: language === 'en' ? itemsEn[1] : items[1], value: p2, color: '#2196F3' },
                { label: language === 'en' ? itemsEn[2] : items[2], value: p3, color: '#FFC107' }
            ];
            const svgString = generatePieChartSvg(chartData, true);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

            qText = `Biểu đồ hình quạt tròn biểu diễn tỉ lệ học sinh thích các môn học. Môn ${items[targetIdx]} chiếm bao nhiêu phần trăm?`;
            qTextEn = `A pie chart shows the percentage of students liking subjects. What percentage likes ${itemsEn[targetIdx]}?`;
            answer = `${targetP}%`;
            expl = `Nhìn vào biểu đồ, môn ${items[targetIdx]} chiếm ${targetP}%.`;
            explEn = `Looking at the chart, ${itemsEn[targetIdx]} accounts for ${targetP}%.`;
            options.add(answer);
            while (options.size < 4) {
                const wrong = targetP + (Math.floor(Math.random() * 15) - 7);
                if (wrong > 0 && wrong !== targetP) options.add(`${wrong}%`);
            }
        } else if (qType === 1) {
            // Sắp xếp số liệu vào biểu đồ hình quạt tròn
            const total = Math.floor(Math.random() * 10 + 5) * 20; // 100, 120, 140... 280
            const p1 = total / 2;
            const p2 = total / 4;
            const p3 = total / 4;
            
            const chartData = [
                { label: language === 'en' ? 'Chess' : 'Cờ vua', value: p1, color: '#9C27B0' },
                { label: language === 'en' ? 'Swim' : 'Bơi', value: p2, color: '#00BCD4' },
                { label: language === 'en' ? 'Draw' : 'Vẽ', value: p3, color: '#FF9800' }
            ];
            const svgString = generatePieChartSvg(chartData, true, false);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

            const targetIdx = Math.floor(Math.random() * 3);
            const targetSubject = targetIdx === 0 ? (language === 'en' ? 'Chess' : 'Cờ vua') : targetIdx === 1 ? (language === 'en' ? 'Swim' : 'Bơi') : (language === 'en' ? 'Draw' : 'Vẽ');
            const targetVal = targetIdx === 0 ? p1 : targetIdx === 1 ? p2 : p3;

            qText = `Một trường có ${total} học sinh tham gia câu lạc bộ. Trong đó có ${p1} em học Cờ vua, ${p2} em học Bơi, ${p3} em học Vẽ. Nhìn vào biểu đồ hình quạt tròn, phần biểu diễn môn ${targetIdx === 0 ? 'Cờ vua' : targetIdx === 1 ? 'Bơi' : 'Vẽ'} sẽ chiếm:`;
            qTextEn = `A school has ${total} students in clubs. ${p1} play Chess, ${p2} Swim, ${p3} Draw. Looking at the pie chart, the part representing ${targetSubject} would be:`;
            
            if (targetIdx === 0) {
                answer = language === 'en' ? "Half of the circle" : language === 'vi-en' ? "Một nửa hình tròn / Half of the circle" : "Một nửa hình tròn";
                expl = `${p1} em trên tổng số ${total} em là ${p1}/${total} = 1/2, nên chiếm một nửa hình tròn.`;
                explEn = `${p1} out of ${total} is ${p1}/${total} = 1/2, so it takes up half of the circle.`;
            } else {
                answer = language === 'en' ? "A quarter of the circle" : language === 'vi-en' ? "Một phần tư hình tròn / A quarter of the circle" : "Một phần tư hình tròn";
                expl = `${targetVal} em trên tổng số ${total} em là ${targetVal}/${total} = 1/4, nên chiếm một phần tư hình tròn.`;
                explEn = `${targetVal} out of ${total} is ${targetVal}/${total} = 1/4, so it takes up a quarter of the circle.`;
            }
            
            options.add(answer);
            options.add(language === 'en' ? "Half of the circle" : language === 'vi-en' ? "Một nửa hình tròn / Half of the circle" : "Một nửa hình tròn");
            options.add(language === 'en' ? "A quarter of the circle" : language === 'vi-en' ? "Một phần tư hình tròn / A quarter of the circle" : "Một phần tư hình tròn");
            options.add(language === 'en' ? "A third of the circle" : language === 'vi-en' ? "Một phần ba hình tròn / A third of the circle" : "Một phần ba hình tròn");
            options.add(language === 'en' ? "The whole circle" : language === 'vi-en' ? "Cả hình tròn / The whole circle" : "Cả hình tròn");
        } else if (qType === 2) {
            // Lựa chọn cách biểu diễn số liệu
            qText = `Để biểu diễn tỉ lệ phần trăm các loại trái cây yêu thích của học sinh trong lớp so với tổng số học sinh, cách biểu diễn nào là phù hợp nhất?`;
            qTextEn = `To represent the percentage of students' favorite fruits compared to the whole class, which representation is most suitable?`;
            answer = language === 'en' ? "Pie chart" : language === 'vi-en' ? "Biểu đồ hình quạt tròn / Pie chart" : "Biểu đồ hình quạt tròn";
            expl = `Biểu đồ hình quạt tròn rất phù hợp để biểu diễn tỉ lệ phần trăm của từng phần so với tổng thể.`;
            explEn = `A pie chart is very suitable for representing the percentage of each part compared to the whole.`;
            options.add(answer);
            options.add(language === 'en' ? "Data series" : language === 'vi-en' ? "Dãy số liệu / Data series" : "Dãy số liệu");
            options.add(language === 'en' ? "Bar chart" : language === 'vi-en' ? "Biểu đồ cột / Bar chart" : "Biểu đồ cột");
            options.add(language === 'en' ? "Data table" : language === 'vi-en' ? "Bảng số liệu / Data table" : "Bảng số liệu");
        } else {
            // Ratio of repetitions
            const total = Math.floor(Math.random() * 50) + 20; // 20 to 69
            const times = Math.floor(Math.random() * (total - 5)) + 2;
            const tails = total - times;
            
            const headers = language === 'en' ? ["Result", "Count"] : language === 'vi-en' ? ["Kết quả / Result", "Số lần / Count"] : ["Kết quả", "Số lần"];
            const rows = [
                [language === 'en' ? "Heads" : "Mặt sấp", times.toString()],
                [language === 'en' ? "Tails" : "Mặt ngửa", tails.toString()]
            ];
            const colWidths = [150, 150];
            const svgString = generateTableSvg(headers, rows, colWidths);
            imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            
            qText = `Dựa vào bảng số liệu tung đồng xu ${total} lần, tỉ số mô tả số lần xuất hiện mặt sấp so với tổng số lần tung là:`;
            qTextEn = `Based on the data table of tossing a coin ${total} times, the ratio describing the number of heads to the total number of tosses is:`;
            answer = `${times}/${total}`;
            expl = `Tỉ số = Số lần mặt sấp / Tổng số lần tung = ${times}/${total}.`;
            explEn = `Ratio = Number of heads / Total tosses = ${times}/${total}.`;
            options.add(answer);
            while (options.size < 4) {
                const wrongTimes = times + Math.floor(Math.random() * 15) - 7;
                const wrongTotal = total + Math.floor(Math.random() * 10) - 5;
                if (wrongTimes > 0 && (wrongTimes !== times || wrongTotal !== total) && wrongTotal >= wrongTimes) {
                    options.add(`${wrongTimes}/${wrongTotal}`);
                }
            }
        }
    }

    const finalQText = language === 'en' ? qTextEn : language === 'vi-en' ? `${qText} / ${qTextEn}` : qText;
    const finalQExpl = language === 'en' ? explEn : language === 'vi-en' ? `${expl} / ${explEn}` : expl;

    if (type === 'fill-in-blank' || type === 'short-answer') {
        return {
            id: `stat-${index}`,
            type: type,
            text: finalQText,
            correctAnswer: answer,
            explanation: finalQExpl,
            imageUrl: imageUrl,
            placeholder: language === 'en' ? 'Enter answer...' : language === 'vi-en' ? 'Nhập đáp án... / Enter answer...' : 'Nhập đáp án...'
        };
    }

    return {
        id: `stat-${index}`,
        type: 'multiple-choice',
        text: finalQText,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer,
        explanation: finalQExpl,
        imageUrl: imageUrl
    };
}

