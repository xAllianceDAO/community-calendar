document.addEventListener('DOMContentLoaded', () => {
    fetch('/pending-events')
        .then(response => response.json())
        .then(events => {
            const tableBody = document.querySelector('#pending-events-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${event.name}</td>
                    <td>${event.eventName}</td>
                    <td>${event.date}</td>
                    <td>${event.startTime}</td>
                    <td>${event.endTime}</td>
                    <td>${event.type}</td>
                    <td><a href="${event.link}" target="_blank">${event.link}</a></td>
                    <td>${event.description}</td>
                    <td>
                        <button onclick="approveEvent(${event.id})">Approve</button>
                        <button onclick="rejectEvent(${event.id})">Reject</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
});

function approveEvent(eventId) {
    fetch('/approve-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert('Error approving event');
        }
    });
}

function rejectEvent(eventId) {
    fetch('/reject-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert('Error rejecting event');
        }
    });
}
