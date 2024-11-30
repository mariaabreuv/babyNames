window.onload = function () {


    const filePath = './NameCounts.csv'; // Path to your data file

    // create a tooltip, so later we make it visible with the data information
    d3.select('body').append("div")
        .style("opacity", '0') // it is hidden
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style('position', 'absolute')
        .style("border-radius", "8px")
        .style('padding', '2px');


    // Load the CSV data
    d3.csv(filePath, d => ({
        name: d.Name,
        count: +d.TotalCount,
        gender: d.Gender,
        year: +d.Year_of_Birth,
    })).then(data => {
        const years = Array.from(new Set(data.map(d => d.year))).sort();
        setupRadioButtons(years, data);
    });
};

function setupRadioButtons(years, data) {
    // Container for the radio buttons
    const radioContainer = d3.select('body')
        .append('div')
        .attr('id', 'radio-buttons-container');

    // Radio button for each year
    radioContainer.selectAll('label')
        .data(years)
        .enter()
        .append('label')
        .attr('class', 'radio-button-label')
        .append('input')
        .attr('type', 'radio')
        .attr('name', 'year')
        .attr('value', d => d)
        .on('change', function () {
            const selectedYear = +this.value;
            updateVisualization(selectedYear, data);
        })
        .each(function (d) {
            d3.select(this.parentNode).append('span').text(d);
        });

    // Select the first year and update the visualization
    d3.select(`input[value="${years[0]}"]`).property('checked', true);
    updateVisualization(years[0], data);
}



function updateVisualization(selectedYear, data) {
    const yearData = data.filter(d => d.year === selectedYear);

    const globalMaxCount = d3.max(yearData, d => d.count);

    // Group data by first letter of the name and sort
    const letterGroups = d3.group(yearData, d => d.name[0]);
    const sortedLetters = Array.from(letterGroups.keys()).sort();

    // Clear previous visualization
    d3.select('#visualization').remove();

    // Create a container for the small multiples
    const container = d3.select('body')
        .append('div')
        .attr('id', 'visualization')
        .style('padding-left', '80px');

    const smallWidth = 200;
    const smallHeight = 200;
    const radius = 50;

    // Create a circular bar chart for each letter
    sortedLetters.forEach((letter, index) => {
        const letterData = letterGroups.get(letter);

        // Sort letter data alphabetically and group by gender
        const sortedLetterData = letterData.sort((a, b) => d3.ascending(a.count, b.count));
        const genderData = d3.group(sortedLetterData, d => d.gender);

        const femaleData = genderData.get('FEMALE') || [];
        const maleData = genderData.get('MALE') || [];

        // Create a new SVG for each letter
        const svg = container.append('svg')
            .attr('width', smallWidth)
            .attr('height', smallHeight)
            .style('margin', '10px');

        // Add a title to each chart
        svg.append('text')
            .attr('class', 'firstLetter')
            .attr('x', smallWidth / 2)
            .attr('y', smallHeight / 2)
            .attr('text-anchor', 'middle')
            .text(letter);

            const mOver = function (e, d) {
                // Hide the letter
                d3.select(this.parentNode).select('.firstLetter').style('opacity', 0);
            
                // Highlight the hovered bar
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1);
            
                // Display the name
                d3.select(this.parentNode)
                    .append('text')
                    .attr('class', 'hover-text name') // Use class for cleanup
                    .attr('x', 0) // Centered horizontally
                    .attr('y', -10) // Slightly above center
                    .attr('text-anchor', 'middle')
                    .text(d.name)
                    .attr('fill', 'black');
            
                // Display the count
                d3.select(this.parentNode)
                    .append('text')
                    .attr('class', 'hover-text count') // Use class for cleanup
                    .attr('x', 0) // Centered horizontally
                    .attr('y', 10) // Slightly below center
                    .attr('text-anchor', 'middle')
                    .text(`${d.count} babies`)
                    .attr('fill', 'black');
            };
            
            const mOut = function () {
                // Restore the letter
                d3.select(this.parentNode).select('.firstLetter').style('opacity', 1);
            
                d3.select(this.parentNode).selectAll('.hover-text').remove();
                d3.select(this).style("stroke", "none");
        }

        // Combine male and female data for consistent angles
        const combinedData = [...femaleData.map(d => ({ ...d, gender: 'FEMALE' })),
        ...maleData.map(d => ({ ...d, gender: 'MALE' }))];

        // Define scales
        const angleScale = d3.scaleBand()
            .domain(d3.range(combinedData.length))
            .range([0, 2 * Math.PI]); 

        const countScale = d3.scaleLinear()
            .domain([0, globalMaxCount])
            .range([radius, radius + 50]);

        const colorScale = d3.scaleOrdinal()
            .domain(['FEMALE', 'MALE'])
            .range(['pink', 'steelblue']);

        // Define the arc generator
        const arc = d3.arc()
            .innerRadius(radius)
            .outerRadius(d => countScale(d.count))
            .startAngle((d, i) => angleScale(i)) 
            .endAngle((d, i) => angleScale(i) + angleScale.bandwidth()) 
            .padAngle(0.01) 
            .cornerRadius(4); 

        // Draw circular bars
        svg.append('g')
            .attr('transform', `translate(${smallWidth / 2}, ${smallHeight / 2})`) 
            .selectAll('path')
            .data(combinedData)
            .join('path')
            .attr('d', arc) 
            .attr('fill', d => colorScale(d.gender))
            .attr('stroke', 'none')
            .on('mouseover', mOver)
            //.on('mouseover', mOver_c)
            .on('mouseout', mOut)

    });
}
