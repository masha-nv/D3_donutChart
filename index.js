const form = document.querySelector("form");
const name = document.querySelector("#name");
const cost = document.querySelector("#cost");
const error = document.querySelector("#error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (name.value.trim() && cost.value.trim()) {
    const item = {
      name: name.value.trim(),
      cost: parseInt(cost.value.trim()),
    };
    db.collection("expenses")
      .add(item)
      .then(() => {
        form.reset();
        error.textContent = "";
      });
  } else {
    error.textContent = "Please enter values before submitting";
  }
});
