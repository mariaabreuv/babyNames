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
    let dataByGender = d3.groups(top10Names, d => d.gender)

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

        let colorScale = d3.scaleOrdinal()
        .domain(['Female', 'Male'])
        .range(['#ff69b4', '#1f77b4']); // Pink for female, blue for male

    // Group data by name
    let groupedByName = d3.groups(data, d => d.name);

    // Draw lines for each name, using gender-based coloring
    groupedByName.forEach(([name, nameData]) => {
        svg.append('path')
            .datum(nameData)
            .attr('fill', 'none')
            .attr('stroke', colorScale(nameData[0].gender)) // Color by gender
            .attr('stroke-width', 1.5)
            .attr('d', line);
    });

    // Add gender legend
    let legend = svg.append('g')
        .attr('transform', `translate(${graphWidth - 150}, ${padding})`);

    ['Female', 'Male'].forEach((gender, index) => {
        let yOffset = index * 20; // Space between legend items

        legend.append('rect')
            .attr('x', 0)
            .attr('y', yOffset)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', colorScale(gender));

        legend.append('text')
            .attr('x', 20)
            .attr('y', yOffset + 12)
            .text(gender)
            .style('font-size', '14px')
            .attr('fill', '#000');
    });
    // **Changes End Here**

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${graphHeight})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')));

    svg.append('g')
        .attr('transform', `translate(${padding},0)`)
        .call(d3.axisLeft(yScale));
}
