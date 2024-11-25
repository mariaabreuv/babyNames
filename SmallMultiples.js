window.onload = function () {
    const canvasWidth = 1080;
    const canvasHeight = 1080;
    const padding = 30;

    const filePath = './NameCounts.csv'; // Path to your data file

    // Load the CSV data
    d3.csv(filePath, d => ({
        name: d.Name,
        count: +d.TotalCount,
        gender: d.Gender,
        year: +d.Year_of_Birth,
    })).then(data => {
        const years = Array.from(new Set(data.map(d => d.year))).sort();
        setupDropdown(years, data);
    });
};

function setupDropdown(years, data) {
    // Create a dropdown for year selection
    const dropdown = d3.select('body')
        .append('select')
        .on('change', function () {
            const selectedYear = +this.value;
            updateVisualization(selectedYear, data);
        });

    dropdown.selectAll('option')
        .data(years)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

    // Initialize with the first year
    updateVisualization(years[0], data);
}

function updateVisualization(selectedYear, data) {
    // Filter data for the selected year
    const yearData = data.filter(d => d.year === selectedYear);

    // Group data by the first letter of the name
    const letterGroups = d3.group(yearData, d => d.name[0]);

    const sortedLetters = Array.from(letterGroups.keys()).sort();


    // Clear previous visualization
    d3.select('#visualization').remove();

    // Create a container for small multiples
    const container = d3.select('body')
        .append('div')
        .attr('id', 'visualization');

    const smallWidth = 150;
    const smallHeight = 150;
    const radius = 50;

    // Create a circular bar chart for each letter
    sortedLetters.forEach((letter, index) => {
        const letterData = letterGroups.get(letter);

        const sortedLetterData = letterData.sort((a, b) => d3.ascending(a.name, b.name));


        // Create a new SVG for each letter
        const svg = container.append('svg')
            .attr('width', smallWidth)
            .attr('height', smallHeight)
            .style('margin', '10px');

        // Add a title to each chart
        svg.append('text')
        .attr('x', smallWidth / 2)
        .attr('y', smallHeight / 2)
        .attr('text-anchor', 'middle')
        .text(letter);
        

        // Calculate angles for radial bars
        const angleScale = d3.scaleLinear()
            .domain([0, letterData.length])
            .range([0, 2 * Math.PI]);

        const countScale = d3.scaleLinear()
            .domain([0, d3.max(sortedLetterData, d => d.count)])
            .range([0, radius]);

        // Add bars for each name
        sortedLetterData.forEach((d, i) => {
            const angle = angleScale(i);
            const barLength = countScale(d.count); // Length of the bar based on count
            const innerRadius = radius;           // Base circle radius
            const outerRadius = radius + barLength; // Extends outward by bar length
        
            // Inner point (base of the bar on the circle's circumference)
            const x1 = smallWidth / 2 + innerRadius * Math.cos(angle);
            const y1 = smallHeight / 2 + innerRadius * Math.sin(angle);
        
            // Outer point (end of the bar)
            const x2 = smallWidth / 2 + outerRadius * Math.cos(angle);
            const y2 = smallHeight / 2 + outerRadius * Math.sin(angle);
        
            // Append the bar
            svg.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .on('mouseover', (hover) => console.log(hover));
        });
    })        
}
