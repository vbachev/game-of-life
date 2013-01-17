var Game = {
  parsedCellsMap : [],
  cellMap        : [],
  cellGeneration : [],
  stage          : {
    width  : 50,
    height : 50
  },

  initialize : function ()
  {
    console.log('game initialized');
  },

  setStage : function( a_width, a_height ) 
  {
    this.stage.width  = parseInt( a_width );
    this.stage.height = parseInt( a_height );
  },

  // takes an array of cell coordinates ant turns them alive.
  // used to display a preset cell pattern
  setGeneration : function ( a_cells )
  {
    var
    midX = parseInt(this.stage.width/2),
    midY = parseInt(this.stage.height/2);

    this.cellGeneration = [];

    for( i in a_cells ){
      currentItem = a_cells[i];
      this.cellGeneration.push([
        currentItem[0] + midX,
        currentItem[1] + midY
      ]);
    }

    this.createCellMap();
  },

  toggleCellAlive : function( a_x, a_y )
  {
    var liveCellFound = false
    liveCells = this.cellGeneration;

    for( i in liveCells ){
      cell = liveCells[i];
      if( cell[0] == a_x && cell[1] == a_y ){
        liveCellFound = true;
        this.cellGeneration.splice( i, 1 ); // remove from array
      }
    }

    if( !liveCellFound ){
      this.cellGeneration.push([ a_x, a_y ]);
    }

    this.createCellMap();
  },

  getNewGeneration : function ( a_gen )
  {
    var newGen = [], 
    i, 
    cellMap, 
    cell, 
    cellBlock, 
    newCells;

    if( !a_gen ){
      a_gen = this.cellGeneration;
    }

    // clear the parsed cells map
    this.resetParsedCellsMap();

    // loop through live cells, get cell chunks and parse them, add results
    for( i in a_gen ){
      cell      = a_gen[i];
      cellBlock = this.getNeighbourhood( cell[0], cell[1], true );
      newCells  = this.parseCellBlock( cellBlock );
      newGen    = newGen.concat( newCells );
    }

    this.cellGeneration = newGen;
    this.createCellMap();

    return newGen;
  },

  getNeighbourhood : function ( a_x, a_y, a_include )
  {
      var stage = this.stage,
      xMin = a_x - 1,
      xMax = a_x + 1,
      yMin = a_y - 1,
      yMax = a_y + 1,
      neighbours     = [],
      liveNeighbours = 0,
      i;

    // if at edges of the stage use the cells at the other side as neighbours
    // this way we make the live cells "teleport" through the edges
    if( xMin == -1 ){
      xMin = stage.width - 1;
    }
    if( xMax == stage.width ){
      xMax = 0;
    }
    if( yMin == -1 ){
      yMin = stage.height - 1;  
    }
    if( yMax == stage.height ){
      yMax = 0;
    }

    // build neighbours array
    neighbours = [
      [ xMin, yMin ],
      [ a_x,  yMin ],
      [ xMax, yMin ],
      [ xMax, a_y  ],
      [ xMax, yMax ],
      [ a_x,  yMax ],
      [ xMin, yMax ],
      [ xMin, a_y  ]
    ];

    if( a_include ){
      neighbours.push([ a_x, a_y ]);
    }

    return neighbours;
  },

  runLifeConditions : function ( a_currentlyAlive, a_liveNeighbours )
  {
    if( a_currentlyAlive ){
      willLive = ( a_liveNeighbours == 2 || a_liveNeighbours == 3 ) ? true : false;
    } else {
      willLive = ( a_liveNeighbours == 3 ) ? true : false;
    }
    return willLive;
  },

  parseCellBlock : function ( a_cellBlock )
  {
    var result = [], 
    i, 
    cell, 
    cellNeighbours, 
    liveNeighbours, 
    cellWillLive, 
    parsedCellsMap = this.parsedCellsMap;

    for( i in a_cellBlock ){
      cell = a_cellBlock[i];

      // skip parsed cells
      if( parsedCellsMap[ cell[0] ][ cell[1] ] ){
        continue;
      }

      // mark cell as parsed
      parsedCellsMap[ cell[0] ][ cell[1] ] = true;

      cellNeighbours = this.getNeighbourhood( cell[0], cell[1] );
      liveNeighbours = this.getLiveNeighbours( cellNeighbours );
      cellIsAlive    = this.cellMap[cell[0]][cell[1]];
      cellWillLive   = this.runLifeConditions( cellIsAlive, liveNeighbours );

      if( cellWillLive ){
        result.push([ cell[0], cell[1] ]);
      }
    }

    // update parsed cells map
    this.parsedCellsMap = parsedCellsMap;

    // return array of next generation live cells
    return result;
  },

  getLiveNeighbours : function( a_neighbours ){
    var i, 
    cell, 
    result  = 0, 
    cellMap = this.cellMap;
    
    for( i in a_neighbours ){
      cell = a_neighbours[i];
      if( cellMap[ cell[0] ][ cell[1] ] ){
        result++;
      }
    }
    return result;
  },

  resetParsedCellsMap : function()
  {
    var i, 
    j,
    map = [],
    width  = this.stage.width,
    height = this.stage.height;

    for( i = 0; i < width; i++ ){
      map[i] = [];
      for( j = 0; j < height; j++ ){
        map[i][j] = false;
      }
    }

    this.parsedCellsMap = map;
  },

  createCellMap : function ()
  {
    var cellMap = [],
    width  = this.stage.width,
    height = this.stage.height,
    liveCellCount = this.cellGeneration.length;

    for( i = 0; i < width; i++ ){
      cellMap[i] = [];
      for( j = 0; j < height; j++ ){
        cellMap[i][j] = false;
      }
    }

    for( i = 0; i < liveCellCount; i++ ){
      liveCell = this.cellGeneration[i];
      cellMap[ liveCell[0] ][ liveCell[1] ] = true;
    }

    this.cellMap = cellMap;
  }
}