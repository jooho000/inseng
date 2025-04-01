let player;
let lastDirection = 'down';

class HubScene extends Phaser.Scene {
  constructor() {
    super('hub');
  }

  preload() {
    this.load.image('floor_ceiling', 'assets/tilesets/hub_tileset/room.png');
    this.load.image('furnishing', 'assets/tilesets/hub_tileset/furniture.png');
    this.load.tilemapTiledJSON('hub', 'assets/tilesets/hub_tileset/hub.json');

    this.load.spritesheet('player_idle', 'assets/player/player_idle.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    this.load.spritesheet('player_run', 'assets/player/player_run.png', {
      frameWidth: 16,
      frameHeight: 32
    });
  }

  create() {
    const map = this.make.tilemap({ key: 'hub' });
    const floorTiles = map.addTilesetImage('floor_ceiling', 'floor_ceiling');
    const furnTiles = map.addTilesetImage('furnishing', 'furnishing');

    const floorLayer = map.createLayer('Tile Layer 1', [floorTiles]);
    const wallLayer = map.createLayer('Tile Layer 2', [furnTiles]);

    player = this.physics.add.sprite(16, 150, 'player_idle', 0);
    player.setOrigin(0.5, 1);
    player.setDepth(1);
    player.setCollideWorldBounds(true);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();

    const wallObjects = map.getObjectLayer('wall').objects;
    wallObjects.forEach(obj => {
      const wall = this.add.rectangle(
        obj.x,
        obj.y,
        obj.width,
        obj.height
      ).setOrigin(0, 0);
      wall.visible = false;
      this.physics.add.existing(wall, true);
      this.physics.add.collider(player, wall);
    });

    // Idle animations
    this.anims.create({ key: 'idle-right', frames: [ { key: 'player_idle', frame: 0 } ] });
    this.anims.create({ key: 'idle-up',    frames: [ { key: 'player_idle', frame: 1 } ] });
    this.anims.create({ key: 'idle-left',  frames: [ { key: 'player_idle', frame: 2 } ] });
    this.anims.create({ key: 'idle-down',  frames: [ { key: 'player_idle', frame: 3 } ] });

    // Run animations
    this.anims.create({
      key: 'run-right',
      frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'run-up',
      frames: this.anims.generateFrameNumbers('player_run', { start: 6, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'run-left',
      frames: this.anims.generateFrameNumbers('player_run', { start: 12, end: 17 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'run-down',
      frames: this.anims.generateFrameNumbers('player_run', { start: 18, end: 23 }),
      frameRate: 8,
      repeat: -1
    });
  }

  update() {
    const speed = 60;
    player.setVelocity(0);
    let moving = false;

    if (this.cursors.left.isDown) {
      player.setVelocityX(-speed);
      player.anims.play('run-left', true);
      lastDirection = 'left';
      moving = true;
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(speed);
      player.anims.play('run-right', true);
      lastDirection = 'right';
      moving = true;
    } else if (this.cursors.up.isDown) {
      player.setVelocityY(-speed);
      player.anims.play('run-up', true);
      lastDirection = 'up';
      moving = true;
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(speed);
      player.anims.play('run-down', true);
      lastDirection = 'down';
      moving = true;
    }

    if (!moving) {
      player.anims.play('idle-' + lastDirection, true);
    }
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
  scene: [HubScene]
};

const game = new Phaser.Game(config);
