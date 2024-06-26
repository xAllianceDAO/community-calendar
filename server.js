const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Path to events.json
const eventsFilePath = path.join(__dirname, 'events.json');

// Load events from JSON file or initialize as an empty array
let events;
try {
    events = require(eventsFilePath);
    if (!Array.isArray(events)) {
        events = [];
    }
} catch (error) {
    events = [];
}

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin.html for the admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve approved events for the calendar
app.get('/events', (req, res) => {
    const approvedEvents = events.filter(event => event.status === 'approved');
    res.json(approvedEvents);
});

// Serve pending events for admin approval
app.get('/pending-events', (req, res) => {
    const pendingEvents = events.filter(event => event.status === 'pending');
    res.json(pendingEvents);
});

// Handle event submission
app.post('/submit-event', (req, res) => {
    const newEvent = req.body;
    newEvent.id = Date.now();
    newEvent.status = 'pending';
    newEvent.title = newEvent.eventName; // Ensure the title is set correctly
    events.push(newEvent);
    fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

// Approve event
app.post('/approve-event', (req, res) => {
    const eventId = req.body.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.status = 'approved';
        event.start = `${event.date}T${event.startTime}`;
        event.end = `${event.date}T${event.endTime}`;
        event.title = event.eventName; // Ensure the title is set correctly
        delete event.date;
        delete event.startTime;
        delete event.endTime;
        fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.json({ success: false });
            } else {
                res.json({ success: true });
            }
        });
    } else {
        res.json({ success: false });
    }
});

// Reject event
app.post('/reject-event', (req, res) => {
    const eventId = req.body.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.status = 'rejected';
        fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.json({ success: false });
            } else {
                res.json({ success: true });
            }
        });
    } else {
        res.json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
