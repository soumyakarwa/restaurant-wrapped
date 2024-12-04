import {
  createGlobe,
  zoomGlobeIn,
  drawSpiderChart,
  //   calculateHighestRatedCuisine,
  drawBrunchSpiderChart,
} from "./visualization.js";

// LOADING ALL REQUIRED DATA
async function loadData() {
  try {
    // Fetch the JSON data
    const cuisineDataResponse = await fetch(
      "./assets/cuisine-profiles-by-category.json"
    );
    const dataByCuisine = await cuisineDataResponse.json();

    const userDataResponse = await fetch("./assets/user-data.json");
    const userData = await userDataResponse.json();

    return [userData, dataByCuisine];
  } catch (error) {
    console.error("Failed to fetch cuisine data:", error);
  }
}

const [userData, dataByCuisine] = await loadData();

// createGlobe();
// zoomGlobeIn();
// drawSpiderChart(dataByCuisine);

// calculateHighestRatedCuisine(userData, dataByCuisine);

drawBrunchSpiderChart(userData, dataByCuisine);

// console.log(averageRatings);
