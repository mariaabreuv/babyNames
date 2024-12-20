let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let babies;

window.onload = function () {
    const head = document.head;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Avenir+Light&family=American+Typewriter&display=swap';
    head.appendChild(link);
    document.body.style.fontFamily = "Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif";

    canvasHeight = 780;
    canvasWidth = 1080;
    padding = 60;
    graphHeight = canvasHeight - padding * 2 -10;
    graphWidth = canvasWidth - padding * 2 - 10;

    babies = 'datasets/top10babies.csv';

    //Select svg inside section
    svg = d3.select('.top10 svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    //load CSV
    d3.csv(babies, b => ({
        year: +b.Year_of_Birth,
        gender: b.Gender,
        name: b.Name,
        rank: +b.Rank,
        count: +b.Baby_Count,
        total: +b.Total,
        percentage: +b.Percentage
    })).then(top10);
};

function top10(data) {
    //FIlter top 10 names ordering by year
    let top10Names = data
        .filter(d => d.rank <= 10)
        .sort((a, b) => d3.ascending(a.year, b.year));

    //Create scales
    let xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, graphWidth]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([graphHeight, padding]);

    //Create axis
    let xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    let yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", "white")
        .style("font-family", "Avenir Light");

    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis)
        .selectAll("text")
        .style("fill", "white")
        .style("font-family", "Avenir Light");

    svg.selectAll(".domain")
        .style("stroke", "white");

    //Create grid
    svg.append('g')
        .selectAll('line.horizontal')
        .data(yScale.ticks(10))  
        .enter().append('line')
        .attr('class', 'horizontal')
        .attr('x1', padding)
        .attr('x2', graphWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.2); 

    //Add subtitles x axis
    svg.append('text')
        .attr('x', canvasWidth / 2)
        .attr('y', canvasHeight - 80)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-family', 'Avenir Light')
        .style('font-size', '14px')
        .text('Year of birth');

    svg.append('g')
        .selectAll('line.vertical')
        .data(xScale.ticks(10))
        .enter().append('line')
        .attr('class', 'vertical')
        .attr('y1', padding)
        .attr('y2', graphHeight)
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.2);

    //Add subtitles y axis
    svg.append('text')
        .attr('x', -canvasHeight / 2)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-family', 'Avenir Light')
        .style('font-size', '14px')
        .attr('transform', 'rotate(-90)')
        .text('Number of babys');

    //Color scale
    let colorScale = d3.scaleOrdinal()
        .domain(['Female', 'Male'])
        .range(['pink', ' #00AEE4']);

    let groupedByName = d3.groups(top10Names, d => d.name);

    let linesGroup = svg.append('g').attr('class', 'lines-group');

    //Draw lines
    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count));

    let allLines = [];

    //Add line and label
    groupedByName.forEach(([name, nameData]) => {
        let lineElement = linesGroup.append('path')
            .datum(nameData)
            .attr('fill', 'none')
            .attr('stroke', colorScale(nameData[0].gender))
            .attr('stroke-width', 3)
            .attr('d', line)
            .attr('class', nameData[0].gender)
            .on('mouseover', function () {
                // Destacar a linha
                d3.select(this).raise().attr('stroke', '#FBB03B').attr('stroke-width', 6);
            
                let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);
                let label = d3.select(`#label-${maxPoint.name}`);
            
                
                label.raise()
                    .attr('fill', 'rgb(0, 0, 46)')  
                    .style('font-size', '20px')  
                    .style('stroke', '#FBB03B') 
                    .style('stroke-width', '1.8') 
                    .style('stroke-linejoin', 'round')  
                    .style('text-shadow', '0 0 5px rgb(0, 0, 46), 0 0 10px rgb(0, 0, 46)');  
            })
            .on('mouseout', function () {
               
                d3.select(this).lower().attr('stroke', colorScale(nameData[0].gender)).attr('stroke-width', 3);
               
                let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);
                let label = d3.select(`#label-${maxPoint.name}`);
               
                label.lower()
                    .attr('fill', colorScale(nameData[0].gender))  
                    .style('font-size', '16px')  
                    .style('stroke', 'none') 
                    .style('stroke-width', '0')  
                    .style('text-shadow', 'none');  
            });
            

        allLines.push({ name, lineElement, gender: nameData[0].gender, nameData });

        //Find max point
        let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);

        //label on max name count
        let label = svg.append('text')
            .attr('x', xScale(maxPoint.year) + 10)
            .attr('y', yScale(maxPoint.count) - 10)
            .text(name)
            .style('font-size', '16px')
            .attr('fill', colorScale(maxPoint.gender))
            .attr('alignment-baseline', 'middle')
            .attr('id', `label-${maxPoint.name}`)
            .style('font-family', 'American Typewriter');

        allLines[allLines.length - 1].label = label;
    });

    let controls = d3.select('.top10')
        .insert('div', 'svg')
        .attr('class', 'controls')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('margin-bottom', '-20px');

  // Girls checkbox
controls.append('label')
.style('color', 'white')
.style('display', 'flex')
.style('align-items', 'center')  
.style('font-family', 'American Typewriter')
.style('cursor', 'pointer')
.style('margin-right', '15px')
.html(`
    <input type="checkbox" checked style="
        width: 30px;  
        height: 30px; 
        background-color: pink; 
        border: 2px solid white; 
        border-radius: 8%;
        margin-right: 10px; 
        appearance: none; 
        display: block; 
        cursor: pointer; 
    ">
    Girls`)

.on('change', function () {
    const checkbox = d3.select(this).select('input').node();
    toggleLines('Female', checkbox.checked);
});

// Boys checkbox
controls.append('label')
.style('color', 'white')
.style('display', 'flex')
.style('align-items', 'center') 
.style('font-family', 'American Typewriter')
.style('cursor', 'pointer')
.html(`
    <input type="checkbox" checked style="
        width: 30px;  
        height: 30px; 
        background-color: #00AEE4; 
        border: 2px solid white;
        border-radius: 8%;
        margin-right: 10px; 
        appearance: none; 
        display: block; 
        cursor: pointer; 
    ">
    Boys
`)
.on('change', function () {
    const checkbox = d3.select(this).select('input').node();
    toggleLines('Male', checkbox.checked);
});


    //Show or hide the lines
    function toggleLines(gender, isChecked) {
        allLines.forEach(({ lineElement, label, gender: lineGender }) => {
            if (lineGender === gender) {
                lineElement.style('display', isChecked ? 'block' : 'none');
                label.style('display', isChecked ? 'block' : 'none');
            }
        });
    }
}

