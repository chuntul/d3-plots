// makes HORIZONTAL bar plot
function makeBarPlot(names, nums, cell_line, plotId, variableEnding, title, xAxisLabel, datasetName) {
//positions and dimensions
var margin = {
    top: 100,
    right: 600,
    bottom: -80,
    left: 200
};

var width = 500;
var height = 500;
var color = d3.scale.category10();

// zip and sort
zip(nums, names)

names.unshift(" ")
nums.unshift(0)

updateDimensions(window.innerWidth, margin);

//calculating max for data
var maxNum = Math.max.apply(null, nums)

//set range for data by domain, and scale by range
var xrange = d3.scale.linear()
    .domain([0, maxNum])
    .range([0, width]);

var yrange = d3.scale.linear()
    .domain([0, names.length])
    .range([0, height]);

//set d3 format: ticks are 500m for 0.5 when setting to s (for 100k), so this helps
var format = "";
if (maxNum >= 1000) {
    format = "s"
}

//set axes for graph
var xAxis = d3.svg.axis()
    .scale(xrange)
    .orient("bottom")
    .tickPadding(2)
    .tickFormat(d3.format(format));

var yAxis = d3.svg.axis()
    .scale(yrange)
    .orient("left")
    .tickSize(5)
        .tickFormat(function(d,i){ return names[i] })
        .tickValues(d3.range(names.length));

// Add the svg canvas
var svg = d3.select("#" + plotId)
    .append("svg")
        .attr("fill", "white")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .attr("id", "barPlot" + plotId)
    .append("g")
        .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
    .attr("fill", "white");

// graph title
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("fill","black")
    .attr("dy", 0)
    .style("font-size", "23px")
    .attr("transform", "translate("+ (width/2.2) +","+ -50 +")")
    .text(function(d) {
    if (title == "") {
        return "Number of " + xAxisLabel + " tested with " + cell_line.replaceAll("_", " ") + " " + variableEnding;
    } else {
        return title;
    }
    })
    .call(wrap, width)

// Add the X Axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," +  height + ")")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .call(xAxis);

d3.selectAll(".tick")
    .select("text")
    .attr("fill", "black")
    .attr("stroke", "none")

// X axis label
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("fill","black")
    .attr("transform", "translate("+ (width/2) +","+(height+50)+")")
    .text("# " + xAxisLabel);

// Add the Y Axis
svg.append("g")
    .attr("class", "y axis")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .call(yAxis)
    .selectAll("text")
    .attr("fill", "#207cc1")
    .attr("stroke", "none")
    .on("click", function(i){
            document.location.href = "/search?q=" + names[i]
        })
        .on({
        "mouseover": function(d) {
            d3.select(this).transition().duration(400).style("opacity", 0.5);
            d3.select(this).style("cursor", "pointer");
        },
        "mouseout": function(d) {
            d3.select(this).transition().duration(400).style("opacity", 1);
            d3.select(this).style("cursor", "default");
        }
        });

//for resizing: KEEP this or plot will break :( yes i was lazy
d3.selectAll("#barPlot" + plotId)
.attr( 'preserveAspectRatio',"xMinYMin meet")
.attr("viewBox", "80 0 700 500")
.attr('width', '500')

//adding chart group
var chart = svg.append('g')
        .attr("transform", "translate(1,0)")
        .attr('id','chart')

// adding each bar
chart.selectAll('.bar')
        .data(nums)
        .enter()
    .append("a")
        .attr("xlink:href", function(d,i) {
        return "/search?q=" + names[i]
        })
    .append('rect')
        .attr("class", "bar")
        .attr('height', 40)
            .attr({'x':-1,'y':function(d,i){ return yrange(i)-20; }})
            .style('fill', function(d, i) {
        if (datasetName != "" && names[i] == datasetName) {
            return "#c4632f"; // orangey for highlighting
        }
        else {
            return "#2d5faf"; // blue
        }
        })
            .attr('width',function(d){ return xrange(d); })
        .on({
        "mouseover": function(d,i) {
            d3.select(this).transition()
            .duration(300).style("opacity", 0.6);
            d3.select("#" + names[i] + plotId+ "num").transition()
            .duration(300).style("opacity", 1);
            d3.select(this).style("cursor", "pointer");
        },
        "mouseout": function(d,i) {
            d3.select(this).transition()
            .duration(300).style("opacity", 1);
            d3.select("#" + names[i] + plotId + "num").transition()
            .duration(300).style("opacity", 0);
            d3.select(this).style("cursor", "default");
        }
        })

// for some reason i can't append text onto the end of the bars
// and so i must do it here
for (var i = 1; i < nums.length; i++) {
    svg.append("text")
    .attr({'x': xrange(nums[i]) + 5, 'y': yrange(i)+5})
    .attr("id", names[i] + plotId + "num")
    .style("text-anchor", "start")
    .style("font-size", "16px")
    .attr("fill", "black")
    .style("opacity", 0)
    .text(nums[i])
    }

    d3.select("#" + plotId).append("button")
        .attr("type","button")
        .attr("id", "button" + plotId)
        .attr("class", "downloadButton")
        .text("Download SVG")
        .on("click", function() {
            // download the svg
            if (cell_line != "") {
            downloadSVG(plotId, cell_line);
            }
            else {
            downloadSVG(plotId, xAxisLabel)
            }
        })
        .style("margin-right", function() {
            if (plotId == "pmdb-gdrug-plot") {
            return "100px"
            }
        })
        .style("margin-left", function() {
        if (plotId == "pmdb-gdrug-plot") {
            return "400px"
        }
    });

}