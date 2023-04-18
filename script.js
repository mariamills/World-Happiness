let data = [];
const filterBtn = document.getElementById('filter');
const countryCheckboxes = document.getElementById('country-checkboxes');
const resetBtn = document.getElementById('reset');

filterBtn.addEventListener('click', function () {
  countryCheckboxes.classList.toggle('hidden');
});

resetBtn.addEventListener('click', function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
    updateChart();
  });
});

const xScale = d3.scaleLinear().range([50, 405]).domain([0, 12]);
const yScale = d3.scaleLinear().range([550, 50]);
const sizeScale = d3.scaleLinear().range([10, 50]);

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', '100%')
  .attr('height', '100%');

// Define axes
const xAxis = d3.axisBottom(xScale).ticks(5);
const yAxis = d3.axisLeft(yScale).ticks(5);

// Add axes to the chart
svg
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0, 550)')
  .call(xAxis);
svg
  .append('g')
  .attr('class', 'y-axis')
  .attr('transform', 'translate(50, 0)')
  .call(yAxis);

// Add axis labels
svg
  .append('text')
  .attr('class', 'axis-label')
  .attr('x', 200)
  .attr('y', 600)
  .text('GDP per Capita');
svg
  .append('text')
  .attr('class', 'axis-label')
  .attr('x', 20)
  .attr('y', 400)
  .attr('transform', 'rotate(-90, 20, 400)')
  .text('Social Support');

function createCountryCheckboxes(data) {
  // Sort the data alphabetically by country name
  data.sort((a, b) => a['Country name'].localeCompare(b['Country name']));
  // Create a checkbox for each country in the data set and add it to the page in the #country-checkboxes div container
  const checkboxesContainer = d3.select('#country-checkboxes');
  data.forEach((d) => {
    const container = checkboxesContainer
      .append('div')
      .attr('class', 'country-checkbox');
    container
      .append('input')
      .attr('type', 'checkbox')
      .attr('id', d['Country name'])
      .attr('class', 'checkbox')
      .on('change', updateChart);
    container
      .append('label')
      .attr('for', d['Country name'])
      .text(d['Country name']);
  });
}

function updateChart() {
  const selectedCountries = [];
  d3.selectAll('#country-checkboxes input:checked').each(function () {
    selectedCountries.push(this.id);
  });

  let filteredData = data;

  if (selectedCountries.length > 0) {
    filteredData = data.filter((d) =>
      selectedCountries.includes(d['Country name'])
    );
  }

  const emojis = svg
    .selectAll('text.emoji')
    .data(filteredData, (d) => d['Country name']);
  emojis
    .join('text')
    .attr('class', 'emoji')
    .attr('x', (d) => xScale(d['Logged GDP per capita']))
    .attr('y', (d) => yScale(d['Social support']))
    .style('font-size', '25px')
    .text((d) => (d['Ladder score'] >= 5 ? '😀' : '☹️'))
    .attr('cursor', 'pointer')
    .on('mouseover', (event, d) => {
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('padding', '5px')
        .style('background-color', 'rgba(0, 0, 0, 0.7)')
        .style('color', 'white')
        .style('border-radius', '5px')
        .style('pointer-events', 'none');
      tooltip
        .html(
          `
          <h4>${d['Country name']}</h4>
          <p>Happiness Score: ${d['Ladder score']}</p>
          <p>GDP per Capita: ${d['Logged GDP per capita']}</p>
          <p>Social Support: ${d['Social support']}</p>
          `
        )
        .style('left', event.pageX - 10 + 'px')
        .style('top', event.pageY - 10 + 'px');
    })
    .on('mouseout', () => {
      d3.selectAll('.tooltip').remove();
    });
}

//Process csv file
d3.csv('happiness_data_2023.csv').then(function (loadedData) {
  data = loadedData;
  createCountryCheckboxes(data);
  updateChart();
});
