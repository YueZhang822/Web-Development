const bing_api_endpoint = "https://api.bing.microsoft.com/v7.0/images/search";
const bing_api_key = BING_API_KEY

function runSearch() {
  let query = document.querySelector(".search .form input").value
  let queryurl = bing_api_endpoint + "?q=" + encodeURIComponent(query);
  document.querySelector('.searchContainer').classList.remove('middle');

  let request = new XMLHttpRequest();
  request.open("GET", queryurl);
  request.setRequestHeader("Ocp-Apim-Subscription-Key", bing_api_key);
  request.setRequestHeader("Accept", "application/json");
  request.addEventListener("load", handleBingResponse);

  request.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      // clear previous search results
      let resultsContainer = document.querySelector(".results");
      /* let header = resultsContainer.querySelector("h2"); */
      resultsContainer.innerHTML = "";
      /* resultsContainer.appendChild(header); */
      document.querySelector(".res").classList.remove("hide");
      document.querySelector(".exitButton").classList.remove("hide");
      /* document.querySelector("#results").classList.remove("hide");
      document.querySelector(".resh").classList.remove("hide"); */

      // parse JSON response
      let response = JSON.parse(this.responseText);

      // display image results
      let imageResults = response.value;
      for (let i = 0; i < imageResults.length; i++) {
        let imageResult = imageResults[i];
        let img = document.createElement("img");
        img.src = imageResult.thumbnailUrl;
        img.alt = imageResult.name;
        resultsContainer.appendChild(img);
      
        img.addEventListener("mouseover", function() {
          let tooltip = document.createElement("div");
          tooltip.innerHTML = "click on picture to add to my board";
          tooltip.classList.add("tooltip");
          tooltip.style.position = "absolute";
          tooltip.style.backgroundColor = "white";
          tooltip.style.padding = "10px";
          tooltip.style.borderRadius = "5px";
          tooltip.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2)";
          tooltip.style.left = (img.offsetLeft + img.offsetWidth + 10) + "px";
          tooltip.style.top = (img.offsetTop + img.offsetHeight/2 - tooltip.offsetHeight/2) + "px";
          document.body.appendChild(tooltip);
        });
        
        img.addEventListener("mouseout", function() {
          let tooltip = document.querySelector(".tooltip");
          if (tooltip) {
            document.body.removeChild(tooltip);
          }
        });

      img.addEventListener("click", function() {
        let moodBoard = document.querySelector(".board");
        let moodImg = document.createElement("img");
        moodImg.src = imageResult.thumbnailUrl;
        moodImg.alt = imageResult.name;
        moodBoard.appendChild(moodImg);

        let successMessage = document.createElement("div");
        successMessage.innerHTML = "Added to collection successfully!";
        successMessage.style.position = "fixed";
        successMessage.style.backgroundColor = "white";
        successMessage.style.padding = "10px";
        successMessage.style.borderRadius = "5px";
        successMessage.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2)";
        successMessage.style.left = "50%";
        successMessage.style.top = "50%";
        successMessage.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(successMessage);

        setTimeout(function() {
        document.body.removeChild(successMessage);
        }, 1000);
      
        // Remove the "hide" class from the "boardContainer" to display it
        document.querySelector("#boardContainer").classList.remove("hide");
      });
    }

      let conceptResults = response.relatedSearches;
      let suggestionsContainer = document.querySelector(".list-items");
      suggestionsContainer.innerHTML = "";
      document.querySelector(".whole_suggestions").classList.remove("hide");
      document.querySelector(".exitButton").classList.remove("hide");
      for (let i = 0; i < conceptResults.length; i++) {
        let conceptResult = conceptResults[i];
        let p = document.createElement("li");
        p.textContent = conceptResult.text;
        suggestionsContainer.appendChild(p);

        // add click event listener to run a new search for the concept
        p.addEventListener("click", function() {
          let searchInput = document.querySelector(".search .form input");
          searchInput.value = conceptResult.text;
          runSearch();
        });
      } 
    }
  };

  request.send();

  
  
  // TODO: Construct the request object and add appropriate event listeners to
  // handle responses. At a minimum, you'll need to set request headers to
  // accept JSON responses, and to set the header "Ocp-Apim-Subscription-Key" to
  // the value in BING_API_KEY. See the API docs at
  // https://docs.microsoft.com/en-us/bing/search-apis/bing-image-search/reference/headers

  handleBingResponse();

  return false;  // Keep this; it keeps the browser from sending the event
                  // further up the DOM chain. Here, we don't want to trigger
                  // the default form submission behavior.
}

function handleBingResponse() {
  window.location.hash = "results";
}

function closeSeachPane() {
  window.location.hash = "";
  document.querySelector(".res").classList.add("hide");
  document.querySelector(".exitButton").classList.add("hide");
}

document.querySelector("#searchInput").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    runSearch();
  }
});

document.querySelector("#exitButton").addEventListener("click", closeSeachPane);
