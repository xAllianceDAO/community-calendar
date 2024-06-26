document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: '/events',
        eventTimeFormat: { // Display time with event title
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        eventContent: function(arg) { // Custom content for events
            const timeText = arg.timeText;
            const title = arg.event.title || arg.event.extendedProps.eventName;
            const duration = ` (${arg.event.start.toTimeString().slice(0, 5)} - ${arg.event.end ? arg.event.end.toTimeString().slice(0, 5) : ''})`;
            return { html: `<div>${title}${duration}</div>` };
        },
        eventClick: function(info) {
            const eventTitle = info.event.title || info.event.extendedProps.eventName;
            const eventDetails = `
                <h2><strong>${eventTitle}</strong></h2>
                <p><strong>Date:</strong> ${info.event.start.toDateString()}</p>
                <p><strong>Time:</strong> ${info.event.start.toTimeString().slice(0, 5)} - ${info.event.end ? info.event.end.toTimeString().slice(0, 5) : ''}</p>
                <p><strong>Link:</strong> <a href="${info.event.extendedProps.link}" target="_blank">${info.event.extendedProps.link}</a></p>
                <p><strong>Description:</strong> ${info.event.extendedProps.description}</p>
            `;
            document.getElementById('event-details').innerHTML = eventDetails;
            document.getElementById('event-details-modal').style.display = 'block';
        }
    });
    calendar.render();

    document.getElementById('add-event-button').addEventListener('click', () => {
        document.getElementById('event-modal').style.display = 'block';
    });

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.parentElement.parentElement.style.display = 'none';
        });
    });

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    document.getElementById('event-form').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        eventName: document.getElementById('event-name').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        type: document.getElementById('type').value,
        link: document.getElementById('link').value,
        description: document.getElementById('description').value,
    };

    fetch('/submit-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for submitting your event.');
            document.getElementById('event-form').reset();
            document.getElementById('event-modal').style.display = 'none';
            window.location.reload();
        } else {
            alert('Error submitting event');
        }
    });
}
