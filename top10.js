let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let babies;

window.onload = function () {
    const head = document.head;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Avenir+Light&family=American+Typewriter&display=swap';
    head.appendChild(link);

    // Dimensões 
    canvasHeight = 780;
    canvasWidth = 1080;
    padding = 60;
    graphHeight = canvasHeight - padding * 2;
    graphWidth = canvasWidth - padding * 2;

    babies = './top10babies.csv'; 

    // Selecionar o SVG dentro da section com classe 'top10'
    svg = d3.select('.top10 svg') 
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    // Carregar o CSV
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
    // Filtra os 10 nomes principais e organiza por ano
    let top10Names = data
        .filter(d => d.rank <= 10)
        .sort((a, b) => d3.ascending(a.year, b.year));

    // Criar escalas
    let xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, graphWidth]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([graphHeight, padding]);

    // Criar eixo
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

    // Criar a grelha
    svg.append('g')
        .selectAll('line.horizontal')
        .data(yScale.ticks(10))  // Divide o eixo Y em 10 partes
        .enter().append('line')
        .attr('class', 'horizontal')
        .attr('x1', padding)
        .attr('x2', graphWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.2);  // Transparência das linhas horizontais

    // Adicionar legenda do eixo X
    svg.append('text')
    .attr('x', canvasWidth / 2)
    .attr('y', canvasHeight - 40)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .style('font-family', 'Avenir Light')
    .style('font-size', '14px')
    .text('Year of birth');

    svg.append('g')
        .selectAll('line.vertical')
        .data(xScale.ticks(10))  // Divide o eixo X em 10 partes
        .enter().append('line')
        .attr('class', 'vertical')
        .attr('y1', padding)
        .attr('y2', graphHeight)
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.2);  // Transparência das linhas verticais

        // Adicionar legenda do eixo Y
        svg.append('text')
        .attr('x', -canvasHeight / 2)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-family', 'Avenir Light')
        .style('font-size', '14px')
        .attr('transform', 'rotate(-90)')
        .text('Number of babys');

    // Escala de cor
    let colorScale = d3.scaleOrdinal()
        .domain(['Female', 'Male'])
        .range(['#FFA1DD', '#00AEE4']); 

    let groupedByName = d3.groups(top10Names, d => d.name);

    let linesGroup = svg.append('g').attr('class', 'lines-group');

    // Linhas para cada nome
    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count));

    let allLines = [];

    // Adiciona linha e rótulo para cada nome
    groupedByName.forEach(([name, nameData]) => {
        let lineElement = linesGroup.append('path')
            .datum(nameData)
            .attr('fill', 'none')
            .attr('stroke', colorScale(nameData[0].gender)) // Cor por gênero
            .attr('stroke-width', 3)
            .attr('d', line)
            .attr('class', nameData[0].gender)
            .on('mouseover', function () {
                // Sobressair a linha
                d3.select(this).raise().attr('stroke', '#FBB03B').attr('stroke-width', 6);

                // Sobressair o nome
                let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);
                d3.select(`#label-${maxPoint.name}`).raise().attr('fill', '#FBB03B').style('font-size', '20px');
            })
            .on('mouseout', function () {
                // Restaurar a linha
                d3.select(this).lower().attr('stroke', colorScale(nameData[0].gender)).attr('stroke-width', 3);

                // Restaurar o nome
                let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);
                d3.select(`#label-${maxPoint.name}`).lower().attr('fill', colorScale(nameData[0].gender)).style('font-size', '16px');
            });

        allLines.push({ name, lineElement, gender: nameData[0].gender, nameData });

        // Encontrar o ponto de maior contagem
        let maxPoint = nameData.reduce((max, d) => (d.count > max.count ? d : max), nameData[0]);

        // Criar rótulo no ponto de maior contagem
        let label = svg.append('text')
            .attr('x', xScale(maxPoint.year) + 10) // Ligeiramente à direita do pico
            .attr('y', yScale(maxPoint.count) - 10) // Ligeiramente acima do pico
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
        

    // Caixa para "Girls"
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
                background-color: #FFA1DD; 
                border: 2px solid #FFA1DD; 
                border-radius: 5%; 
                appearance: none; 
                outline: none; 
                margin-right: 10px;">
            Girls
        `)
        .on('change', function () {
            const checkbox = d3.select(this).select('input').node();
            toggleLines('Female', checkbox.checked);
        });

    // Caixa para "Boys"
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
                border: 2px solid #00AEE4; 
                border-radius: 5%; 
                appearance: none; 
                outline: none; 
                margin-right: 10px;">
            Boys
        `)
        .on('change', function () {
            const checkbox = d3.select(this).select('input').node();
            toggleLines('Male', checkbox.checked);
        });

    // Função para mostrar ou esconder as linhas e os nomes
    function toggleLines(gender, isChecked) {
        allLines.forEach(({ lineElement, label, gender: lineGender }) => {
            if (lineGender === gender) {
                lineElement.style('display', isChecked ? 'block' : 'none');
                label.style('display', isChecked ? 'block' : 'none');
            }
        });
    }
}

