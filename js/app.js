
//Front Seat - Taxi Payment Tracker// 


// F1: Routes stored in an array of objects
const routes = [
    {
        name: "Durban to La Lucia",
        fare: 20
    },
    {
        name: "Durban to Umhlanga",
        fare: 25
    },
    {
        name: "Umhlanga to Durban North",
        fare: 30
    }
];


// Store all payments
let payments = [];


// Get HTML elements
const routeSelect = document.getElementById("routeSelect");
const fareDisplay = document.getElementById("fareDisplay");

const paymentForm = document.getElementById("paymentForm");
const rowSelect = document.getElementById("rowSelect");
const peopleInput = document.getElementById("peopleInput");
const amountInput = document.getElementById("amountInput");

const paymentAlert = document.getElementById("paymentAlert");
const changeList = document.getElementById("changeList");
const paymentList = document.getElementById("paymentList");

const seatsPaid = document.getElementById("seatsPaid");
const seatsLeft = document.getElementById("seatsLeft");
const totalFares = document.getElementById("totalFares");
const totalChange = document.getElementById("totalChange");
const fullMessage = document.getElementById("fullMessage");


// F1: Build route dropdown using JavaScript
routes.forEach(function(route) {

    const option = document.createElement("option");

    option.value = route.name;
    option.textContent = route.name;

    routeSelect.appendChild(option);
});


// F1: Show fare when route is selected
routeSelect.addEventListener("change", function() {

    const selectedRoute = routes.find(function(route) {
        return route.name === routeSelect.value;
    });

    if (selectedRoute) {
        fareDisplay.textContent = "R" + selectedRoute.fare;
    } else {
        fareDisplay.textContent = "R0";
    }
});


// F2 + F3: Record payment and validate input
paymentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Clear previous alert
    paymentAlert.innerHTML = "";

    const selectedRoute = routes.find(function(route) {
        return route.name === routeSelect.value;
    });

    const row = rowSelect.value;
    const people = Number(peopleInput.value);
    const amountGiven = Number(amountInput.value);


    // F3: Validate route
    if (!selectedRoute) {
        showError("Please select a route.");
        return;
    }


    // F3: Validate row
    if (row === "") {
        showError("Please select a row.");
        return;
    }


    // F3: Validate number of people
    if (peopleInput.value === "" || people <= 0) {
        showError("Number of people must be greater than 0.");
        return;
    }


    // F3: Validate amount
    if (amountInput.value === "" || amountGiven <= 0) {
        showError("Amount handed over must be greater than 0.");
        return;
    }


    // Calculate amount due
    const amountDue = selectedRoute.fare * people;


    // F3: Check if payment is enough
    if (amountGiven < amountDue) {
        showError(
            "Amount handed over is not enough. Amount due is R" +
            amountDue + "."
        );
        return;
    }


    // Calculate current seats
    const currentSeats = payments.reduce(function(total, payment) {
        return total + payment.people;
    }, 0);


    // F3: Check 15-seat capacity
    if (currentSeats + people > 15) {
        showError(
            "This payment exceeds the 15-seat taxi capacity. " +
            (15 - currentSeats) + " seat(s) remaining."
        );
        return;
    }


    // Calculate change
    const change = amountGiven - amountDue;


    // Create payment object
    const payment = {
        route: selectedRoute.name,
        fare: selectedRoute.fare,
        row: row,
        people: people,
        amountGiven: amountGiven,
        amountDue: amountDue,
        change: change,
        changeGiven: change === 0
    };


    // Add payment to list
    payments.push(payment);


    // Update the screen
    updateSummary();
    updateChangeList();
    updatePaymentList();


    // Success message
    paymentAlert.innerHTML = `
        <div class="alert alert-success">
            Payment recorded successfully.
        </div>
    `;


    // Clear the form
    paymentForm.reset();
    fareDisplay.textContent = "R0";
});


// Show Bootstrap error alert
function showError(message) {

    paymentAlert.innerHTML = `
        <div class="alert alert-danger">
            ${message}
        </div>
    `;
}


// F4: Display change owed
function updateChangeList() {

    const unpaidChange = payments.filter(function(payment) {
        return payment.change > 0 && payment.changeGiven === false;
    });


    if (unpaidChange.length === 0) {

        changeList.innerHTML = `
            <p class="text-muted mb-0">
                No change owed yet.
            </p>
        `;

        return;
    }


    changeList.innerHTML = "";


    unpaidChange.forEach(function(payment) {

        const item = document.createElement("div");

        item.className = "alert alert-warning d-flex justify-content-between align-items-center";


        item.innerHTML = `
            <span>
                <strong>${payment.row}</strong>
                - Change owed: <strong>R${payment.change}</strong>
            </span>

            <button
                class="btn btn-success btn-sm"
                onclick="giveChange(${payments.indexOf(payment)})">
                Change given
            </button>
        `;


        changeList.appendChild(item);
    });
}


// F4: Mark change as given
function giveChange(paymentIndex) {

    payments[paymentIndex].changeGiven = true;

    updateChangeList();
    updateSummary();
    updatePaymentList();
}


// F5: Update trip summary
function updateSummary() {

    // Calculate seats
    const paidSeats = payments.reduce(function(total, payment) {
        return total + payment.people;
    }, 0);


    // Calculate seats left
    const remainingSeats = 15 - paidSeats;


    // Calculate total fares
    const faresCollected = payments.reduce(function(total, payment) {
        return total + payment.amountDue;
    }, 0);


    // Calculate outstanding change
    const changeStillOwed = payments.reduce(function(total, payment) {

        if (!payment.changeGiven) {
            return total + payment.change;
        }

        return total;

    }, 0);


    // Display summary
    seatsPaid.textContent = paidSeats + " / 15";
    seatsLeft.textContent = remainingSeats;
    totalFares.textContent = "R" + faresCollected;
    totalChange.textContent = "R" + changeStillOwed;


    // F5: Taxi full message
    if (paidSeats === 15) {

        fullMessage.innerHTML = `
            <div class="alert alert-success text-center">
                <strong>Taxi full, let's go!</strong>
            </div>
        `;

    } else {

        fullMessage.innerHTML = "";
    }
}


// Display payment history
function updatePaymentList() {

    if (payments.length === 0) {

        paymentList.innerHTML = `
            <p class="text-muted mb-0">
                No payments recorded yet.
            </p>
        `;

        return;
    }


    paymentList.innerHTML = "";


    payments.forEach(function(payment) {

        const item = document.createElement("div");

        item.className = "border rounded p-3 mb-2";


        let changeStatus;

        if (payment.change === 0) {
            changeStatus = "No change";
        } else if (payment.changeGiven) {
            changeStatus = "Change given";
        } else {
            changeStatus = "Change owed";
        }


        item.innerHTML = `
            <strong>{payment.row}</strong><br>
            Route: {payment.route}<br>
            People: {payment.people}<br>
            Amount given: R{payment.amountGiven}<br>
            Amount due: R{payment.amountDue}<br>
            Change: R{payment.change}<br>
            Status: {changeStatus}
        `;


        paymentList.appendChild(item);
    });
}