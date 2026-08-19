const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "..", "logs", "cowrie.json");

function readEvents() {
    const raw = fs.readFileSync(logPath, "utf-8");
    const lines = raw.trim().split("\n").filter(line => line.length > 0);
    return lines.map(line => JSON.parse(line));
}

function getStats() {
    const events = readEvents();

    const loginAttempts = events.filter(e =>
        e.eventid === "cowrie.login.success" || e.eventid === "cowrie.login.failed"
    );

    const successCount = events.filter(e => e.eventid === "cowrie.login.success").length;
    const failedCount = events.filter(e => e.eventid === "cowrie.login.failed").length;

    // Contar credenciais mais tentadas
    const credentialCounts = {};
    loginAttempts.forEach(e => {
        const key = `${e.username}/${e.password}`;
        credentialCounts[key] = (credentialCounts[key] || 0) + 1;
    });

    // Contar comandos mais executados
    const commandCounts = {};
    events.filter(e => e.eventid === "cowrie.command.input").forEach(e => {
        commandCounts[e.input] = (commandCounts[e.input] || 0) + 1;
    });

    // Sessões únicas (cada ligação distinta ao honeypot)
    const uniqueSessions = new Set(events.map(e => e.session)).size;

    return {
        totalEvents: events.length,
        uniqueSessions,
        successCount,
        failedCount,
        credentialCounts,
        commandCounts,
        rawEvents: events
    };
}

module.exports = { readEvents, getStats };