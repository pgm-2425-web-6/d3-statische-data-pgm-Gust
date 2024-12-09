import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.json(
    "https://api.open-meteo.com/v1/forecast?latitude=51.05&longitude=3.72&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Brussels"
).then((data) => {
    const dailyData = data.daily.temperature_2m_max.map((maxTemp, index) => ({
        date: data.daily.time[index],
        maxTemp,
        minTemp: data.daily.temperature_2m_min[index],
    }));

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3
        .scaleBand()
        .domain(dailyData.map((d) => d.date))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const yScale = d3
        .scaleLinear()
        .domain([
            0,
            d3.max(dailyData, (d) => Math.max(d.maxTemp, d.minTemp)),
        ])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.selectAll(".bar")
        .data(dailyData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.date))
        .attr("y", height - margin.bottom)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d.maxTemp))
        .attr("height", (d) => height - margin.bottom - yScale(d.maxTemp));

    svg.selectAll(".circle")
        .data(dailyData)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", (d) => xScale(d.date) + xScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.minTemp))
        .attr("r", 6)
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`)
                .style("display", "block")
                .html(
                    `<strong>${d.date}</strong><br>Max Temp: ${d.maxTemp}°C<br>Min Temp: ${d.minTemp}°C`
                );
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });
});
