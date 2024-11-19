let svg
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight, radius, max_pop, max_nMovies, max_nAwards;
let babies

window.onload = function () {
    //general graph attr

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
        }
    }).then(smallMultiples);
}

function smallMultiples(data) {
    //grouped by Year and subgroup gender
    let yearGender = d3.groups(data, d => d.year, d => d.gender)
    
    //grouped by first letter
    let yearName = d3.groups(data, d => d.name[0])

    // Print the grouped data to check
    console.log(yearGender,yearName);


}