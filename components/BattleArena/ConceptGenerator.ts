// Quiz Generation System for Smart Contract Integration

interface MongoEntity {
  _id: string;
}

// Database interfaces (what you get from your backend)
interface Question extends MongoEntity {
  question_id: number;
  text: string;
  correct: boolean;
  explanation: string;
}

interface LearningContent extends MongoEntity {
  summary: string;
  big_note: string[];
  battle_relevance: string;
}

interface Topic extends MongoEntity {
  topic_id: number;
  title: string;
  learning_content: LearningContent;
  questions: Question[];
}

interface Concept extends MongoEntity {
  concept_id: number;
  title: string;
  description: string;
  topics: Topic[];
  __v: number;
}

interface ConceptsData {
  concepts?: Concept[];
}

/**
 * Helper function to get random elements from an array
 */
function getRandomElements<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error(
      `Cannot select ${count} elements from array of length ${array.length}`
    );
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Helper function to get a single random element
 */
function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot select element from empty array");
  }
  return array[Math.floor(Math.random() * array.length)];
}

// Smart Contract Ready Result
interface BattleQuizData {
  // For smart contract
  selectedConceptIds: number[];
  selectedTopicIds: number[];
  selectedQuestionIds: number[];
  correctAnswers: boolean[];

  // For UI display (questions without answers visible)
  displayQuestions: Array<{
    question_id: number;
    text: string;
    explanation: string;
  }>;

  // For UI context
  conceptInfo: Array<{
    concept_id: number;
    title: string;
    description: string;
  }>;

  totalQuestions: number;
}

/**
 * Generate quiz data ready for smart contract + UI display
 */
function generateBattleQuiz(concepts: Concept[]): BattleQuizData {
  if (concepts.length < 5) {
    throw new Error("Need at least 5 concepts to generate quiz");
  }

  // Step 1: Select 5 random concepts
  const selectedConcepts = getRandomElements(concepts, 5);

  // Arrays for smart contract
  const selectedConceptIds: number[] = [];
  const selectedTopicIds: number[] = [];
  const selectedQuestionIds: number[] = [];
  const correctAnswers: boolean[] = [];

  // Arrays for UI display
  const displayQuestions: Array<{
    question_id: number;
    text: string;
    explanation: string;
  }> = [];

  const conceptInfo: Array<{
    concept_id: number;
    title: string;
    description: string;
  }> = [];

  // Step 2 & 3: Process each concept
  selectedConcepts.forEach((concept) => {
    // Store concept info
    selectedConceptIds.push(concept.concept_id);
    conceptInfo.push({
      concept_id: concept.concept_id,
      title: concept.title,
      description: concept.description,
    });

    // Get 2 random topics from this concept
    if (concept.topics.length < 2) {
      throw new Error(`Concept "${concept.title}" needs at least 2 topics`);
    }

    const selectedTopics = getRandomElements(concept.topics, 2);

    selectedTopics.forEach((topic) => {
      // Store topic info
      selectedTopicIds.push(topic.topic_id);

      // Get 1 random question from this topic
      if (topic.questions.length === 0) {
        throw new Error(`Topic "${topic.title}" has no questions`);
      }

      const selectedQuestion = getRandomElement(topic.questions);

      // Store for smart contract
      selectedQuestionIds.push(selectedQuestion.question_id);
      correctAnswers.push(selectedQuestion.correct);

      // Store for UI (without revealing answer)
      displayQuestions.push({
        question_id: selectedQuestion.question_id,
        text: selectedQuestion.text,
        explanation: selectedQuestion.explanation,
      });
    });
  });

  return {
    selectedConceptIds,
    selectedTopicIds,
    selectedQuestionIds,
    correctAnswers,
    displayQuestions,
    conceptInfo,
    totalQuestions: displayQuestions.length,
  };
}

/**
 * Wrapper for data that comes wrapped in concepts object
 */
function generateBattleQuizFromData(
  originalData: ConceptsData
): BattleQuizData {
  if (!originalData.concepts) {
    throw new Error("Original data must contain concepts array");
  }

  return generateBattleQuiz(originalData.concepts);
}

/**
 * Utility: Extract just the smart contract parameters
 */
function extractSmartContractParams(quizData: BattleQuizData) {
  return {
    selectedConcepts: quizData.selectedConceptIds,
    selectedTopics: quizData.selectedTopicIds,
    selectedQuestions: quizData.selectedQuestionIds,
    correctAnswers: quizData.correctAnswers,
  };
}

/**
 * Utility: Extract just the UI display data
 */
function extractDisplayData(quizData: BattleQuizData) {
  return {
    questions: quizData.displayQuestions,
    conceptInfo: quizData.conceptInfo,
    totalQuestions: quizData.totalQuestions,
  };
}

/**
 * Utility: Validate question counts
 */
function validateQuizStructure(quizData: BattleQuizData): boolean {
  const expected = {
    concepts: 5,
    topics: 10,
    questions: 10,
  };

  return (
    quizData.selectedConceptIds.length === expected.concepts &&
    quizData.selectedTopicIds.length === expected.topics &&
    quizData.selectedQuestionIds.length === expected.questions &&
    quizData.correctAnswers.length === expected.questions &&
    quizData.displayQuestions.length === expected.questions
  );
}

// Export main functions
export {
  generateBattleQuiz,
  generateBattleQuizFromData,
  extractSmartContractParams,
  extractDisplayData,
  validateQuizStructure,
  getRandomElements,
  getRandomElement,
};

export type { Concept, Topic, Question, ConceptsData, BattleQuizData };
