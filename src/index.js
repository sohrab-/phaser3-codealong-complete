import Phaser from "phaser";

import platformsTileMap from "./assets/platforms-tilemap.json";
import backgroundTile from "./assets/Background/Green.png";
import terrainImage from "./assets/Terrain/Terrain (16x16).png";
import appleImage from "./assets/Items/Fruits/Apple.png";
import spikeBallImage from "./assets/Traps/Spiked Ball/Spiked Ball.png";
import playerRunImage from "./assets/Main Characters/Ninja Frog/Run (32x32).png";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
    this.score = 0;
    this.gameOver = false;
  }

  preload() {
    this.load.image("background-tile", backgroundTile);
    this.load.image("terrain", terrainImage);
    this.load.tilemapTiledJSON("platforms-tilemap", platformsTileMap);
    this.load.spritesheet("apple", appleImage, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("spike-ball", spikeBallImage);
    this.load.spritesheet("player-run", playerRunImage, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.background = this.add.tileSprite(
      400,
      300,
      800,
      600,
      "background-tile"
    );

    const map = this.make.tilemap({ key: "platforms-tilemap" });
    const tiles = map.addTilesetImage("terrain", "terrain");
    const layer = map.createLayer("Tile Layer 1", tiles);

    map.setCollisionByExclusion([-1]);

    this.player = this.physics.add.sprite(100, 450, "player-run");

    this.player.setSize(27, 28);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player-run", {
        start: 0,
        end: 11,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "idle",
      frames: [{ key: "player-run", frame: 0 }],
    });
    this.anims.create({
      key: "apple",
      frames: this.anims.generateFrameNumbers("apple", {
        start: 0,
        end: 16,
      }),
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.apples = this.physics.add.group({
      key: "apple",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.apples.children.iterate(function (child) {
      child.play("apple");
      child.body.setCircle(8);
      child.body.setOffset(8, 5);
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.spikeBalls = this.physics.add.group();

    this.scoreText = this.add.text(16, 16, "Score: 00", {
      fontSize: "20px",
      fill: "#000",
    });

    this.physics.add.collider(this.player, layer);
    this.physics.add.collider(this.apples, layer);
    this.physics.add.collider(this.spikeBalls, layer);

    this.physics.add.overlap(
      this.player,
      this.apples,
      this.eatApple,
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.spikeBalls,
      this.hitSpikeBall,
      null,
      this
    );
  }

  update() {
    if (this.gameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.flipX = true;
      this.player.anims.play("right", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.flipX = false;
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle", true);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-400);
    }
  }

  eatApple(player, apple) {
    apple.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.apples.countActive(true) === 0) {
      this.apples.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      const x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const spikeBall = this.spikeBalls.create(x, 16, "spike-ball");
      spikeBall.body.setCircle(10);
      spikeBall.body.setOffset(5, 5);
      spikeBall.setBounce(1);
      spikeBall.setCollideWorldBounds(true);
      spikeBall.setVelocity(Phaser.Math.Between(-200, 200), 20);
      spikeBall.allowGravity = false;
    }
  }

  hitSpikeBall(player, spikeBall) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.gameOver = true;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaser3-codealong",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      // debug: true,
    },
  },
  scene: MyGame,
});
