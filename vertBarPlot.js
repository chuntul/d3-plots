

function wrap(text, width) {
text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
    line.push(word);
    tspan.text(line.join(" "));
    if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
    }
    }
});
}

String.prototype.replaceAll = String.prototype.replaceAll || function(s, r) {
return this.replace(new RegExp(s, 'g'), r);
};

function zip(a, b) {
var zipped = [];
// zip
for (var i=0; i<a.length; i++) {
    zipped.push({a: a[i], b: b[i] });
}
zipped.sort(function (x, y){
    return x.a - y.a;
});
// unzip
    var z;
    for (i=0; i<zipped.length; i++) {
    z = zipped[i];
    a[i] = z.a;
    b[i] = z.b;
    }
}



// make a vertical bar plot
function makeVertBarPlot(names, nums, plotId, title) {
    //positions and dimensions
    var margin = {
        top: 100,
        right: 200,
        bottom: -80,
        left: 200
    };
    var width = 700;
    var height = 400;
    var color = d3.scale.category10();
    names.unshift(" ")
    nums.unshift(0)

    updateDimensions(window.innerWidth, margin);

    //calculating max for data
    var maxNum = Math.max.apply(null, nums)

    //set range for data by domain, and scale by range
    var xrange = d3.scale.linear()
        .domain([0, names.length])
        .range([0, width]);

    var yrange = d3.scale.linear()
        .domain([0, maxNum])
        .range([height, 0]);

    //set axes for graph
    var xAxis = d3.svg.axis()
        .scale(xrange)
        .orient("bottom")
        .tickPadding(2)
        .tickFormat(function(d,i){ return names[i] })
            .tickValues(d3.range(names.length));

    var yAxis = d3.svg.axis()
        .scale(yrange)
        .orient("left")
        .tickSize(5)
        .tickFormat(d3.format("s"));


    // Add the svg canvas
    var svg = d3.select("#" + plotId)
        .append("svg")
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
        .text(title)
        .call(wrap, width)

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .call(yAxis)

        svg.selectAll(".tick")
            .select("text")
            .attr("fill", "black")
            .attr("stroke", "none")

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," +  height + ")")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .call(xAxis)
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


    //for resizing
    d3.selectAll("#barPlot" + plotId)
    .attr( 'preserveAspectRatio',"xMinYMin meet")
    .attr("viewBox", "80 0 900 500")
    .attr('width', '700')

    //adding chart group
    var chart = svg.append('g')
            .attr("transform", "translate(0,0)")
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
            .attr('width', 60)
                .attr({
            'x':function(d,i){ return xrange(i) - 30}, // each i is the number of the dataset
            'y':function(d){ return yrange(d)} // each d is the actual number of drugs (the num)
            })
                .style('fill',"#2d5faf") // blue
                .attr('height',function(d){ return height - yrange(d);})
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
        .attr({'x': xrange(i), 'y': yrange(nums[i])-10})
        .attr("id", names[i] + plotId + "num")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", "black")
        .style("opacity", 0)
        .text(nums[i])
        }

        var arrTemp = title.split(" ");
        var descriptor = arrTemp[0] + "-" + arrTemp[1] + "-" + arrTemp[2]

        d3.select("#" + plotId).append("button")
            .attr("type","button")
            .attr("id", "button" + plotId)
            .attr("class", "downloadButton")
            .text("Download SVG")
            .on("click", function() {
                // download the svg
                downloadSVG(plotId, descriptor);
            });



}