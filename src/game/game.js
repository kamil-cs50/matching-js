const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
const screen_width = 400;
const screen_height = 600;
const gravity = 0.25;
const flyby_bird_speed = 7;
const pipe_frequency = 1800;
const scroll_speed = 3;
const gap = 180;

let bird_movement = 0;
let game_active = false;
let score = 0;
let high_score = 0;
let background_scroll = 0;
let last_pipe = Date.now();
let end_sound_played = false;
let next_flyby_time = 0;
let bird_sound_played = false;

// Flyby bird variables
let flyby_bird_x = screen_width;
let flyby_bird_y = Math.random() * (screen_height / 3);

// Load images and cache them
const background_image = new Image();
background_image.src = 'src/game/background-5120x2880.jpeg';
const bitcoin_logo = new Image();
bitcoin_logo.src = 'src/game/bitcoin_logo.png';
const bitcoin2_logo = new Image();
bitcoin2_logo.src = 'src/game/bitcoin2.png';
const flyby_bird = new Image();
flyby_bird.src = 'src/game/bird.png';
const pipe_image = new Image();
pipe_image.src = 'src/game/pipe-450x700.png';

// Ensure all images are preloaded before starting the game loop
const images = [background_image, bitcoin_logo, bitcoin2_logo, flyby_bird, pipe_image];
let images_loaded = 0;
images.forEach(img => {
    img.onload = () => {
        images_loaded++;
        if (images_loaded === images.length) {
            gameLoop();
        }
    };
});

// Load sounds
const flap_sound = new Audio('src/game/click.mp3');
const end_sound = new Audio('src/game/endgame.mp3');
const music = new Audio('src/game/music.mp3');
const flyby_sound = new Audio('src/game/birdsound.mp3');
const start_sound = new Audio('src/game/start.mp3');

music.loop = true;
music.volume = 0.6;
end_sound.volume = 1.0;
flyby_sound.volume = 0.9;
start_sound.volume = 1.0;

// Initialize the bitcoin_rect
let bitcoin_rect = { x: 100, y: screen_height / 2, width: 50, height: 50 };

// Pipes - using an array to handle pipe properties
let pipes = [];

function createPipe() {
    const random_pipe_pos = [250, 300, 350, 400, 450][Math.floor(Math.random() * 5)];
    const bottom_pipe_height = screen_height - random_pipe_pos;
    const bottom_pipe_rect = { x: screen_width, y: random_pipe_pos, width: 80, height: bottom_pipe_height };
    const top_pipe_rect = { x: screen_width, y: 0, width: 80, height: random_pipe_pos - gap };

    return { bottom_rect: bottom_pipe_rect, top_rect: top_pipe_rect, passed: false };
}

function movePipes() {
    pipes.forEach(pipe => {
        pipe.bottom_rect.x -= scroll_speed;
        pipe.top_rect.x -= scroll_speed;
    });
    pipes = pipes.filter(pipe => pipe.bottom_rect.x + pipe.bottom_rect.width > -50);
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipe_image, pipe.bottom_rect.x, pipe.bottom_rect.y, pipe.bottom_rect.width, pipe.bottom_rect.height);
        ctx.drawImage(pipe_image, pipe.top_rect.x, pipe.top_rect.y, pipe.top_rect.width, pipe.top_rect.height);
    });
}

function checkCollision() {
    for (let pipe of pipes) {
        if (
            (bitcoin_rect.x < pipe.bottom_rect.x + pipe.bottom_rect.width &&
                bitcoin_rect.x + bitcoin_rect.width > pipe.bottom_rect.x &&
                bitcoin_rect.y < pipe.bottom_rect.y + pipe.bottom_rect.height &&
                bitcoin_rect.y + bitcoin_rect.height > pipe.bottom_rect.y) ||
            (bitcoin_rect.x < pipe.top_rect.x + pipe.top_rect.width &&
                bitcoin_rect.x + bitcoin_rect.width > pipe.top_rect.x &&
                bitcoin_rect.y < pipe.top_rect.y + pipe.top_rect.height &&
                bitcoin_rect.y + bitcoin_rect.height > pipe.top_rect.y)
        ) {
            return false;
        }
    }
    if (bitcoin_rect.y <= 0 || bitcoin_rect.y + bitcoin_rect.height >= screen_height) {
        return false;
    }
    return true;
}

function rotateBitcoin() {
    ctx.save();
    ctx.translate(bitcoin_rect.x + bitcoin_rect.width / 2, bitcoin_rect.y + bitcoin_rect.height / 2);
    ctx.rotate(bird_movement * 0.05);
    ctx.drawImage(bitcoin_logo, -bitcoin_rect.width / 2, -bitcoin_rect.height / 2, bitcoin_rect.width, bitcoin_rect.height);
    ctx.restore();
}

function scoreDisplay() {
    ctx.fillStyle = '#FFFFFF'; // Change font color to white
    ctx.font = '24px "Press Start 2P"'; // Change font to a pixelated look
    ctx.textAlign = 'center';
    if (game_active) {
        ctx.fillText(score, screen_width / 2, 50);
    } else {
        ctx.drawImage(bitcoin2_logo, screen_width / 2 - 50, screen_height / 2 - 130, 100, 100);
        ctx.fillText(`Score: ${score}`, screen_width / 2, screen_height / 2 + 60);
        ctx.fillText(`High Score: ${high_score}`, screen_width / 2, screen_height / 2 + 100);
    }
}

function manageFlybyBird() {
    const current_time = Date.now();
    if (current_time >= next_flyby_time && game_active) {
        if (flyby_bird_x > screen_width) {
            flyby_bird_x = -50;
            flyby_bird_y = Math.random() * (screen_height / 3);
            next_flyby_time = current_time + Math.random() * (11000 - 6000) + 6000;
            bird_sound_played = false;
        }
    }

    if (flyby_bird_x >= -50 && flyby_bird_x < screen_width + 100) {
        flyby_bird_x += flyby_bird_speed;
        ctx.drawImage(flyby_bird, flyby_bird_x, flyby_bird_y, 30, 30); // Hard-coding size for demonstration
        if (!bird_sound_played && game_active) {
            flyby_sound.play();
            bird_sound_played = true;
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, screen_width, screen_height);

    // Draw the scrolling background
    const background_width = background_image.width * (screen_height / background_image.height);
    const rel_x = background_scroll % background_width;

    ctx.drawImage(background_image, rel_x - background_width, 0, background_width, screen_height);
    ctx.drawImage(background_image, rel_x, 0, background_width, screen_height);
    ctx.drawImage(background_image, rel_x + background_width, 0, background_width, screen_height);
    if (rel_x < 0) {
        ctx.drawImage(background_image, rel_x + 2 * background_width, 0, background_width, screen_height);
    } else {
        ctx.drawImage(background_image, rel_x - 2 * background_width, 0, background_width, screen_height);
    }

    background_scroll -= scroll_speed / 2;

    if (game_active) {
        bird_movement += gravity;
        bitcoin_rect.y += bird_movement;
        rotateBitcoin();

        const time_now = Date.now();
        if (time_now - last_pipe > pipe_frequency) {
            last_pipe = time_now;
            pipes.push(createPipe());
        }

        movePipes();
        drawPipes();

        game_active = checkCollision();

        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.bottom_rect.x < bitcoin_rect.x) {
                pipe.passed = true;
                score += 1;
            }
        });

        scoreDisplay();

        // Reset end sound played flag when game is active
        end_sound_played = false;
    } else {
        if (high_score < score) high_score = score;
        scoreDisplay();

        if (!end_sound_played) {
            end_sound.play();
            end_sound_played = true;  // Prevent further play calls
        }
    }

    manageFlybyBird();

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    end_sound.pause();
    end_sound.currentTime = 0;
    game_active = true;
    pipes = [];
    bitcoin_rect.y = screen_height / 2;
    bird_movement = 0;
    score = 0;
    background_scroll = 0;
    music.play();

    // Reset the end sound played flag
    end_sound_played = false;
}

function handleUserInput() {
    if (!game_active) {
        resetGame();
    } else {
        bird_movement = -6;
        flap_sound.play();
    }
}

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        handleUserInput();
    }
});

canvas.addEventListener('click', handleUserInput);
canvas.addEventListener('touchstart', handleUserInput);

// The game loop will start once all images are loaded