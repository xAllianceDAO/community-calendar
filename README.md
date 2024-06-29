# MVX_Community_Calender
A Shared calender for the MultiversX community

This Repo currently includes a working local hosted community calender allowing for people to view events upcoming. It also allows anyone to submit an event, however, the event must be approved by an admin of the calender (an xAlliance member to begin with). This is done to prevent spam, misuse, or bad links from being included.

It is important to note, this is a basic first version of the product. A lot more will need to be done for the final product.

The Home page ("index.html") is the Calender itself where users can see the upcoming events and interact with them to see further information or obtain a link for the event.
On this home page there is also a permissionless "Add Event" button that allows anyone to submit an event to the calender for others to see. Once submitted the event goes through an approval process to the admins of the page. If accepted, the event will then show up on the main calender.

If an admin would like to login they can press the Admin button on the main page. This will redirect them to the "Admin-Signin" page, where they need to fill in login details. If the correct login details are entered they are redirected to the "Admin" page. On the Admin Page they can see a simple table of pending event submissions, where the admin can approve or reject them. If rejected the event stays in the database but does not show up on the calender.

At all stages there is a "back to calender" button to allow people to go back to the main page.

What the Files do:
-index.html (Main page with the calender, modals, adding a new event button, and admin login button)
-scripts.js (Where the majority of scripts written in Javascript are kept. These make the calender interactive, determine how the data is formed, and how an event is submitted)
-server.js (Where all the API endpoints are created, in Node and Express js)
-styles.css (All of the design)
-events.json (Where all the data of events in the calender is stored in a json format)
-admin.js (Scripts for the Admin Page)
-admin.html (Admin page)
-admin-signin.html (Admin Signin portal, with script for sign in functionality)
-.env (Where the Admin Password is stored)

Improvements needed:
1) The calender should use a dynamic timezone system, where it translates event times into your local timezone, and can specify when adding an event what timezone you are in.
2) Need to add cookie functionality into the site
3) A better design for the pages
4) The Calender should be able to be integrated into your Google Calender where wanted (Allowing for reminders of events to people)
5) Or the calender could connect to an email, X account, etc to be able to send reminders for events independently

 Potential Vision in the Future:
 - The calender could even allow people to sign in using their Google account, select the type of events they want to be kept up to date with, and Profile they want to follow (that regularly posts events).
 - We could connect MultiversX wallets to the calender, allowing for rewards to people that attended (monitored manually by the event organiser, or potentially using X APIs, etc)
