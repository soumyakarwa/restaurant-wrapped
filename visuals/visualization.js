import * as Constants from "./constants.js";

const height = window.innerHeight;
const width = window.innerWidth;
const canvas = d3
  .select("canvas#globe")
  .attr("height", height)
  .attr("width", width);
const context = canvas.node().getContext("2d");
const scale = height / 2.5;
const centrePoint = [width / 2, height / 2];
const pins = [
  { name: "Kilchberg", coords: [8.54526, 47.322] },
  { name: "London", coords: [-0.1276, 51.5072] },
  { name: "Dubai", coords: [55.2708, 25.2048] },
  { name: "Miami", coords: [-80.1918, 25.7617] },
  // { name: "Woodstock", coords: [-72.5185, 43.6242] },
  { name: "New Delhi", coords: [77.2088, 28.6139] },
  { name: "Washington DC", coords: [-77.0369, 38.9072] },
  { name: "Hartford", coords: [-72.3697, 43.6637] },
  // { name: "Tysons", coords: [-77.2311, 38.9187] },
  // { name: "Windsor", coords: [-74.5814, 40.2421] },
  { name: "Elberta", coords: [-87.5978, 30.4144] },
  // { name: "Queens", coords: [-73.7949, 40.7282] },
  // { name: "Brooklyn", coords: [-73.9442, 40.7305] },
  { name: "New York", coords: [-74.006, 40.7128] },
];

const projection = d3.geoOrthographic().center([0, 0]).precision(0.1);
projection.scale(scale).translate(centrePoint);

export function createGlobe() {
  let path = d3.geoPath().projection(projection).context(context);

  const render = (sphere, land) => {
    // Clear the canvas
    context.clearRect(0, 0, width, height);

    // Render sphere
    context.beginPath();
    path(sphere);
    context.closePath();
    context.fillStyle = Constants.colors.green;
    context.strokeStyle = Constants.colors.green;
    context.lineWidth = 4;
    context.stroke();
    context.fill();

    // Render land
    context.beginPath();
    path(land);
    context.closePath();
    context.fillStyle = Constants.colors.beige;
    context.fill();

    // Render pins dynamically
    pins.forEach((pin, index) => {
      const [lon, lat] = pin.coords;
      const currentRotation = projection.rotate(); // Get current rotation of the globe
      const distance = d3.geoDistance(
        [lon, lat],
        [-currentRotation[0], -currentRotation[1]]
      );

      // Check if the pin is within 90° of the center of the visible hemisphere
      if (distance < Math.PI / 3) {
        const [x, y] = projection(pin.coords);
        drawLocationPin(
          context,
          x,
          y,
          30,
          Constants.colors.green,
          pin.name.toString()
        );
      }
    });
  };

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json").then(
    function (world) {
      const sphere = { type: "Sphere" };
      const land = topojson.feature(world, world.objects.land);

      render(sphere, land, path);

      const sensitivity = 150;
      d3.timer(function rotateGlobe() {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();
        projection.rotate([rotate[0] - 1 * k, rotate[1]]);
        render(sphere, land); // Re-render the globe, land, and pins
      }, 100);
    }
  );
}

export function zoomGlobeIn() {
  let path = d3.geoPath().projection(projection).context(context);

  const render = (sphere, land) => {
    // Clear the canvas
    context.clearRect(0, 0, width, height);

    // Render sphere
    context.beginPath();
    path(sphere);
    context.closePath();
    context.fillStyle = Constants.colors.green;
    context.strokeStyle = Constants.colors.green;
    context.lineWidth = 4;
    context.stroke();
    context.fill();

    // Render land
    context.beginPath();
    path(land);
    context.closePath();
    context.fillStyle = Constants.colors.beige;
    context.fill();

    // Render pins dynamically
    pins.forEach((pin) => {
      const [lon, lat] = pin.coords;
      const currentRotation = projection.rotate(); // Get current rotation of the globe
      const distance = d3.geoDistance(
        [lon, lat],
        [-currentRotation[0], -currentRotation[1]]
      );

      // Check if the pin is within 90° of the center of the visible hemisphere
      if (distance < Math.PI / 3) {
        const [x, y] = projection(pin.coords);
        drawLocationPin(
          context,
          x,
          y,
          30,
          Constants.colors.green,
          pin.name.toString()
        );
      }
    });
  };

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json").then(
    function (world) {
      const sphere = { type: "Sphere" };
      const land = topojson.feature(world, world.objects.land);

      const sensitivity = 150;
      let stopped = false;

      // Timer for rotation
      const timer = d3.timer(function rotateGlobe(elapsed) {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();

        // Rotate the globe
        projection.rotate([rotate[0] - 1 * k, rotate[1]]);
        render(sphere, land); // Re-render the globe, land, and pins

        const zoomCoords = pins.find((pin) => pin.name === "New York").coords;
        // Check if Brooklyn is near the center
        const distanceToBrooklyn = d3.geoDistance(zoomCoords, [
          -projection.rotate()[0],
          -projection.rotate()[1],
        ]);

        // console.log(distanceToBrooklyn);
        if (!stopped && distanceToBrooklyn < 0.8) {
          stopped = true;
          timer.stop(); // Stop rotation

          // Zoom
          zoomToCoords(sphere, land, zoomCoords);
        }
      });

      // Zoom
      function zoomToCoords(sphere, land, coords) {
        const startScale = projection.scale();
        const targetScale = height * 4; // Zoomed scale
        const interpolateScale = d3.interpolate(startScale, targetScale);

        const currentRotate = projection.rotate();
        const targetRotate = [-coords[0], -coords[1]];
        const interpolateRotate = d3.interpolateArray(
          currentRotate,
          targetRotate.map((angle, i) => {
            const diff = angle - currentRotate[i];
            return diff > 180 ? angle - 360 : diff < -180 ? angle + 360 : angle;
          })
        );

        d3.transition()
          .duration(2000)
          .tween("zoom", () => (t) => {
            projection.scale(interpolateScale(t)).rotate(interpolateRotate(t));
            render(sphere, land); // Re-render during zoom
          });
      }
    }
  );
}

function cuisinesOverFiveVisits(cuisineData) {
  const person3RestaurantsData = cuisineData["person-3"].Restaurants;

  const filteredCuisines = Object.entries(person3RestaurantsData).filter(
    ([cuisine, restaurants]) => restaurants.length > 4
  );

  return filteredCuisines;
}

export function drawSpiderChart(cuisineData) {
  const labelSize = "20px";
  const filteredCuisines = cuisinesOverFiveVisits(cuisineData);

  // Extract cuisine names and counts
  const data = filteredCuisines.map(([cuisine, restaurants]) => ({
    cuisine: cuisine,
    count: restaurants.length,
  }));

  // Dimensions
  const radius = Math.min(width, height) / 2 - 100;
  const levels = 5;

  // Create SVG
  const svg = d3
    .select("#radarChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Scales
  const angleScale = d3
    .scaleBand()
    .domain(data.map((d) => d.cuisine))
    .range([0, 2 * Math.PI]);

  const radiusScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .range([0, radius]);

  // Draw concentric circles
  for (let i = 0; i <= levels; i++) {
    const r = (radius / levels) * i;
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", Constants.colors.beige);
  }

  // Draw axis lines
  data.forEach((d) => {
    const angle = angleScale(d.cuisine);
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);

    svg
      .selectAll(".axis-line")
      .data(d.cuisine)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", Constants.colors.beige);
  });

  // Draw labels
  data.forEach((d) => {
    const angle = angleScale(d.cuisine);
    const x = (radius + 20) * Math.sin(angle);
    const y = -(radius + 20) * Math.cos(angle);

    svg
      .selectAll(".cuisine-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "cuisine-label")
      .attr("x", (d) => (radius + 20) * Math.sin(angleScale(d.cuisine)))
      .attr("y", (d) => -(radius + 20) * Math.cos(angleScale(d.cuisine)))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", labelSize)
      .text((d) => d.cuisine); // Assign cuisine name as the label
  });

  // Draw the radar area
  const radarLine = d3
    .lineRadial()
    .radius((d) => radiusScale(d.count))
    .angle((d) => angleScale(d.cuisine));

  svg
    .append("path")
    .datum(data)
    .attr("d", radarLine)
    .attr("fill", Constants.colors.greenTransparent);

  // Add data points for each cuisine
  const points = svg
    .selectAll(".radar-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "radar-point")
    .attr("cx", (d) => radiusScale(d.count) * Math.sin(angleScale(d.cuisine)))
    .attr("cy", (d) => -radiusScale(d.count) * Math.cos(angleScale(d.cuisine)))
    .attr("r", 4)
    .attr("fill", Constants.colors.green);

  // Add hover effects to the data points
  points
    .on("mouseover", function (event, d) {
      // Show tooltip or highlight
      d3.select(this).attr("fill", Constants.colors.yellow);

      svg
        .selectAll(".cuisine-label") // Target the labels by class
        .filter((textData) => textData.cuisine === d.cuisine) // Match the cuisine
        .attr("font-size", "30px"); // Bold the text

      svg
        .selectAll(".axis-line")
        .filter((lineData) => lineData === d.cuisine) // Match bound data
        .attr("stroke-width", 4) // Highlight the line
        .attr("stroke", Constants.colors.yellow);

      svg
        .append("text")
        .attr("id", "tooltip")
        .attr("x", radiusScale(d.count) * Math.sin(angleScale(d.cuisine)) + 10)
        .attr("y", -radiusScale(d.count) * Math.cos(angleScale(d.cuisine)) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", labelSize)
        .attr("fill", Constants.colors.black)
        .text(`${d.count}`);
    })
    .on("mouseout", function () {
      // Reset point style
      d3.select(this).attr("fill", Constants.colors.green);

      // Remove tooltip
      svg.select("#tooltip").remove();

      svg
        .selectAll(".cuisine-label")
        // .filter((textData) => textData.cuisine === d.cuisine)
        // .attr("font-weight", 400);
        .attr("font-size", labelSize);
    });

  // Add concentric circle labels
  for (let i = 0; i <= levels; i++) {
    const r = (radius / levels) * i;
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -r) // Position at the top of the circle
      .attr("text-anchor", "middle")
      .attr("font-size", labelSize)
      .attr("fill", Constants.colors.black)
      .text(Math.round(radiusScale.invert(r)));
  }

  return filteredCuisines;
}

export function calculateHighestRatedCuisine(userData, cuisineData) {
  const filteredCuisines = cuisinesOverFiveVisits(cuisineData);
  const person3RestaurantsData = userData["person-3"]["Restaurant Information"];

  const averageRatings = filteredCuisines.map((cuisine) => {
    const ratings = cuisine[1]
      .map((restaurantName) => {
        const restaurantEntry = person3RestaurantsData.find(
          (restaurant) => restaurant.Name === restaurantName
        );
        return restaurantEntry
          ? parseFloat(restaurantEntry["Rating (of 10)"])
          : 0;
      })
      .filter((rating) => rating > 0);

    const averageRating = d3.mean(ratings);
    return { cuisine: cuisine[0], averageRating };
  });

  return averageRatings;
}

export function drawBrunchSpiderChart(userData, cuisineData) {
  const labelSize = "20px";
  const person3RestaurantsData = userData["person-3"]["Restaurant Information"];
  const brunchList = [
    ...cuisinesOverFiveVisits(cuisineData).filter(
      (d) => d[0] === "Brunch"
    )[0][1],
  ];

  const data = [];

  brunchList.forEach((name) => {
    const restaurantEntry = person3RestaurantsData.find(
      (restaurant) => restaurant.Name === name
    );
    if (restaurantEntry) {
      data.push({
        name: restaurantEntry["Name"],
        rating: parseFloat(restaurantEntry["Rating (of 10)"]), // Ensure ratings are numeric
      });
    }
  });

  // Dimensions
  const radius = Math.min(width, height) / 2 - 100;
  const levels = 5;

  // Create SVG
  const svg = d3
    .select("#radarChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Scales
  const angleScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, 2 * Math.PI]);

  const radiusScale = d3
    .scaleLinear()
    .domain([7, 10]) // Updated domain: Ratings now range from 7 to 10
    .range([0, radius]);

  // Draw concentric circles
  for (let i = 0; i <= levels; i++) {
    const r = (radius / levels) * i;
    const ratingLabel = (7 + i * (3 / levels)).toFixed(1); // Dynamic labels between 7 and 10
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", Constants.colors.beige);

    // Add labels for concentric circles
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", r)
      .attr("text-anchor", "middle")
      .attr("font-size", labelSize)
      .attr("fill", Constants.colors.black)
      .text(ratingLabel); // Label for the circle
  }

  // Draw axis lines
  data.forEach((d) => {
    const angle = angleScale(d.name);
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", Constants.colors.beige);
  });

  // Draw labels
  svg
    .selectAll(".name-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "name-label")
    .attr("x", (d) => (radius + 20) * Math.sin(angleScale(d.name)))
    .attr("y", (d) => -(radius + 20) * Math.cos(angleScale(d.name)))
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", labelSize)
    .text((d) => d.name);

  // Draw the radar area
  const radarLine = d3
    .lineRadial()
    .radius((d) => radiusScale(d.rating))
    .angle((d) => angleScale(d.name));

  svg
    .append("path")
    .datum(data)
    .attr("d", radarLine)
    .attr("fill", Constants.colors.greenTransparent);

  // Add data points for each restaurant
  const points = svg
    .selectAll(".radar-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "radar-point")
    .attr("cx", (d) => radiusScale(d.rating) * Math.sin(angleScale(d.name)))
    .attr("cy", (d) => -radiusScale(d.rating) * Math.cos(angleScale(d.name)))
    .attr("r", 4)
    .attr("fill", Constants.colors.green);

  // Add hover effects to the data points
  points
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", Constants.colors.yellow);

      svg
        .append("text")
        .attr("id", "tooltip")
        .attr("x", radiusScale(d.rating) * Math.sin(angleScale(d.name)) + 10)
        .attr("y", -radiusScale(d.rating) * Math.cos(angleScale(d.name)) - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", labelSize)
        .attr("fill", Constants.colors.black)
        .text(`${d.rating}`);

      svg
        .selectAll(".name-label") // Target the labels by class
        .filter((textData) => textData.name === d.name) // Match the cuisine
        .attr("font-size", "30px"); // Bold the text
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", Constants.colors.green);
      svg.select("#tooltip").remove();

      svg
        .selectAll(".name-label") // Target the labels by class
        // .filter((textData) => textData.name === d.name) // Match the cuisine
        .attr("font-size", labelSize); // Bold the text
    });
}
