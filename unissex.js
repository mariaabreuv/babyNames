window.onload = function () {
    // Set dimensions and margins
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};

    // Append SVG to the body
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load and parse the CSV file
    d3.csv("UnissexBaby.csv").then(function(data) {
        // Get unique names for the dropdown
        const uniqueNames = Array.from(new Set(data.map(d => d["ChildsFirstName"]))).sort();

        // Create dropdown menu
        const dropdown = d3.select("body")
            .append("select")
            .attr("id", "nameDropdown")
            .on("change", updateChart);

        dropdown.selectAll("option")
            .data(uniqueNames)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        // Initial chart for the first name
        updateChart();

        // Update chart function
        function updateChart() {
            const selectedName = dropdown.node().value || uniqueNames[0];

            // Filter data for the selected name and format it
            let filteredData = data
              .filter(d => d["ChildsFirstName"] === selectedName)
              .map(d => ({
                year: +d["YearOfBirth"],
                boys: parseFloat(d.PercentageBoys.replace('%', '')) || 0,
                girls: parseFloat(d.PercentageGirls.replace('%', '')) || 0
              }));

            // Fill in missing years
            const yearsWithData = filteredData.map(d => d.year);
            const minYear = d3.min(yearsWithData);
            const maxYear = d3.max(yearsWithData);
            const allYears = d3.range(minYear, maxYear + 1);

            const completeData = allYears.map(year => {
                const entry = filteredData.find(d => d.year === year);
                return entry || { year: year, boys: 0, girls: 0 };
            });

            // Define scales
            const x = d3.scaleTime()
                .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            // Define color scale
            const color = d3.scaleOrdinal()
                .domain(["boys", "girls"])
                .range(["#4f8dc5", "#c57ba0"]);

            // Stack the data
            const stack = d3.stack().keys(["boys", "girls"]);
            const series = stack(completeData);

            // Define area generator
            const area = d3.area()
                .x(d => x(new Date(d.data.year, 0, 1)))
                .y0(d => y(d[0]))
                .y1(d => y(d[1]));

            // Clear existing paths and re-draw for the new data
            svg.selectAll(".area").remove();

            svg.selectAll(".area")
              .data(series)
              .join("path")
                .attr("class", "area")
                .attr("d", area)
                .attr("fill", d => color(d.key));

            // Clear and update axes
            svg.selectAll(".axis").remove();

            // Add x-axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%Y")))
                .append("text")
                .attr("class", "axis-label")
                .attr("x", width / 2)
                .attr("y", 30)
                .attr("text-anchor", "middle")
                .text("Year");

            // Add y-axis
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .text("Percentage of Babies Born");

            // Add title
            svg.selectAll(".chart-title").remove();

            svg.append("text")
                .attr("class", "chart-title")
                .attr("x", width / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text(`Gender Distribution for ${selectedName}`);
        }
    }).catch(error => {
        console.error("Error loading or parsing data:", error);
    });
}
