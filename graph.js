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

// SCALE
const colours = d3.scaleOrdinal(d3.schemeDark2);

//update function
const update = (data) => {
  const paths = graph.selectAll("path").data(pie(data));

  //update color scale domain
  colours.domain(data.map((d) => d.name));

  paths.exit().transition(750).attrTween("d", arcTweenExit).remove();

  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenCurrent);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => colours(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);
};

// data array and firestore
const expenses = [];
db.collection("expenses").onSnapshot((data) => {
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

//interpolator functions

const arcTweenEnter = (d) => {
  let interpolator = d3.interpolate(d.endAngle, d.startAngle);
  return function (t) {
    d.startAngle = interpolator(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  const interpolator = d3.interpolate(d.startAngle, d.endAngle);
  return function (t) {
    d.startAngle = interpolator(t);
    return arcPath(d);
  };
};

function arcTweenCurrent(d) {
  const interpolator = d3.interpolate(this._current, d);
  this._current = d;
  return function (t) {
    return arcPath(interpolator(t));
  };
}
