const TRANSLATION_API_URL = "https://api.mymemory.translated.net/get";
const WORDS_API_URL = "https://random-word-api.herokuapp.com/word?number=1";

class Vocabulary {
  constructor() {
    this.words = JSON.parse(localStorage.getItem("vocabulary")) || [];
  }

  addWord(word, translation) {
    if (!this.words.some((entry) => entry.word === word)) {
      this.words.push({ word, translation });
      localStorage.setItem("vocabulary", JSON.stringify(this.words));
    }
  }

  getRandomWord() {
    return this.words.length
      ? this.words[Math.floor(Math.random() * this.words.length)]
      : null;
  }

  displayVocabulary() {
    const vocabList = document.getElementById("vocabList");
    vocabList.innerHTML = this.words
      .map((entry) => `<li>${entry.word} - ${entry.translation}</li>`)
      .join("");
  }
}

class Quiz {
  constructor(vocabulary) {
    this.vocabulary = vocabulary;
  }

  async loadQuiz() {
    if (!this.vocabulary.words.length)
      return (document.getElementById("quizQuestion").textContent =
        "No words in vocabulary yet!");
    const randomWord = this.vocabulary.getRandomWord();
    const questionType = Math.floor(Math.random() * 3);
    questionType === 0
      ? this.generateTranslationQuestion(randomWord)
      : questionType === 1
      ? this.generateMatchingQuestion(randomWord)
      : this.generateFillInTheBlankQuestion(randomWord);
  }

  generateTranslationQuestion(word) {
    const options = [word.translation, ...this.getRandomOptions(word)];
    this.renderOptions(
      options.sort(() => Math.random() - 0.5),
      word.translation,
      "Translate to French:"
    );
  }

  generateMatchingQuestion(word) {
    const options = [word.translation, ...this.getRandomOptions(word)];
    this.renderOptions(
      [word.word, ...options].sort(() => Math.random() - 0.5),
      word.translation,
      "Match the word with its translation."
    );
  }

  generateFillInTheBlankQuestion(word) {
    document.getElementById(
      "quizQuestion"
    ).textContent = `Translate '${word.word}' (Fill in the blank).`;
    const inputBox = document.createElement("input");
    inputBox.placeholder = "Enter translation...";
    inputBox.id = "quizInput";
    document.getElementById(
      "quizOptions"
    ).innerHTML = `<button onclick="quizInstance.checkFillInTheBlankAnswer('${word.translation}')">Submit</button>`;
    document.getElementById("quizOptions").prepend(inputBox);
  }

  getRandomOptions(correctWord) {
    let options = [];
    while (options.length < 3) {
      const wrongTranslation =
        this.vocabulary.words[
          Math.floor(Math.random() * this.vocabulary.words.length)
        ].translation;
      if (!options.includes(wrongTranslation)) options.push(wrongTranslation);
    }
    return options;
  }

  renderOptions(options, correctAnswer, question) {
    document.getElementById("quizQuestion").textContent = question;
    const optionButtons = document.getElementById("quizOptions");
    optionButtons.innerHTML = options
      .map(
        (option) =>
          `<button class="quiz-option" onclick="quizInstance.checkAnswer('${option}', '${correctAnswer}')">${option}</button>`
      )
      .join("");
  }

  checkAnswer(selectedOption, correctAnswer) {
    document.getElementById("quizFeedback").textContent =
      selectedOption === correctAnswer
        ? "Correct!"
        : `Incorrect. The correct answer is "${correctAnswer}".`;
  }

  checkFillInTheBlankAnswer(userAnswer, correctAnswer) {
    document.getElementById("quizFeedback").textContent =
      userAnswer.toLowerCase() === correctAnswer.toLowerCase()
        ? "Correct!"
        : `Incorrect. The correct translation is "${correctAnswer}".`;
  }
}

const fetchTranslation = async (word) => {
  try {
    const res = await fetch(`${TRANSLATION_API_URL}?q=${word}&langpair=en|fr`);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch {
    return null;
  }
};

const fetchRandomWord = async () => {
  try {
    const res = await fetch(WORDS_API_URL);
    const data = await res.json();
    return data[0];
  } catch {
    return null;
  }
};

const fetchLearnWord = async () => {
  const word = ["journey", "improvement", "adventure", "technology", "freedom"][
    Math.floor(Math.random() * 5)
  ];
  const translation = await fetchTranslation(word);
  if (translation) {
    document.getElementById(
      "learnWord"
    ).textContent = `Word: ${word} (Translation: ${translation})`;
    vocabularyInstance.addWord(word, translation);
  } else {
    document.getElementById("learnWord").textContent = "Error fetching word.";
  }
};

const vocabularyInstance = new Vocabulary();
const quizInstance = new Quiz(vocabularyInstance);

document.getElementById("learnWordBtn").addEventListener("click", () => {
  showSection("learnWordSection");
  fetchLearnWord();
});
document.getElementById("quizBtn").addEventListener("click", () => {
  showSection("quizSection");
  quizInstance.loadQuiz();
});
document.getElementById("vocabBtn").addEventListener("click", () => {
  showSection("vocabSection");
  vocabularyInstance.displayVocabulary();
});

function showSection(sectionId) {
  document
    .querySelectorAll("main section")
    .forEach((section) => (section.hidden = section.id !== sectionId));
}
