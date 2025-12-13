const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ⚠️ YOUR DISCORD WEBHOOK
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1402491984848879627/PACItDfwHBr8grhkiW4DXPLYFQeh1J6z_1pre8TvbpTEuXEYc-vxJLdlGREliYI_2IKw";

// Store games
let unauthorizedGames = {};

// Function to send Discord webhook
function sendDiscordWebhook(title, description, color, fields) {
    if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes("YOUR_WEBHOOK")) {
        console.log("⚠️ Discord webhook not configured");
        return;
    }
    
    const https = require('https');
    const url = new URL(DISCORD_WEBHOOK);
    
    const data = JSON.stringify({
        content: "@here ⚠️ **NEW UNAUTHORIZED GAME DETECTED!**",
        embeds: [{
            title: title,
            description: description,
            color: color,
            fields: fields,
            timestamp: new Date().toISOString(),
            footer: {
                text: "Ainz Asset Protection System"
            }
        }]
    });
    
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    
    const req = https.request(options, (res) => {
        console.log(`📢 Discord webhook sent! Status: ${res.statusCode}`);
    });
    
    req.on('error', (error) => {
        console.error('❌ Discord webhook failed:', error.message);
    });
    
    req.write(data);
    req.end();
}

// ==================== WEBSITE ====================
app.get('/', (req, res) => {
    const totalGames = Object.keys(unauthorizedGames).length;
    const destroyedGames = Object.values(unauthorizedGames).filter(g => g.destroy).length;
    const activeGames = totalGames - destroyedGames;
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>💥 AINZ DESTRUCTION CONTROL</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #111;
                color: white;
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: linear-gradient(45deg, #ff0000, #ff6b6b);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin-bottom: 30px;
            }
            .stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin: 20px 0;
            }
            .stat-card {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                min-width: 120px;
            }
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #ff6b6b;
            }
            .control-panel {
                background: rgba(255,255,255,0.05);
                padding: 25px;
                border-radius: 10px;
                margin: 20px 0;
                border: 2px solid #ff0000;
            }
            input {
                padding: 12px;
                width: 300px;
                border: none;
                border-radius: 5px;
                background: #222;
                color: white;
                margin-right: 10px;
            }
            .btn-destroy {
                background: #ff0000;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            }
            .btn-destroy:hover {
                background: #cc0000;
            }
            .game-card {
                background: #1a1a1a;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #ff0000;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .status {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .active { background: #00aa00; }
            .destroyed { background: #ff0000; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>💥 AINZ DESTRUCTION CONTROL PANEL</h1>
            <p>Server: ${req.headers.host || 'ainz-destruction-server.onrender.com'}</p>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${totalGames}</div>
                    <div>Total Games</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${activeGames}</div>
                    <div>Active Games</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${destroyedGames}</div>
                    <div>Destroyed</div>
                </div>
            </div>
        </div>
        
        <div class="control-panel">
            <h3>⚡ Quick Destruction</h3>
            <p>Enter Game ID from Discord:</p>
            <input type="text" id="gameId" placeholder="Game ID (e.g., 1234567890)">
            <button class="btn-destroy" onclick="destroyGame()">💥 DESTROY GAME</button>
            <p style="color: #aaa; margin-top: 10px; font-size: 14px;">
                Game will be destroyed within 5 seconds
            </p>
        </div>
        
        <h3>🎮 Active Unauthorized Games</h3>
        <div id="gamesList">
            ${totalGames === 0 
                ? '<p style="color: #888; font-style: italic;">No unauthorized games detected yet.</p>' 
                : ''}
        </div>
        
        <script>
            // Load games
            async function loadGames() {
                try {
                    const response = await fetch('/games');
                    const games = await response.json();
                    
                    const gamesList = document.getElementById('gamesList');
                    
                    if (Object.keys(games).length === 0) {
                        gamesList.innerHTML = '<p style="color: #888; font-style: italic;">No unauthorized games detected yet.</p>';
                        return;
                    }
                    
                    let html = '';
                    for (const [gameId, game] of Object.entries(games)) {
                        const status = game.destroy ? 'DESTROYED' : 'ACTIVE';
                        const statusClass = game.destroy ? 'destroyed' : 'active';
                        
                        html += \`
                            <div class="game-card">
                                <div>
                                    <strong>\${game.name || 'Unknown Game'}</strong>
                                    <br>
                                    <small style="color: #aaa;">ID: \${gameId}</small>
                                    <br>
                                    <span class="status \${statusClass}">\${status}</span>
                                </div>
                                <div>
                                    \${!game.destroy ? \`
                                        <button class="btn-destroy" onclick="destroySingle('\${gameId}')">
                                            Destroy
                                        </button>
                                    \` : ''}
                                </div>
                            </div>
                        \`;
                    }
                    
                    gamesList.innerHTML = html;
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            
            // Destroy single game
            async function destroySingle(gameId) {
                if (!confirm('Destroy game ' + gameId + '?')) return;
                
                const response = await fetch('/destroy/' + gameId);
                const result = await response.json();
                
                if (result.status === 'destroy_scheduled') {
                    alert('✅ Game ' + gameId + ' will be destroyed!');
                    loadGames();
                }
            }
            
            // Destroy game from input
            async function destroyGame() {
                const gameId = document.getElementById('gameId').value.trim();
                if (!gameId) {
                    alert('Please enter Game ID!');
                    return;
                }
                
                if (!confirm('Destroy game ' + gameId + '?')) return;
                
                const response = await fetch('/destroy/' + gameId);
                const result = await response.json();
                
                if (result.status === 'destroy_scheduled') {
                    alert('✅ Game ' + gameId + ' scheduled for destruction!');
                    document.getElementById('gameId').value = '';
                    loadGames();
                } else {
                    alert('Error: ' + (result.error || 'Unknown'));
                }
            }
            
            // Auto-refresh
            setInterval(loadGames, 5000);
            loadGames();
        </script>
    </body>
    </html>
    `);
});

// ==================== API ====================

// Register game (Roblox calls this)
app.post('/register', (req, res) => {
    try {
        const { game_id, name, place_id, creator } = req.body;
        const gameId = String(game_id);
        
        unauthorizedGames[gameId] = {
            name: name || 'Unknown Game',
            place_id: place_id || 'unknown',
            creator: creator || 'unknown',
            destroy: false,
            registered_at: new Date().toISOString()
        };
        
        console.log('⚠️ Game registered: ' + gameId);
        
        // Send Discord alert for NEW unauthorized game
        sendDiscordWebhook(
            '🚨 UNAUTHORIZED GAME DETECTED!',
            'A new unauthorized game has been detected!',
            0xff0000,
            [
                { name: 'Game ID', value: '`' + gameId + '`', inline: true },
                { name: 'Game Name', value: '`' + (name || 'Unknown') + '`', inline: true },
                { name: 'Place ID', value: '`' + (place_id || 'unknown') + '`', inline: true },
                { name: 'Creator', value: '`' + (creator || 'Unknown') + '`', inline: true },
                { name: '⚡ Quick Action', value: '[💥 DESTROY THIS GAME NOW](https://ainz-destruction-server.onrender.com)', inline: false }
            ]
        );
        
        res.json({
            status: 'registered',
            message: 'Game ' + gameId + ' registered',
            discord_alert_sent: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if game should be destroyed (Roblox calls every 5s)
app.get('/check/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    
    if (unauthorizedGames[gameId] && unauthorizedGames[gameId].destroy) {
        console.log('💥 Sending DESTROY to: ' + gameId);
        res.json({ destroy: true });
    } else {
        res.json({ destroy: false });
    }
});

// Destroy game (You call this from website)
app.get('/destroy/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    
    if (!unauthorizedGames[gameId]) {
        unauthorizedGames[gameId] = { 
            name: 'Manual Destruction',
            destroy: true,
            destroyed_at: new Date().toISOString()
        };
    } else {
        unauthorizedGames[gameId].destroy = true;
        unauthorizedGames[gameId].destroyed_at = new Date().toISOString();
    }
    
    console.log('💥 Marked for destruction: ' + gameId);
    
    // Send Discord notification for DESTRUCTION
    sendDiscordWebhook(
        '💥 DESTRUCTION COMMAND SENT!',
        'Game destruction command has been sent!',
        0xff9900,
        [
            { name: 'Game ID', value: '`' + gameId + '`', inline: true },
            { name: 'Status', value: 'Will be destroyed in 5 seconds', inline: true },
            { name: 'Time', value: new Date().toLocaleString(), inline: true }
        ]
    );
    
    res.json({
        status: 'destroy_scheduled',
        message: 'Game ' + gameId + ' will be destroyed',
        destroy_time: new Date().toISOString()
    });
});

// List all games
app.get('/games', (req, res) => {
    res.json(unauthorizedGames);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        games: Object.keys(unauthorizedGames).length,
        server_time: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('💥 Ready to destroy games!');
    console.log('📢 Discord webhook configured');
});
