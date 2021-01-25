const pieDims = { width: 300, height: 300, radius: 150 };
const center = { x: pieDims.width / 2 + 5, y: pieDims.height / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", pieDims.width + 150)
  .attr("height", pieDims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

const arcPath = d3
  .arc()
  .innerRadius(pieDims.radius / 2)
  .outerRadius(pieDims.radius);

//update function
const update = (data) => {
  const paths = graph.selectAll("path").data(pie(data));

  paths.exit().remove();

  paths
    .enter()
    .append("path")
    .merge(paths)
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", "pink");
};

// data array and firestore
const expenses = [];
db.collection("expenses").onSnapshot((data) => {
  console.log(data.docChanges());
  data.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        expenses.push(doc);
        break;
      case "modified":
        const idx = expenses.findIndex((ex) => ex.id === change.doc.id);
        expenses[idx] = doc;
        break;
      case "removed":
        const idxRemoved = expenses.findIndex((ex) => ex.id === change.doc.id);
        expenses.splice(idxRemoved, 1);
        break;
      default:
        break;
    }
  });
  update(expenses);
});
