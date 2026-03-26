const questions = [
{
  text: "What is the #1 cause of Sydney's housing affordability crisis?",
  options: ["Foreign investment driving up prices", "Population growth outpacing infastructure", "Insufficient housing supply", "Low interest rates inflated over the past decade"],
  correct: 3
},
{
  text: "What salary do you think would be required to buy a home today?",
  options: ["130k", "172k", "224k", "232k"],
  correct: 4
},
{
  text: "What does negative gearing allow property investors to do?",
  options: ["Claim rental losses as a tax deduction", "Guarantee profit", "Generate cash flow", "Protect investors against rising interest rates"],
  correct: 1
},
{
  text: "The 'First Home Guarantee' scheme in NSW now allows eligible buyers to purcahse properties valued up to _____ with only a 5% deposit",
  options: ["$900k", "$1.5M", "$1.75M", "$1.8M"],
  correct: 2
}
];

const container = document.getElementById("poll-container");

questions.forEach((q, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "20px";

  const questionText = document.createElement("h3");
  questionText.textContent = q.text;
  wrapper.appendChild(questionText);

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.style.marginRight = "10px";

    btn.onclick = () => {
      if (i ===q.correct) {
        alert("Correct!");
      } else {
        alert("Incorrect.);
              }
    };

    wrapper.appendChild(btn);
  });

  container.appendChild(wrapper);
});

  
    

      
