const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production with HTTPS
}));

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

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin-signin.html for the admin sign-in page
app.get('/admin-signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-signin.html'));
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        res.redirect('/admin-signin');
    }
}

// Serve admin.html for the admin page
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve approved events for the calendar
app.get('/events', (req, res) => {
    const approvedEvents = events.filter(event => event.status === 'approved');
    res.json(approvedEvents);
});

// Serve pending events for admin approval
app.get('/pending-events', isAuthenticated, (req, res) => {
    const pendingEvents = events.filter(event => event.status === 'pending');
    res.json(pendingEvents);
});

// Handle event submission
app.post('/submit-event', (req, res) => {
    const newEvent = req.body;
    newEvent.id = Date.now();
    newEvent.status = 'pending';
    // Store the start and end date-times as strings
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

// Handle admin sign-in (new endpoint: /signin)
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    console.log('Admin Sign-In Attempt:', username, password); // Log attempt
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        console.log('Admin authenticated successfully'); // Log success
        res.json({ success: true });
    } else {
        console.log('Invalid credentials'); // Log failure
        res.json({ success: false });
    }
});

// Approve event
app.post('/approve-event', isAuthenticated, (req, res) => {
    const eventId = req.body.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.status = 'approved';
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
app.post('/reject-event', isAuthenticated, (req, res) => {
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
