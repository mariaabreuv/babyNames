window.addEventListener("load", function () {
    // Create a container for the layout
    const layoutContainer = d3.select('body')
        .append('div')
        .attr('id', 'layout-container')
        .style('display', 'flex')
        .style('flex-direction', 'column') // Column layout for title and sections
        .style('align-items', 'center') // Center-align everything
        .style('justify-content', 'center')
        .style('height', '100vh')
        .style('width', '100%')
        .style('box-sizing', 'border-box');

    // Add title before both sections
    layoutContainer.append('h2')
        .text('Unisex Names through the Years') // Add your desired title text here
        .style('margin-bottom', '20px') // Add spacing below the title
        .style('text-align', 'center') // Center-align the title
        .style('font-size', '24px') // Style the title font size
        .style('font-weight', 'bold'); // Make the title bold

    // Create a container for the radio-section and graph-section
    const contentContainer = layoutContainer.append('div')
        .style('display', 'flex') // Flexbox layout for side-by-side sections
        .style('align-items', 'center') 
        .style('justify-content', 'center')
        .style('width', '100%');

    // Create a scrollable section for radio buttons
    const radioSection = contentContainer.append('div')
        .attr('id', 'radio-section')
        .style('width', '200px')
        .style('height', '500px') // Fixed height for scrollable area
        .style('overflow-y', 'auto')
        .style('border', '1px solid #ccc')
        .style('padding', '10px')
        .style('background-color', '#f9f9f9')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.1)');

    // Create the SVG container for the graph
    const graphSection = contentContainer.append('div')
        .attr('id', 'graph-section')
        .style('flex-grow', '1')
        .style('max-width', '800px') 
        .style('padding-left', '20px');

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 50, left: 70 };

    const svg = graphSection.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load and parse the CSV file
    d3.csv("UnissexBaby.csv").then(function (data) {
        const uniqueNames = Array.from(new Set(data.map(d => d["ChildsFirstName"]))).sort();

        const allYears = data.map(d => +d["YearOfBirth"]);
        const overallMinYear = d3.min(allYears);
        const overallMaxYear = d3.max(allYears);

        // Create radio buttons for each unique name
        radioSection.selectAll('label')
            .data(uniqueNames)
            .enter()
            .append('label')
            .attr('class', 'radio-button-label')
            .style('display', 'block')
            .style('margin-bottom', '10px')
            .style('font-size', '14px')
            .html(d => `
                <input type="radio" name="name" value="${d}">
                ${d}
            `);

        // Automatically select the first name
        d3.select(`input[name="name"][value="${uniqueNames[0]}"]`).property('checked', true);

        // Add event listeners to the radio buttons
        radioSection.selectAll('input')
            .on('change', updateChart);

        // Initial chart rendering
        updateChart();

        function updateChart() {
            const selectedName = radioSection.select('input[name="name"]:checked').node().value;

            const filteredData = data
                .filter(d => d["ChildsFirstName"] === selectedName)
                .map(d => ({
                    year: +d["YearOfBirth"],
                    boys: parseFloat(d.PercentageBoys.replace('%', '')) || 0,
                    girls: parseFloat(d.PercentageGirls.replace('%', '')) || 0
                }));

            const completeData = d3.range(overallMinYear, overallMaxYear + 1).map(year => {
                const entry = filteredData.find(d => d.year === year);
                return entry || { year: year, boys: 0, girls: 0 };
            });

            const x = d3.scaleTime()
                .domain([new Date(overallMinYear, 0, 1), new Date(overallMaxYear, 0, 1)])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            const color = d3.scaleOrdinal()
                .domain(["boys", "girls"])
                .range(["steelblue", "pink"]);

            const stack = d3.stack().keys(["boys", "girls"]);
            const series = stack(completeData);

            const area = d3.area()
                .x(d => x(new Date(d.data.year, 0, 1)))
                .y0(d => y(d[0]))
                .y1(d => y(d[1]))
                .curve(d3.curveMonotoneX);

            // Remove previous chart areas
            svg.selectAll(".area").remove();

            svg.selectAll(".area")
                .data(series)
                .join("path")
                .attr("class", "area")
                .attr("d", area)
                .attr("fill", d => color(d.key));

            // Remove and re-add axes
            svg.selectAll(".axis").remove();

            // Add x-axis
            svg.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%Y")));

            // Add y-axis
            svg.append("g")
                .attr("class", "axis y-axis")
                .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`));

            // Add axis labels only if they don't already exist
            if (svg.select(".x-axis-label").empty()) {
                svg.append("text")
                    .attr("class", "x-axis-label")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom - 10)
                    .attr("text-anchor", "middle")
                    .style("font-size", "14px")
                    .text("Years");
            }

            if (svg.select(".y-axis-label").empty()) {
                svg.append("text")
                    .attr("class", "y-axis-label")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 15)
                    .attr("text-anchor", "middle")
                    .style("font-size", "14px")
                    .text("Total (%)");
            }
        }
    }).catch(error => {
        console.error("Error loading or parsing data:", error);
    });
});
