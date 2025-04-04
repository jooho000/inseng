let player;
let lastDirection = 'down';

function createAnimations(scene) {
  if (!scene.anims.exists('idle-down')) {
    scene.anims.create({ key: 'idle-right', frames: [ { key: 'player_idle', frame: 0 } ] });
    scene.anims.create({ key: 'idle-up',    frames: [ { key: 'player_idle', frame: 1 } ] });
    scene.anims.create({ key: 'idle-left',  frames: [ { key: 'player_idle', frame: 2 } ] });
    scene.anims.create({ key: 'idle-down',  frames: [ { key: 'player_idle', frame: 3 } ] });

    scene.anims.create({ key: 'run-right', frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    scene.anims.create({ key: 'run-up',    frames: scene.anims.generateFrameNumbers('player_run', { start: 6, end: 11 }), frameRate: 8, repeat: -1 });
    scene.anims.create({ key: 'run-left',  frames: scene.anims.generateFrameNumbers('player_run', { start: 12, end: 17 }), frameRate: 8, repeat: -1 });
    scene.anims.create({ key: 'run-down',  frames: scene.anims.generateFrameNumbers('player_run', { start: 18, end: 23 }), frameRate: 8, repeat: -1 });
  }
}

function createPlayer(scene, x = 16, y = 150) {
  player = scene.physics.add.sprite(x, y, 'player_idle', 0);
  player.setOrigin(0.5, 1);
  player.setDepth(1);
  player.setCollideWorldBounds(true);
  player.body.setSize(12, 8);
  player.body.setOffset(2, 24);
  createAnimations(scene);
}

function handlePlayerMovement(scene) {
  const speed = 60;
  player.setVelocity(0);
  let moving = false;
  const cursors = scene.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    player.anims.play('run-left', true);
    lastDirection = 'left';
    moving = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    player.anims.play('run-right', true);
    lastDirection = 'right';
    moving = true;
  } else if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    player.anims.play('run-up', true);
    lastDirection = 'up';
    moving = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    player.anims.play('run-down', true);
    lastDirection = 'down';
    moving = true;
  }

  if (!moving) {
    player.anims.play('idle-' + lastDirection, true);
  }
}

function addDoors(map, scene, layerName = 'doors') {
  const doors = map.getObjectLayer(layerName)?.objects || [];
  doors.forEach(obj => {
    const door = scene.add.rectangle(obj.x, obj.y, obj.width, obj.height).setOrigin(0, 0);
    scene.physics.add.existing(door, true);
    door.targetScene = obj.properties?.find(p => p.name === 'targetScene')?.value;

    scene.physics.add.overlap(player, door, () => {
      if (door.targetScene) {
        scene.scene.start(door.targetScene);
      }
    });
  });
}

class HubScene extends Phaser.Scene {
  constructor() {
    super('hub');
  }

  preload() {
    this.load.tilemapTiledJSON('hub', 'assets/maps/hub.json');

    this.load.image('hub_floor_wall_tyles', 'assets/tilesets/hub_tileset/room.png');
    this.load.image('coban_furnishing_tyles', 'assets/tilesets/coban_tileset/Props.png');
    this.load.image('coban_floor_tyles', 'assets/tilesets/hub_tileset/Floors.png');
    this.load.image('coban_wall_tyles', 'assets/tilesets/coban_tileset/Walls.png');

    this.load.spritesheet('player_idle', 'assets/player/player_idle.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_run',  'assets/player/player_run.png',  { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'hub' });

    const hubTyles = map.addTilesetImage('floor_tyles', 'hub_floor_wall_tyles');
    const cobanFurniture = map.addTilesetImage('furnishing_layer', 'coban_furnishing_tyles');
    const cobanFloor = map.addTilesetImage('coban_floor', 'coban_floor_tyles');
    const cobanWall = map.addTilesetImage('coban_wall', 'coban_wall_tyles');

    map.createLayer('hub_floor_layer', [hubTyles, cobanFloor]);
    const wallLayer = map.createLayer('hub_wall_layer', [hubTyles, cobanWall]);
    map.createLayer('hub_furinishing_layer', [cobanFurniture]);

    createPlayer(this);

    wallLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(player, wallLayer);

    addDoors(map, this, 'doors');

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);
  }

  update() {
    handlePlayerMovement(this);
  }
}

class CobanScene extends Phaser.Scene {
  constructor() {
    super("coban");
  }

  preload() {
    this.load.tilemapTiledJSON("coban", "assets/maps/coban.json");

    // Load all tileset images
    this.load.image("water_tyles", "assets/tilesets/coban_tileset/Water_tiles.png");
    this.load.image("ground_tyles", "assets/tilesets/coban_tileset/Floors_Tiles.png");
    this.load.image("wall_tyles", "assets/tilesets/coban_tileset/Walls.png");
    this.load.image("furniture_tyles", "assets/tilesets/coban_tileset/Props.png");
    this.load.image("small_trees", "assets/tilesets/coban_tileset/small_trees.png");
    this.load.image("rock_tyles", "assets/tilesets/coban_tileset/Rocks.png");
    this.load.image("big_trees", "assets/tilesets/coban_tileset/large_trees.png");
    this.load.image("vegetation_tyles", "assets/tilesets/coban_tileset/Vegetation.png");

    // Player spritesheets
    this.load.spritesheet('player_idle', 'assets/player/player_idle.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_run',  'assets/player/player_run.png',  { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: "coban" });

    // Load tilesets
    const tilesets = {
      water: map.addTilesetImage("water_tyles", "water_tyles"),
      ground: map.addTilesetImage("ground_tyles", "ground_tyles"),
      wall: map.addTilesetImage("wall_tyles", "wall_tyles"),
      furniture: map.addTilesetImage("furniture_tyles", "furniture_tyles"),
      smallTrees: map.addTilesetImage("small_trees", "small_trees"),
      rocks: map.addTilesetImage("rock_tyles", "rock_tyles"),
      bigTrees: map.addTilesetImage("big_trees", "big_trees"),
      vegetation: map.addTilesetImage("vegetation_tyles", "vegetation_tyles"),
    };

    // Create all tile layers
    const waterLayer = map.createLayer("water_layer", tilesets.water);
    map.createLayer("ground_layer", tilesets.ground);
    map.createLayer("grass_layer", tilesets.ground);
    map.createLayer("vegetation_layer", tilesets.vegetation);
    const wallLayer = map.createLayer("wall_layer", tilesets.wall);
    const propsLayer = map.createLayer("props_layer", [tilesets.furniture, tilesets.rocks]);
    map.createLayer("lower_trees_layer", tilesets.bigTrees);
    map.createLayer("lower_trees_second_layer", tilesets.bigTrees);
    const upperTreesLayer = map.createLayer("upper_trees_layer", tilesets.smallTrees);
    const upperTreesSecondLayer = map.createLayer("upper_trees_second_layer", tilesets.smallTrees);

    // ✅ Properly use tile property-based collision
    [wallLayer, propsLayer, upperTreesLayer, upperTreesSecondLayer, waterLayer].forEach(layer => {
      if (layer) {
        layer.setCollisionByProperty({ collidable: true });
      }
    });

    // Create the player
    createPlayer(this, 100, 100);

    // Collisions
    this.physics.add.collider(player, wallLayer);
    this.physics.add.collider(player, propsLayer);
    this.physics.add.collider(player, upperTreesLayer);
    this.physics.add.collider(player, upperTreesSecondLayer);

    // Camera setup
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    handlePlayerMovement(this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 160,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [HubScene, CobanScene],
  scale: {
    zoom: 4.2,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
