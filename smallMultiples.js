window.addEventListener("load", function () {
    const filePath = 'datasets/NameCounts.csv'; // Path to your data file


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
});

function setupRadioButtons(years, data) {
    // Create a container for the header and radio buttons
    const headerContainer = d3.select('body')
        .append('div')
        .attr('id', 'header-container')
        .style('text-align', 'center')
        .style('margin-bottom', '20px');

    // Add the header
    headerContainer.append('h2')
        .text('Popular letters and their names throughout the years')
        .style('margin-bottom', '10px')
        .style('font-weight', 100)
        .style('fill', '#FBB03B')
        .style('letter-spacing', '5px')
        .style('margin-top', '80px')
        .style('margin-bottom', '80px')
        .style('font-family', 'American Typewriter, serif')
        .style('font-size', '40px')
        .style('fill', '#FBB03B')
        .style('margin-top', '80px')


    // Add the radio buttons container
    const radioContainer = headerContainer.append('div')
        .attr('id', 'radio-buttons-container')
        .style('display', 'inline-block');

    // Create a radio button for each year
    radioContainer.selectAll('label')
        .data(years)
        .enter()
        .append('label')
        .attr('class', 'radio-button-label')
        .style('color', 'white')
        .style('margin-right', '10px')
        .style('font-size', '14px')
        .html(d => `
                <input type="radio" name="year" value="${d}">
                ${d}
            `);

    // Add change event to the radio buttons
    radioContainer.selectAll('input')
        .on('change', function () {
            const selectedYear = +this.value;
            updateVisualization(selectedYear, data);
        });

    // Select the first year and update the visualization
    d3.select(`input[value="${years[0]}"]`).property('checked', true);
    updateVisualization(years[0], data);
}


function updateVisualization(selectedYear, data) {
    const yearData = data.filter(d => d.year === selectedYear);
    const globalMaxCount = d3.max(yearData, d => d.count);

    const letterGroups = d3.group(yearData, d => d.name[0]);
    const sortedLetters = Array.from(letterGroups.keys()).sort();

    d3.select('#visualization').remove();

    const container = d3.select('body')
        .append('div')
        .attr('id', 'visualization')
        .style('padding-left', '100px');

    const smallWidth = 200;
    const smallHeight = 200;
    const radius = 50;

    let selectedChart = null; // Track the selected chart

    // Handle clicks outside the charts
    d3.select('body').on('click', function (event) {
        const isClickInsideChart = container.node().contains(event.target);
        if (!isClickInsideChart && selectedChart) {
            // Deselect the current chart
            d3.select(selectedChart)
                .transition()
                .duration(300)
                .attr('width', smallWidth)
                .attr('height', smallHeight);
            d3.select(selectedChart).select('g')
                .transition()
                .duration(300)
                .attr('transform', `translate(${smallWidth / 2}, ${smallHeight / 2}) scale(1)`);

            selectedChart = null; // Reset selection
        }
    });

    sortedLetters.forEach((letter, index) => {
        const letterData = letterGroups.get(letter);
        const sortedLetterData = letterData.sort((a, b) => d3.ascending(a.count, b.count));
        const genderData = d3.group(sortedLetterData, d => d.gender);

        const femaleData = genderData.get('FEMALE') || [];
        const maleData = genderData.get('MALE') || [];

        const svg = container.append('svg')
            .attr('width', smallWidth)
            .attr('height', smallHeight)
            .style('margin', '5px')
            .style('transition', 'all 0.3s ease')
            .on('click', function (event) {
                // Prevent click from propagating to the body
                event.stopPropagation();

                if (selectedChart && selectedChart !== this) {
                    // Reset previously selected chart
                    d3.select(selectedChart)
                        .transition()
                        .duration(300)
                        .attr('width', smallWidth)
                        .attr('height', smallHeight);
                    d3.select(selectedChart).select('g')
                        .transition()
                        .duration(300)
                        .attr('transform', `translate(${smallWidth / 2}, ${smallHeight / 2}) scale(1)`);
                }

                // Select the current chart
                selectedChart = this;
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('width', smallWidth * 2)
                    .attr('height', smallHeight * 2);
                d3.select(this).select('g')
                    .transition()
                    .duration(300)
                    .attr('transform', `translate(${smallWidth}, ${smallHeight}) scale(2)`);
            });

        const chartGroup = svg.append('g')
            .attr('transform', `translate(${smallWidth / 2}, ${smallHeight / 2})`);

        svg.append('text')
            .attr('class', 'firstLetter')
            .attr('x', smallWidth / 2)
            .attr('y', smallHeight / 2 + 6)
            .attr('text-anchor', 'middle')
            .text(letter)
            .style("fill", "white")
            .style('font-family', 'American Typewriter, serif')
            .style('font-size', '26px');

        const combinedData = [...femaleData.map(d => ({ ...d, gender: 'FEMALE' })), 
            ...maleData.map(d => ({ ...d, gender: 'MALE' }))];

        const angleScale = d3.scaleBand()
            .domain(d3.range(combinedData.length))
            .range([0, 2 * Math.PI]);

        const countScale = d3.scaleLinear()
            .domain([0, globalMaxCount])
            .range([radius, radius + 50]);

        const colorScale = d3.scaleOrdinal()
            .domain(['FEMALE', 'MALE'])
            .range(['pink', '#00AEE4']);

        const arc = d3.arc()
            .innerRadius(radius)
            .outerRadius(d => countScale(d.count))
            .startAngle((d, i) => angleScale(i))
            .endAngle((d, i) => angleScale(i) + angleScale.bandwidth())
            .padAngle(0.01)
            .cornerRadius(4);

        chartGroup.selectAll('path')
            .data(combinedData)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => colorScale(d.gender))
            .attr('stroke', 'none')
            .on('mouseover', function (e, d) {
                // Highlight the hovered bar
                d3.select(this)
                    .style("stroke", "#FBB03B")
                    .style("opacity", 1);

                // Display hover bar
                chartGroup.append('rect')
                    .attr('class', 'rect')
                    .attr('x', -40)
                    .attr('y', -30)
                    .attr('width', 80)
                    .attr('height', 60)
                    .attr('fill', 'rgb(0, 0, 46)')
                    .attr('rx', 5)
                    .attr('ry', 5);

                chartGroup.append('text')
                    .attr('class', 'hover-text name')
                    .attr('x', 0)
                    .attr('y', -10)
                    .attr('text-anchor', 'middle')
                    .text(d.name)
                    .attr('fill', 'white')
                    .style('font-family', 'Avenir Light');

                chartGroup.append('text')
                    .attr('class', 'hover-text count')
                    .attr('x', 0)
                    .attr('y', 10)
                    .attr('text-anchor', 'middle')
                    .text(`${d.count} babies`)
                    .attr('fill', 'white')
                    .style('font-family', 'Avenir Light');
            })
            .on('mouseout', function () {
                // Remove hover bar
                chartGroup.selectAll('.hover-text').remove();
                chartGroup.selectAll('.rect').remove();
                d3.select(this).style("stroke", "none");
            });
    });
}






