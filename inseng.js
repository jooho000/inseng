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

function createPlayer(scene) {
  player = scene.physics.add.sprite(16, 150, 'player_idle', 0);
  player.setOrigin(0.5, 1);
  player.setDepth(1);
  player.setCollideWorldBounds(true);
  scene.physics.world.setBounds(0, 0, scene.sys.game.config.width, scene.sys.game.config.height);
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

function addColliders(map, layerName, scene) {
  const objects = map.getObjectLayer(layerName)?.objects || [];
  objects.forEach(obj => {
    const wall = scene.add.rectangle(obj.x, obj.y, obj.width, obj.height).setOrigin(0, 0);
    wall.visible = false;
    scene.physics.add.existing(wall, true);
    scene.physics.add.collider(player, wall);
  });
}

function addDoors(map, scene, layerName = 'coban_door') {
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
    this.load.image('floor_ceiling', 'assets/tilesets/hub_tileset/room.png');
    this.load.image('furnishing', 'assets/tilesets/hub_tileset/furniture.png');
    this.load.tilemapTiledJSON('hub', 'assets/maps/hub.json');

    this.load.spritesheet('player_idle', 'assets/player/player_idle.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_run', 'assets/player/player_run.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'hub' });
    const floorTiles = map.addTilesetImage('floor_ceiling', 'floor_ceiling');
    const furnTiles = map.addTilesetImage('furnishing', 'furnishing');

    map.createLayer('Tile Layer 1', [floorTiles]);
    map.createLayer('Tile Layer 2', [furnTiles]);

    createPlayer(this);
    addColliders(map, 'wall', this);
    addDoors(map, this, 'coban_door');
  }

  update() {
    handlePlayerMovement(this);
  }
}

class CobanScene extends Phaser.Scene {
  constructor() {
    super('coban');
  }

  preload() {
    const base = 'assets/tilesets/coban_tileset/';
    this.load.tilemapTiledJSON('coban', 'assets/maps/coban.json');
    this.load.image('walls', base + 'Walls.png');
    this.load.image('roofs', base + 'Roofs.png');
    this.load.image('floor', base + 'Floors_Tiles.png');
    this.load.image('water', base + 'Water_tiles.png');
    this.load.image('rocks', base + 'Rocks.png');
    this.load.image('door', base + 'Furniture.png');
    this.load.image('trees', base + 'Trees.png');
    this.load.image('plants', base + 'Vegetation.png');

    this.load.spritesheet('player_idle', 'assets/player/player_idle.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player_run', 'assets/player/player_run.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'coban' });
    const tilesets = [
      map.addTilesetImage('roofs', 'roofs'),
      map.addTilesetImage('floor', 'floor'),
      map.addTilesetImage('walls', 'walls'),
      map.addTilesetImage('water', 'water'),
      map.addTilesetImage('rocks', 'rocks'),
      map.addTilesetImage('door', 'door'),
      map.addTilesetImage('trees', 'trees'),
      map.addTilesetImage('plants', 'plants')
    ];

    map.createLayer('Tile Layer 3', tilesets);
    map.createLayer('Tile Layer 2', tilesets);
    map.createLayer('Tile Layer 1', tilesets);

    createPlayer(this);
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
  scene: [HubScene, CobanScene]
};

const game = new Phaser.Game(config);
