// Initialize Supabase directly at the top
const SUPABASE_URL = "https://bixaifcnznkkqmemfqes.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeGFpZmNuem5ra3FtZW1mcWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDk4ODAsImV4cCI6MjA5MDQyNTg4MH0._6L8e77pp6iFD-CecNPc_-GyhaWQu8fqsVKpVGKuf1w";

let supabaseClient;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const questions = [
  {
    text: "What is the #1 cause of Sydney's housing affordability crisis?",
    options: [
      "Foreign investment driving up prices",
      "Population growth outpacing infrastructure",
      "Insufficient housing supply",
      "Low interest rates inflated over the past decade"
    ],
    correct: 2
  },
  {
    text: "What salary do you think would be required to buy a home today?",
    options: ["130k", "172k", "224k", "232k"],
    correct: 3
  },
  {
    text: "What does negative gearing allow property investors to do?",
    options: [
      "Claim rental losses as a tax deduction",
      "Guarantee profit",
      "Generate cash flow",
      "Protect investors against rising interest rates"
    ],
    correct: 0
  },
  {
    text: "The 'First Home Guarantee' scheme in NSW now allows eligible buyers to purchase properties valued up to _____ with only a 5% deposit",
    options: ["$900k", "$1.5M", "$1.75M", "$1.8M"],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;
let userId = null;

const startScreen = document.getElementById("start-screen");
const pollContainer = document.getElementById("poll-container");
const resultScreen = document.getElementById("result-screen");
const scoreText = document.getElementById("score-text");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");

document.getElementById("start-btn").onclick = startQuiz;
document.getElementById("retry-btn").onclick = () => {
  restartQuiz;
};
document.getElementById("home-btn").onclick = () => {
  window.location.href = "./index.html"; 
};

function generateUserId() {
  const stored = localStorage.getItem("quizUserId");
  if (stored) {
    return stored;
  }
  const newId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("quizUserId", newId);
  return newId;
}

function startQuiz() {
  userId = generateUserId();
  startScreen.classList.add("hidden");
  pollContainer.classList.remove("hidden");
  progressContainer.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  pollContainer.innerHTML = "";
  const q = questions[currentQuestion];
  const card = document.createElement("div");
  card.className = "question-card";

  const questionText = document.createElement("h3");
  questionText.textContent = q.text;
  card.appendChild(questionText);

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "poll-btn";

    btn.onclick = () => {
      const allButtons = card.querySelectorAll("button");
      allButtons.forEach(b => b.disabled = true);

      if (i === q.correct) {
        btn.classList.add("correct");
        score++;
      } else {
        btn.classList.add("incorrect");
        allButtons[q.correct].classList.add("correct");
      }
      setTimeout(nextQuestion, 900);
    };

    card.appendChild(btn);
  });

  pollContainer.appendChild(card);
  updateProgress();
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressBar.style.width = percent + "%";
}
async function showResults() {
  pollContainer.classList.add("hidden");
  progressContainer.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const percentageScore = (score / questions.length) * 100;
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;

  if (!supabaseClient) {
    scoreText.innerHTML += `<br><br><strong style="color: red;">ERROR: Supabase not initialized</strong>`;
    return;
  }

  try {
    // Get the user's answers
    const userAnswers = [];
    for (let i = 0; i < questions.length; i++) {
      userAnswers.push(i); // or store actual answers if you track them
    }

    console.log("Attempting insert with:", {
      user_id: userId + "_" + Date.now(),
      score: score,
      total_questions: questions.length,
      answers: userAnswers,
      percentage_score: percentageScore
    });

    const { data: insertData, error: insertError } = await supabaseClient
      .from("quiz_responses")
      .insert([
        {
          user_id: userId + "_" + Date.now(),
          score: score,
          total_questions: questions.length,
          answers: userAnswers,
          percentage_score: percentageScore
        }
      ])
      .select();

    console.log("Insert response:", { insertData, insertError });

    if (insertError) {
      scoreText.innerHTML += `<br><br><strong style="color: red;">Insert Error: ${insertError.message}</strong>`;
      console.error("Insert failed:", insertError);
      return;
    }

    console.log("Insert successful!");

    // Get stats
    const { data: allData, error: selectError } = await supabaseClient
      .from("quiz_responses")
      .select("*");

    console.log("Select response:", { allData, selectError });

    if (selectError) {
      scoreText.innerHTML += `<br><br><strong style="color: red;">Select Error: ${selectError.message}</strong>`;
      console.error("Select failed:", selectError);
      return;
    }

    if (allData && allData.length > 0) {
      const totalResponses = allData.length;
      const avgScore = (allData.reduce((sum, r) => sum + r.percentage_score, 0) / totalResponses).toFixed(1);
      
      scoreText.innerHTML += `<br><br><strong>✅ Quiz Statistics:</strong><br>Total takers: ${totalResponses}<br>Average score: ${avgScore}%`;
    } else {
      scoreText.innerHTML += `<br><br><strong>✅ Your response saved!</strong>`;
    }
  } catch (error) {
    scoreText.innerHTML += `<br><br><strong style="color: red;">Exception: ${error.message}</strong>`;
    console.error("Full error:", error);
  }
}
