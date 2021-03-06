function world_map() {


var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>No. of Players: </strong><span class='details'>" + format(d.frequency) +"</span>";
            })

var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 660 - margin.left - margin.right,
            height = 310 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([0,1,5,10,50,100,500,1000,1500,1700])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

var path = d3.geoPath();

var svg = d3.select("#world_map")
            .append("svg")
            .attr("width", width)
            .attr("style", "margin-left:-100px;margin-top:20px;")
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

var projection = d3.geoMercator()
                   .scale(70)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);

queue()
    .defer(d3.json, "../static/world_countries.json")
    .defer(d3.csv, "../static/nationality_counts.csv")
    .await(ready);

function ready(error, data, population) {
  var populationById = {};

  population.forEach(function(d) {
   populationById[d.id] = +d['frequency'];});
  data.features.forEach(function(d) { 
    if(populationById.hasOwnProperty(d.id))
    {
      d.frequency = populationById[d.id];
    }
    else
    {
      d.frequency = 0;
    }
  });

  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(data.features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { return color(populationById[d.id]); })
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
      .style("opacity",0.8)
      // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        })
        .on('click',function(d){
        country_name = d.properties.name
        pcp()
        line_plot('Age');
        line_plot('Value');
        line_plot('Overall');
        wc();
        club_logo();
        })
        .on('dblclick',function(d){
        country_name = "world"
        pcp()
        line_plot('Age');
        line_plot('Value');
        line_plot('Overall');
        wc();
        });

  svg.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
       // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);
}

};