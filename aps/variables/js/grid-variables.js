import gridVariables from '../scss/grid-variables.scss';

UX.grid = {};
Object.keys(gridVariables).map(key => {
    UX.grid[key] = parseInt(gridVariables[key], 10);
});
