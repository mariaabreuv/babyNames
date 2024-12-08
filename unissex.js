document.body.style.fontFamily = "Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif";

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
     .text('Unisex Names through the Years') 
     .style('margin-bottom', '20px')
     .style('text-align', 'center') 
     .style('font-size', '24px') 
     .attr('text-anchor', 'middle') 
     .style('font-family', 'American Typewriter, serif')
     .style('font-weight', 100)
     .style('font-size', '40px')
     .style('fill', '#FBB03B')
     .style('letter-spacing', '5px')
     .style('margin-top', '80px')

 layoutContainer.append('h5')
     .text('Percentage of unisex name distribution through time')

  const contentContainer = layoutContainer.append('div')
  .style('display', 'flex')
  .style('justify-content', 'center')
  .style('align-items', 'center')
  .style('width', '100%');

     const radioSection = contentContainer.append('div')
     .attr('id', 'radio-section')
     .style('width', '200px')
     .style('height', '500px')
     .style('overflow-y', 'scroll') 
     .style('padding', '10px')
     .style('border', 'none') 
     .style('background-color', 'transparent') 
     .style('border-right', 'none');


 const radioSectionElement = document.getElementById('radio-section');
 radioSectionElement.style['scrollbar-color'] = 'white transparent'; 
 radioSectionElement.style['scrollbar-width'] = 'thin'; 
 radioSectionElement.style['overflow-y'] = 'scroll'; 

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
d3.csv("datasets/UnissexBaby.csv").then(function (data) {
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
        .style('font-family', 'Avenir Light')
        .style('cursor', 'pointer')
        .style('color', 'white') 
        .html(d => `
            <input type="radio" name="name" value="${d}" 
                style="width: 20px; height: 20px; margin-right: 10px; 
                appearance: none; border: 2px solid white; 
                border-radius: 5px; /* Rounded corners */
                background-color: transparent; cursor: pointer;">
            ${d}
        `);

   
    function updateSelectedStyles() {
        // Reset all labels and buttons
        radioSection.selectAll('label').style('color', 'white');
        radioSection.selectAll('input[type="radio"]')
            .style('background-color', 'transparent') 
            .style('border-color', 'white'); 

        // Update the selected one
        const selectedRadio = radioSection.select('input[name="name"]:checked');
        selectedRadio.style('background-color', '#FBB03B') 
            .style('border-color', 'white'); 

        selectedRadio.node().parentNode.style.color = '#FBB03B'; 
    }

    // Apply event listener to update styles on change
    radioSection.selectAll('input[type="radio"]').on('change', function () {
        updateSelectedStyles(); 
        updateChart(); 
    });

    // Automatically select the first name
    const firstRadio = d3.select(`input[name="name"][value="${uniqueNames[0]}"]`);
    firstRadio.property('checked', true); 
    updateSelectedStyles(); 

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
                .range(['#00AEE4', 'pink']);

            const stack = d3.stack().keys(["boys", "girls"]);
            const series = stack(completeData);

            const area = d3.area()
                .x(d => x(new Date(d.data.year, 0, 1)))
                .y0(d => y(d[0]))
                .y1(d => y(d[1]))
                .curve(d3.curveMonotoneX);

            // Bind data to area paths and apply transitions
            const areas = svg.selectAll(".area")
                .data(series);

            areas.enter()
                .append("path")
                .attr("class", "area")
                .attr("fill", d => color(d.key))
                .attr("d", area)
                .style("opacity", 0) // Start with opacity 0
                .transition() // Transition to full opacity
                .duration(500)
                .style("opacity", 1);

            areas.transition() // Transition existing areas
                .duration(500)
                .attr("d", area);

            areas.exit()
                .transition() // Transition exiting areas
                .duration(500)
                .style("opacity", 0)
                .remove();

            // Update x-axis
            let xAxis = svg.select(".x-axis");
            if (xAxis.empty()) {
                xAxis = svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${height})`)
                    .style("color", "white");
            }
            xAxis.transition()
                .duration(500)
                .call(d3.axisBottom(x).ticks(11).tickSize(0).tickPadding(10).tickFormat(d3.timeFormat("%Y")));

            // Update y-axis
            let yAxis = svg.select(".y-axis");
            if (yAxis.empty()) {
                yAxis = svg.append("g")
                    .attr("class", "y-axis")
                    .style("color", "white");
            }
            yAxis.transition()
                .duration(500)
                .call(d3.axisLeft(y).ticks(10).tickSize(0).tickPadding(10).tickFormat(d => `${d}%`));

            // Add axis labels only if they don't already exist
            if (svg.select(".x-axis-label").empty()) {
                svg.append("text")
                    .attr("class", "x-axis-label")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom )
                    .attr("text-anchor", "middle")
                    .attr('fill', 'white')
                    .style('font-family', 'Avenir Light')
                    .style('font-size', '14px')
                    .text("Years");
            }

            if (svg.select(".y-axis-label").empty()) {
                svg.append("text")
                    .attr("class", "y-axis-label")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 15)
                    .attr("text-anchor", "middle")
                    .attr('fill', 'white')
                    .style('font-family', 'Avenir Light')
                    .style('font-size', '14px')
                    .text("Total (%)");
            }
        }
    }).catch(error => {
        console.error("Error loading or parsing data:", error);
    });
});