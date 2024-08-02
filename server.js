const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const supa = require('@supabase/supabase-js');
const axios = require('axios');
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

// Supabase Client
const supabase = supa.createClient(process.env.SUPABASE_DOMAIN, process.env.SUPABASE_KEY)

// Path to events.json
const eventsFilePath = path.join(__dirname, 'events.json');

let events = [];

// Fetch events from Supabase and store them in the global variable
async function fetchEvents() {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*');

        if (error) {
            console.error('Error fetching events:', error);
        } else {
            events = data;
            
        }
    } catch (err) {
        console.error('Unexpected error fetching events:', err);
    }
}

async function addEvent(event, provider) {
    let startDate = new Date(event.datetime_utc);
    let endDate = new Date(startDate); 

    endDate.setDate(startDate.getDate() + 1);

    const { error } = await supabase
        .from('events')
        .insert({
            eventName: event.title,
            description: event.description,
            link: event.link,
            type: event.category,
            status: 'approved',
            startDateTime: startDate.toISOString(), 
            endDateTime: endDate.toISOString(),     
            provider: provider,
        });

    if (error) {
        console.error('Error inserting event:', error);
    }
}

async function removeNFTSCEvents() {
    const { error } = await supabase
    .from('events')
    .delete()
    .eq('provider', 'NFTSC')
    console.log(`Deleted old NFT Social Club Events`)
};

async function queryNFTSC() {
    const nftSCApiUrl = process.env.NFTSC_DOMAIN;

    await removeNFTSCEvents();

    try {
        const response = await axios.get(nftSCApiUrl);
        const eventData = response.data;
        for (const event of eventData.data) {
            await addEvent(event, 'NFTSC');
            console.log(`Adding ${event.title}`)
        }

        
    } catch (error) {
        console.error('Error fetching events from NFTSC:', error);
    }
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
    fetchEvents();
    res.json(events);
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


queryNFTSC();
setInterval(queryNFTSC, 6 * 3600 * 1000);