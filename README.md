# Repeat Climate Action Patterns

Project of CAS Generative Data Design HKB 2025

## Project description

The global climate change survey discovered that the majority of people in Switzerland and across the world are in favour of more climate action. 

In this project, the main results from the survey are visually summarized in a simple data-dependant motif, which is then repeated across a canvas using simple geometrical transformations.

## Purpose & goal

- Inform people about the survey and the results
- Translate the main results from the survey to a visual motif, from which a repeat pattern is generated
- Provide a tool to create several motifs and repeat patterns using simple geometrical transformations
- Make the resulting repeat patterns shareable, e.g., as a post card
- Provide an explanation for survey results and the derived motif and repeat patterns


## Data sources & information

The [global climate change survey](https://gccs.iza.org/) was published in 2024 [1]. In 125 countries across the world, 130'000 people were asked four questions:
1. **WTP, willingness to particispate:** Would you be willing to contribute 1% of your household income every month to fight global warming? (WTP, willingness to participate)
2. **WTP Belief:** We are asking this question to 100 other respondents in [Switzerland]. How many do you think are willing to contribute at least 1% of their household income every month to fight global warming?
3. **Social Norm:** Do you think that people in [Switzerland] should try to fight global warming? 
4. **Government:** Do you think the national government should do more to fight global warming?

For detailed information, check the (survey website)[https://gccs.iza.org/] and the (publication)[https://www.nature.com/articles/s41558-024-01925-3].

Here, summary data per country is used (see `data/gccs_country_with_temperature_and_gdp.csv`). From the four questions, the amount of approval is calculated as percentage value.


## How it works

The app can be used to create A6 post cards (148mm x 105mm) for single countries with repeat patterns from the global climate change survery data.

There are several options in the app:
- Country
- Pattern:
    - Motif
    - Symmetry
    - Show grid
- Postcard setup
    - Layout
    - Size of frame as ratio
    - Number of cells per row
    - Relative motif size
- Color
    - Color palette
    - Colors for the four variables and the background
- Typeface
    - Title on the back
    - Text
- Export button


For each setting, the front and back of a postcard are created. The front contains the repeat pattern and the country name. The motif of the pattern is explained on the back. 


## Technologies used

- **p5.js**: canvas rendering, repeat pattern creation, postcard front and back creation
- **p5-svg.js**: canvas rendering as svg
- **d3.js**: data loading and scaling
- **HTML**: structure and semantic markup



## Setup and installation

### Prerequisites

- VS Code with the p5.vscode extension (which includes Live Server)

### Running the Project

- Clone this repository to your local machine
- Open the project folder in VS Code
- Install the p5.vscode extension if not already installed
- Click "Go Live" button in the VS Code status bar
- The project will open in your browser at http://localhost:5500

## Demo

View the demo at TODO link to netlify

## References

1. Andre, P., Boneva, T., Chopra, F., Falk, A. (2024). Globally Representative Evidence on the Actual and Perceived Support for Climate Action. *Nature Climate Change.* [link](https://www.nature.com/articles/s41558-024-01925-3)
2. Jackson, P. (2018). *How to make repeat patterns: a guide for designers, architects and artists.* Laurence King Publishing. 

## Project status

Status: TODO

Last updated: September 2025

Version: 0.1
