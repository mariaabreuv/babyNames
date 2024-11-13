let svg
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight, radius, max_pop, max_nMovies, max_nAwards;
let babies

window.onload = function () {
    //general graph attr

    babies = './MostPopularBaby_Names(NewYork).csv'
    //create a tootil, for data information

    //new svg element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    d3.csv(babies, b => {
        return {
            year: +b.bith_year, //make this  a number
            gender: b.gender,
            ethnicity: b.ethnicity,
            name: b.name
        }
    }).then(smallMultiples);
}

function smallMultiples(data) {
    /*group by ethnicity
    let data_ethinic = d3.group(data,b=>b.ethnicity);
    radius = 160;
    let my_data = [];
    console.log(data_ethinic); */
    // Group names by the first letter
    let dataByLetter = d3.groups(data, d => d.name[0]);

    // Print the grouped data to check
    console.log(dataByLetter);


}