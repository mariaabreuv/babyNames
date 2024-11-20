let svg
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight, radius, max_pop, max_nMovies, max_nAwards;
let babies

window.onload = function () {
    //general graph attr
    canvasHeight = 980;
    canvasWidth = 1080;
    padding = 60;
    graphHeight = canvasHeight - padding * 2;
    graphWidth = canvasWidth - padding * 2;

    babies = './NameCounts.csv'
    //create a tootil, for data information

    //new svg element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    d3.csv(babies, b => {
        return {
            
        }
    }).then(smallMultiples);
}

function smallMultiples(data) {
    
}