function line_plot(column_name) {


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 300 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

// append the svg object to the body of the page
d3.selectAll("#"+column_name+" svg").remove()
var svg = d3.select("#"+column_name)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

console.log(" lineplot  country name : ",country_name)
//Read the data
fetch('/linePlot/'+country_name+'/'+column_name)
.then(function(response){
  return response.json()
}).then(function(data){

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([d3.min(data, function(d){return +d[column_name]}), d3.max(data, function(d){return +d[column_name]})])
      .range([ 0, width ]);
    xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("id", "xaxis_"+column_name)
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.frequency; })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .attr("id", "yaxis_"+column_name)
      .call(d3.axisLeft(y).ticks(4));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    var line = svg.append('g')
      .attr("clip-path", "url(#clip)")

    // Add the line
    line.append("path")
      .datum(data)
      .attr("class", "line "+column_name)  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function(d) { return x(d[column_name]) })
        .y(function(d) { return y(d.frequency) })
        )

    // Add the brushing
    line
      .append("g")
        .attr("class", "brush")
        .call(brush);

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        // console.log("X range start : ",x.invert(extent[0]));
        // console.log("X range start : ",x.invert(extent[1]));

        if(column_name=='Age'){
            age_start = x.invert(parseInt(extent[0]))
            age_end   = parseInt(x.invert(extent[1]))}
        if(column_name=='Value'){
            value_start = x.invert(parseInt(extent[0]))
            value_end   = parseInt(x.invert(extent[1]))}
        if(column_name=='Overall'){
            rating_start = x.invert(parseInt(extent[0]))
            rating_end   = parseInt(x.invert(extent[1]))}
        wc();
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      d3.select('#xaxis_'+column_name).transition().duration(1000).call(d3.axisBottom(x))
      line
          .select('.'+column_name)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d[column_name]) })
            .y(function(d) { return y(d.frequency) })
          )
    }
    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text(column_name);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text('Frequency'); 
    // If user double click, reinitialize the chart
    svg.on("dblclick",function(){
      x.domain(d3.extent(data, function(d) { return d[column_name]; }))

      if(column_name=='Age'){
            age_start = 10;
            age_end   = 50;}
      if(column_name=='Value'){
            value_start = 0
            value_end   = 210500000}
      if(column_name=='Overall'){
            rating_start = 0
            rating_end   = 200}

      wc();
      d3.select('#xaxis_'+column_name).transition().call(d3.axisBottom(x))
      line
        .select('.'+column_name)
        .transition()
        .attr("d", d3.line()
          .x(function(d) { return x(d[column_name]) })
          .y(function(d) { return y(d.frequency) })
      )
    });

});

};