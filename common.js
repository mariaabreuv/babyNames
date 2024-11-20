let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let babies;

window.onload = function () {
    // General graph attributes
    canvasHeight = 780;
    canvasWidth = 1080;
    padding = 60;
    graphHeight = canvasHeight - padding * 2;
    graphWidth = canvasWidth - padding * 2;

    babies = './top10babies.csv'; // Path to your dataset

    // Create an SVG element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    // Load and parse the CSV file
    d3.csv(babies, b => ({
        year: +b.Year_of_Birth, // Convert year to a number
        gender: b.Gender,
        name: b.Name,
        rank: +b.Rank,
        count: +b.Baby_Count, // Baby count
        total: +b.Total,
        percentage: +b.Percentage
    })).then(top10);
};

function top10(data) {
    // Filter top 10 names based on baby count
    let top10Names = data
        .filter(d => d.rank <= 10)
        .sort((a, b) => d3.ascending(a.year, b.year));

    // Group data by name
    let dataByName = d3.groups(top10Names, d => d.name);

    // Create scales
    let xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, graphWidth]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([graphHeight, padding]);

    // Create axes
    let xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    let yAxis = d3.axisLeft(yScale).ticks(10);

    // Append axes to the SVG
    svg.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

    // Define a line generator
    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count));

    // Draw lines for each name
    dataByName.forEach(([name, values]) => {
        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[Math.floor(Math.random() * 10)]) // Random colors
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    // Add a subtitles
    let legend = svg.selectAll(".legend")
        .data(dataByName)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${graphWidth + 50}, ${padding + i * 20})`);

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (_, i) => d3.schemeCategory10[i % 10]);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text(d => d[0])
        .attr("font-size", "12px")
        .attr("fill", "black");
}
