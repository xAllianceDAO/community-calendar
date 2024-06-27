document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dayMaxEventRows: 3, // Limit to 3 events per day
        views: {
            dayGridMonth: {
                dayMaxEventRows: 3, // Limits the number of events displayed per day
            }
        },
        eventLimit: true,
        moreLinkClick: 'popover', // Show events in a popover when "+ more" is clicked
        events: (fetchInfo, successCallback, failureCallback) => {
            fetch('/events')
                .then(response => response.json())
                .then(events => {
                    const formattedEvents = events.map(event => ({
                        title: event.eventName,
                        start: event.startDateTime,
                        end: event.endDateTime,
                        extendedProps: {
                            description: event.description,
                            link: event.link,
                            type: event.type,
                            name: event.name
                        }
                    }));
                    successCallback(formattedEvents);
                })
                .catch(error => failureCallback(error));
        },
        eventContent: function(arg) {
            const title = arg.event.title || arg.event.extendedProps.eventName;
            const truncatedTitle = title.length > 12 ? title.substring(0, 12) + '...' : title;
            return { html: `<div>${truncatedTitle}</div>` };
        },
        eventClick: function(info) {
            const eventTitle = info.event.title || info.event.extendedProps.eventName;
            const eventDetails = `
                <h2><strong>${eventTitle}</strong></h2>
                <p><strong>Date:</strong> ${new Date(info.event.start).toDateString()}</p>
                <p><strong>Time:</strong> ${new Date(info.event.start).toLocaleTimeString()} - ${new Date(info.event.end).toLocaleTimeString()}</p>
                <p><strong>Type:</strong> ${info.event.extendedProps.type}</p>
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

    document.getElementById('admin-sign-in-button').addEventListener('click', () => {
        window.location.href = './admin-signin.html';
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

    // Combine date and time into ISO strings
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    const eventData = {
        ...formData,
        startDateTime: startDateTime,
        endDateTime: endDateTime
    };

    fetch('/submit-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for submitting your event, an admin will approve it soon.');
            document.getElementById('event-form').reset();
            document.getElementById('event-modal').style.display = 'none';
            window.location.reload();
        } else {
            alert('Error submitting event');
        }
    });
}
