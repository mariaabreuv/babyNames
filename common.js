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

    babies = './top10babies.csv'
    //create a tootil, for data information

    //new svg element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    d3.csv(babies, b => {
        return {
            year: +b.Year_of_Birth, //make this  a number
            gender: b.Gender,
            name: b.Name,
            rank: b.Rank,
            count: b.Baby_Count,
            total: b.Total,
            Percentage: b.Percentage,
        }
    }).then(smallMultiples);
}

function smallMultiples(data) {
    //grouped by Year and subgroup gender
    let yearGender = d3.groups(data, d => d.year, d => d.gender)
    
    //grouped by first letter
    let yearName = d3.groups(data, d => d.name[0])

    // Print the grouped data to check
    //console.log(yearGender,yearName);




}