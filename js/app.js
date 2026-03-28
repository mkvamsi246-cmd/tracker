// Global App Logic

// Sidebar Toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    } else {
        sidebar.classList.add('open');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    
    // Ensure we are selecting elements that exist
    if (!sidebar || !mobileToggle) return;

    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to ensure rendering, then animate progress bars
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 100);

    // Workout Tab Switching Logic
    const tabs = document.querySelectorAll('.routine-tab');
    const sections = document.querySelectorAll('.workout-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // --- Live Tracker Logic ---
    const timerDisplay = document.getElementById('timer-display');
    const timerToggle = document.getElementById('timer-toggle');
    const timerAdd30 = document.getElementById('timer-add-30');
    const timerSkip = document.getElementById('timer-skip');
    const timerRing = document.getElementById('timer-ring');
    const timerStatus = document.getElementById('tracker-status');

    let timeLeft = 45; // Default rest time
    let startingTime = 45;
    let timerInterval = null;
    let isRunning = false;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }

        // Circular progress calculation
        if (timerRing) {
            const progress = (timeLeft / startingTime) * 100;
            const color = timeLeft <= 0 ? 'var(--danger)' : 'var(--accent-neon-green)';
            timerRing.style.background = `conic-gradient(${color} ${progress}%, rgba(255,255,255,0.05) 0)`;
        }

        if (timeLeft <= 0) {
            pauseTimer();
            if (timerStatus) timerStatus.textContent = "Rest Over!";
        }
    }

    function startTimer() {
        if (!isRunning && timeLeft > 0) {
            isRunning = true;
            timerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if (timerStatus) timerStatus.textContent = "Time to rest...";
            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
            }, 1000);
        }
    }

    function pauseTimer() {
        isRunning = false;
        if (timerToggle) timerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearInterval(timerInterval);
    }

    if (timerToggle) {
        timerToggle.addEventListener('click', () => {
            if (isRunning) pauseTimer();
            else startTimer();
        });
    }

    if (timerAdd30) {
        timerAdd30.addEventListener('click', () => {
            timeLeft += 30;
            startingTime = Math.max(startingTime, timeLeft);
            updateDisplay();
        });
    }

    if (timerSkip) {
        timerSkip.addEventListener('click', () => {
            pauseTimer();
            timeLeft = 45;
            startingTime = 45;
            if (timerStatus) timerStatus.textContent = "Ready to start?";
            updateDisplay();
        });
    }

    // Proactive: Also let play buttons in workout cards trigger the tracker
    const workoutPlayBtns = document.querySelectorAll('.workout-card .play-btn');
    workoutPlayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const workoutName = btn.parentElement.querySelector('h4').textContent;
            if (timerStatus) timerStatus.textContent = `Tracking ${workoutName}`;
            timeLeft = 45; 
            startingTime = 45;
            updateDisplay();
            startTimer();
        });
    });

    // --- Upcoming Slot Dashboard Logic ---
    const slotContainer = document.getElementById('upcoming-slot-container');
    if (slotContainer && window.location.pathname.includes('dashboard.html')) {
        updateUpcomingSlotUI();
    }

    function updateUpcomingSlotUI() {
        const slotData = JSON.parse(localStorage.getItem('upcomingSlot'));
        const container = document.getElementById('upcoming-slot-container');
        const badge = document.getElementById('slot-badge');

        if (!slotData) {
            if (badge) badge.style.display = 'none';
            container.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">No workout slot booked for today.</p>
                    <a href="booking.html" class="btn btn-primary" style="width: 100%;">Book a Slot Now</a>
                </div>
            `;
        } else {
            if (badge) badge.style.display = 'inline-block';
            
            // Check if date is today
            const today = new Date().toISOString().split('T')[0];
            const dateLabel = slotData.date === today ? 'Today' : slotData.date;
            
            container.innerHTML = `
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--radius-md); text-align: center; min-width: 80px;">
                        <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase;">${dateLabel}</div>
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent-neon-green);">${slotData.time}</div>
                    </div>
                    <div>
                        <h4 style="font-size: 18px; margin-bottom: 4px;">${slotData.zone}</h4>
                        <p style="color: var(--text-secondary); font-size: 14px;"><i class="fa-solid fa-location-dot"></i> Gym Floor</p>
                    </div>
                </div>
                <button class="btn btn-outline" style="width: 100%; margin-top: 20px;" onclick="cancelBooking()">Cancel / Reschedule</button>
            `;
        }
    }
});

// Global function to be reachable from inline onclick
function cancelBooking() {
    if (confirm('Do you want to cancel your upcoming gym slot?')) {
        localStorage.removeItem('upcomingSlot');
        location.reload();
    }
}

// ===== GYM BOOKING LOGIC =====
let selectedGym = "";
let selectedSlot = "";

const gymData = {
    "Andhra Pradesh":{
        "Visakhapatnam":["Vizag Fitness Hub","Steel Body Vizag","Beachside Gym","Muscle Garage Vizag"],
        "Vijayawada":["Krishna Fitness Club","Iron Paradise Vijayawada","Power Zone Gym","Beast Mode Fitness"],
        "Rajahmundry":["Godavari Fitness Center","Titan Strength Rajahmundry","FitLife Rajahmundry"],
        "Bhimavaram":["Flex Fitness Bhimavaram","Power Arena Gym","Iron Club Bhimavaram"],
        "Guntur":["Guntur Muscle Factory","Urban Fit Guntur","Iron Paradise Guntur"],
        "Nellore":["Nellore Fitness Hub","Titan Body Gym","Power Zone Nellore"],
        "Kakinada":["Kakinada Iron Temple","Steel Fitness Kakinada","Muscle Factory Kakinada"],
        "Tirupati":["Balaji Fitness Center","Seven Hills Gym","Iron Paradise Tirupati"],
        "Anantapur":["Rayalaseema Fitness","Iron Strength Anantapur","Urban Gym Anantapur"],
        "Kadapa":["Kadapa Power Gym","Muscle Arena Kadapa","Titan Strength Kadapa"]
    },
    "Telangana":{
        "Hyderabad":["Cult Fit Hyderabad","Gold Gym Banjara Hills","Muscle Factory Jubilee Hills","Urban Fitness Hyderabad"],
        "Warangal":["Warangal Power Gym","Titan Fitness Warangal","Urban Fit Warangal"],
        "Karimnagar":["Karimnagar Strength Club","Iron Arena Karimnagar","Power Fitness Karimnagar"],
        "Nizamabad":["Nizamabad Iron Gym","FitLife Nizamabad","Muscle Hub Nizamabad"],
        "Khammam":["Khammam Power Arena","Urban Fitness Khammam","Steel Body Khammam"],
        "Mahbubnagar":["Mahbubnagar Fitness Club","Iron Temple Mahbubnagar","Titan Gym Mahbubnagar"],
        "Ramagundam":["Ramagundam Fitness Hub","Urban Power Gym","Iron Strength Ramagundam"],
        "Adilabad":["Adilabad Muscle Factory","Power Arena Adilabad","Steel Fitness Adilabad"],
        "Siddipet":["Siddipet Strength Club","Titan Fitness Siddipet","Iron Gym Siddipet"],
        "Medak":["Medak Urban Gym","Power Fitness Medak","Muscle Arena Medak"]
    },
    "Tamil Nadu":{
        "Chennai":["Gold Gym Chennai","Marina Fitness Club","Muscle Factory Chennai","Urban Fit Chennai"],
        "Coimbatore":["Coimbatore Power Gym","Iron Temple Coimbatore","Beast Mode Fitness"],
        "Madurai":["Madurai Strength Club","Titan Fitness Madurai","Urban Fit Madurai"],
        "Salem":["Salem Iron Arena","Power Gym Salem","Muscle Factory Salem"],
        "Tiruchirappalli":["Trichy Power Gym","Urban Fitness Trichy","Titan Strength Trichy"],
        "Tirunelveli":["Nellai Fitness Hub","Iron Paradise Tirunelveli","Muscle Arena Nellai"],
        "Vellore":["Vellore Power Club","Steel Body Vellore","Urban Gym Vellore"],
        "Erode":["Erode Fitness Arena","Iron Strength Erode","Power Gym Erode"],
        "Thoothukudi":["Tuticorin Fitness Club","Urban Power Gym","Titan Strength Gym"],
        "Dindigul":["Dindigul Iron Temple","Muscle Factory Dindigul","Urban Gym Dindigul"]
    },
    "Karnataka":{
        "Bangalore":["Cult Fit Bangalore","Gold Gym Indiranagar","Muscle Factory Bangalore","Urban Fitness Bangalore"],
        "Mysore":["Royal Fitness Mysore","Iron Temple Mysore","Power Arena Mysore"],
        "Hubli":["Hubli Strength Club","Urban Gym Hubli","Titan Fitness Hubli"],
        "Mangalore":["Mangalore Muscle Hub","Beach Body Fitness","Power Gym Mangalore"],
        "Belgaum":["Belgaum Iron Arena","Urban Fit Belgaum","Titan Strength Belgaum"],
        "Gulbarga":["Gulbarga Power Club","Muscle Arena Gulbarga","Urban Fitness Gulbarga"],
        "Davanagere":["Davanagere Iron Gym","Power Fitness Davanagere","Titan Gym Davanagere"],
        "Shimoga":["Shimoga Strength Club","Urban Fit Shimoga","Iron Temple Shimoga"],
        "Tumkur":["Tumkur Power Gym","Muscle Factory Tumkur","Urban Fitness Tumkur"],
        "Udupi":["Udupi Beach Fitness","Iron Paradise Udupi","Urban Fit Udupi"]
    },
    "Maharashtra":{
        "Mumbai":["Gold Gym Mumbai","Anytime Fitness Mumbai","Muscle Factory Mumbai","Urban Fit Mumbai"],
        "Pune":["Pune Iron Paradise","Muscle Garage Pune","Power Club Pune"],
        "Nagpur":["Nagpur Fitness Hub","Titan Gym Nagpur","Urban Fit Nagpur"],
        "Nashik":["Nashik Power Arena","Iron Temple Nashik","Muscle Club Nashik"],
        "Aurangabad":["Aurangabad Fitness Club","Titan Strength Aurangabad","Urban Gym Aurangabad"],
        "Solapur":["Solapur Power Gym","Iron Club Solapur","Urban Fitness Solapur"],
        "Kolhapur":["Kolhapur Muscle Arena","Titan Gym Kolhapur","Power Club Kolhapur"],
        "Thane":["Thane Urban Gym","Power Arena Thane","Iron Temple Thane"],
        "Amravati":["Amravati Strength Gym","Urban Fit Amravati","Power Club Amravati"],
        "Nanded":["Nanded Iron Gym","Muscle Factory Nanded","Urban Fitness Nanded"]
    },
    "Kerala":{
        "Kochi":["Kochi Muscle Club","Marine Drive Fitness","Iron Temple Kochi"],
        "Trivandrum":["Trivandrum Power Fitness","Capital City Gym","Titan Strength TVM"],
        "Kozhikode":["Calicut Iron Arena","Beach Fitness Calicut","Muscle Hub Kozhikode"],
        "Thrissur":["Thrissur Fitness Factory","Urban Gym Thrissur","Iron Club Thrissur"],
        "Kannur":["Kannur Strength Gym","Titan Gym Kannur","Urban Fit Kannur"],
        "Kollam":["Kollam Power Gym","Iron Paradise Kollam","Flex Fitness Kollam"],
        "Alappuzha":["Alappuzha Beach Gym","Power Fitness Alappuzha","Titan Gym Alappuzha"],
        "Palakkad":["Palakkad Muscle Factory","Urban Gym Palakkad","Iron Arena Palakkad"],
        "Malappuram":["Malappuram Fit Club","Titan Fitness Malappuram","Power Zone Malappuram"],
        "Kottayam":["Kottayam Strength Club","Iron Temple Kottayam","Urban Fitness Kottayam"]
    },
    "Gujarat":{
        "Ahmedabad":["Ahmedabad Iron Temple","Power Gym Ahmedabad","Urban Fit Ahmedabad"],
        "Surat":["Surat Fitness Hub","Muscle Arena Surat","Titan Gym Surat"],
        "Vadodara":["Vadodara Strength Club","Iron Gym Vadodara","Power Arena Vadodara"],
        "Rajkot":["Rajkot Muscle Factory","Urban Gym Rajkot","Titan Strength Rajkot"],
        "Bhavnagar":["Bhavnagar Fitness Hub","Iron Paradise Bhavnagar","Power Club Bhavnagar"],
        "Jamnagar":["Jamnagar Steel Gym","Urban Fitness Jamnagar","Titan Gym Jamnagar"],
        "Junagadh":["Junagadh Strength Gym","Muscle Club Junagadh","Iron Temple Junagadh"],
        "Gandhinagar":["Capital Fitness Gandhinagar","Urban Gym Gandhinagar","Power Gym Gandhinagar"],
        "Anand":["Anand Muscle Hub","Titan Fitness Anand","Iron Arena Anand"],
        "Navsari":["Navsari Power Club","Urban Gym Navsari","Titan Gym Navsari"]
    },
    "Rajasthan":{
        "Jaipur":["Jaipur Royal Fitness","Pink City Gym","Titan Strength Jaipur"],
        "Udaipur":["Lake City Fitness","Iron Temple Udaipur","Urban Gym Udaipur"],
        "Jodhpur":["Blue City Gym","Power Club Jodhpur","Titan Gym Jodhpur"],
        "Kota":["Kota Fitness Arena","Iron Paradise Kota","Urban Gym Kota"],
        "Bikaner":["Bikaner Strength Club","Power Gym Bikaner","Iron Arena Bikaner"],
        "Ajmer":["Ajmer Fitness Hub","Titan Strength Ajmer","Urban Gym Ajmer"],
        "Alwar":["Alwar Muscle Club","Iron Gym Alwar","Power Zone Alwar"],
        "Bharatpur":["Bharatpur Fitness Arena","Urban Gym Bharatpur","Iron Temple Bharatpur"],
        "Sikar":["Sikar Strength Club","Titan Gym Sikar","Urban Fit Sikar"],
        "Pali":["Pali Fitness Hub","Iron Club Pali","Power Gym Pali"]
    },
    "West Bengal":{
        "Kolkata":["Kolkata Muscle Factory","Howrah Bridge Fitness","Urban Gym Kolkata"],
        "Howrah":["Howrah Strength Club","Iron Temple Howrah","Titan Gym Howrah"],
        "Durgapur":["Durgapur Fitness Arena","Power Gym Durgapur","Iron Club Durgapur"],
        "Asansol":["Asansol Strength Club","Titan Fitness Asansol","Urban Gym Asansol"],
        "Siliguri":["Siliguri Fitness Hub","Iron Temple Siliguri","Urban Gym Siliguri"],
        "Bardhaman":["Bardhaman Strength Club","Power Gym Bardhaman","Titan Gym Bardhaman"],
        "Kharagpur":["Kharagpur Fitness Arena","Iron Club Kharagpur","Urban Gym Kharagpur"],
        "Haldia":["Haldia Strength Gym","Power Club Haldia","Urban Fitness Haldia"],
        "Malda":["Malda Fitness Hub","Iron Arena Malda","Titan Gym Malda"],
        "Raiganj":["Raiganj Strength Club","Urban Gym Raiganj","Power Gym Raiganj"]
    },
    "Punjab":{
        "Ludhiana":["Ludhiana Muscle Factory","Titan Strength Ludhiana","Urban Gym Ludhiana"],
        "Amritsar":["Golden Temple Fitness","Iron Paradise Amritsar","Power Gym Amritsar"],
        "Jalandhar":["Jalandhar Fitness Hub","Urban Gym Jalandhar","Titan Gym Jalandhar"],
        "Patiala":["Patiala Strength Club","Iron Temple Patiala","Urban Gym Patiala"],
        "Bathinda":["Bathinda Fitness Arena","Titan Gym Bathinda","Power Club Bathinda"],
        "Mohali":["Mohali Fitness Hub","Urban Gym Mohali","Titan Gym Mohali"],
        "Hoshiarpur":["Hoshiarpur Strength Club","Iron Gym Hoshiarpur","Urban Gym Hoshiarpur"],
        "Pathankot":["Pathankot Fitness Arena","Power Gym Pathankot","Titan Gym Pathankot"],
        "Moga":["Moga Strength Club","Urban Gym Moga","Iron Temple Moga"],
        "Firozpur":["Firozpur Fitness Hub","Power Gym Firozpur","Titan Gym Firozpur"]
    },
    "Haryana":{
        "Gurgaon":["Cyber City Fitness","Iron Paradise Gurgaon","Urban Gym Gurgaon"],
        "Faridabad":["Faridabad Fitness Arena","Titan Gym Faridabad","Power Gym Faridabad"],
        "Panipat":["Panipat Strength Club","Urban Gym Panipat","Iron Club Panipat"],
        "Ambala":["Ambala Fitness Hub","Titan Gym Ambala","Urban Gym Ambala"],
        "Hisar":["Hisar Strength Club","Iron Paradise Hisar","Urban Gym Hisar"],
        "Rohtak":["Rohtak Fitness Arena","Power Club Rohtak","Titan Gym Rohtak"],
        "Karnal":["Karnal Strength Club","Iron Temple Karnal","Urban Gym Karnal"],
        "Sonipat":["Sonipat Fitness Hub","Power Gym Sonipat","Titan Gym Sonipat"],
        "Yamunanagar":["Yamunanagar Fitness Arena","Iron Club Yamunanagar","Urban Gym Yamunanagar"],
        "Bhiwani":["Bhiwani Strength Club","Power Gym Bhiwani","Titan Gym Bhiwani"]
    },
    "Uttar Pradesh":{
        "Lucknow":["Lucknow Royal Fitness","Iron Paradise Lucknow","Urban Gym Lucknow"],
        "Noida":["Noida Fitness Hub","Power Gym Noida","Titan Gym Noida"],
        "Kanpur":["Kanpur Strength Club","Iron Temple Kanpur","Urban Gym Kanpur"],
        "Varanasi":["Varanasi Fitness Arena","Power Club Varanasi","Titan Gym Varanasi"],
        "Agra":["Agra Strength Club","Urban Gym Agra","Iron Paradise Agra"],
        "Prayagraj":["Prayagraj Fitness Hub","Power Gym Prayagraj","Titan Gym Prayagraj"],
        "Ghaziabad":["Ghaziabad Strength Club","Urban Gym Ghaziabad","Iron Club Ghaziabad"],
        "Meerut":["Meerut Fitness Arena","Power Club Meerut","Titan Gym Meerut"],
        "Bareilly":["Bareilly Strength Club","Urban Gym Bareilly","Iron Paradise Bareilly"],
        "Aligarh":["Aligarh Fitness Hub","Power Gym Aligarh","Titan Gym Aligarh"]
    },
    "Madhya Pradesh":{
        "Indore":["Indore Muscle Factory","Titan Strength Indore","Urban Gym Indore"],
        "Bhopal":["Bhopal Fitness Hub","Iron Paradise Bhopal","Urban Gym Bhopal"],
        "Gwalior":["Gwalior Strength Club","Power Gym Gwalior","Titan Gym Gwalior"],
        "Jabalpur":["Jabalpur Fitness Arena","Urban Gym Jabalpur","Iron Club Jabalpur"],
        "Ujjain":["Ujjain Strength Club","Titan Gym Ujjain","Power Club Ujjain"],
        "Sagar":["Sagar Fitness Hub","Urban Gym Sagar","Iron Temple Sagar"],
        "Satna":["Satna Strength Club","Power Gym Satna","Titan Gym Satna"],
        "Ratlam":["Ratlam Fitness Arena","Urban Gym Ratlam","Iron Club Ratlam"],
        "Rewa":["Rewa Strength Club","Power Gym Rewa","Titan Gym Rewa"],
        "Dewas":["Dewas Fitness Hub","Urban Gym Dewas","Iron Temple Dewas"]
    },
    "Odisha":{
        "Bhubaneswar":["Temple City Fitness","Iron Paradise Bhubaneswar","Urban Gym Bhubaneswar"],
        "Cuttack":["Cuttack Fitness Arena","Power Gym Cuttack","Titan Gym Cuttack"],
        "Rourkela":["Rourkela Strength Club","Urban Gym Rourkela","Iron Temple Rourkela"],
        "Puri":["Puri Beach Fitness","Power Club Puri","Titan Gym Puri"],
        "Sambalpur":["Sambalpur Fitness Hub","Urban Gym Sambalpur","Iron Club Sambalpur"],
        "Berhampur":["Berhampur Strength Club","Power Gym Berhampur","Titan Gym Berhampur"],
        "Balasore":["Balasore Fitness Arena","Urban Gym Balasore","Iron Temple Balasore"],
        "Baripada":["Baripada Strength Club","Power Gym Baripada","Titan Gym Baripada"],
        "Jharsuguda":["Jharsuguda Fitness Hub","Urban Gym Jharsuguda","Iron Club Jharsuguda"],
        "Angul":["Angul Strength Club","Power Gym Angul","Titan Gym Angul"]
    },
    "Bihar":{
        "Patna":["Patna Fitness Hub","Iron Paradise Patna","Urban Gym Patna"],
        "Gaya":["Gaya Strength Club","Power Gym Gaya","Titan Gym Gaya"],
        "Bhagalpur":["Bhagalpur Fitness Arena","Urban Gym Bhagalpur","Iron Temple Bhagalpur"],
        "Muzaffarpur":["Muzaffarpur Strength Club","Power Gym Muzaffarpur","Titan Gym Muzaffarpur"],
        "Darbhanga":["Darbhanga Fitness Hub","Urban Gym Darbhanga","Iron Club Darbhanga"],
        "Purnia":["Purnia Strength Club","Power Gym Purnia","Titan Gym Purnia"],
        "Arrah":["Arrah Fitness Arena","Urban Gym Arrah","Iron Temple Arrah"],
        "Begusarai":["Begusarai Strength Club","Power Gym Begusarai","Titan Gym Begusarai"],
        "Katihar":["Katihar Fitness Hub","Urban Gym Katihar","Iron Club Katihar"],
        "Munger":["Munger Strength Club","Power Gym Munger","Titan Gym Munger"]
    }
};

// Initialize gym booking on page load
function initGymBooking() {
    const stateDropdown = document.getElementById("state");
    if (!stateDropdown) return;

    for (let state in gymData) {
        let option = document.createElement("option");
        option.text = state;
        option.value = state;
        stateDropdown.appendChild(option);
    }

    // Setup time slot listeners
    const slots = document.querySelectorAll(".time-slot");
    slots.forEach(slot => {
        slot.addEventListener("click", function() {
            if(this.classList.contains('full')) return;
            slots.forEach(s => {
                if(!s.classList.contains('full')) s.classList.remove("selected");
            });
            this.classList.add("selected");
            selectedSlot = this.innerText.split('\n')[0].trim();
            const timeDisplay = document.getElementById('selected-time-display');
            if (timeDisplay) timeDisplay.textContent = selectedSlot;
        });
    });
}

// Populate cities dropdown based on selected state
function populateCities() {
    const state = document.getElementById("state").value;
    const cityDropdown = document.getElementById("city");
    cityDropdown.innerHTML = '<option value="">Select City</option>';
    document.getElementById("gyms").innerHTML = '';

    if(state) {
        for(let city in gymData[state]) {
            let option = document.createElement("option");
            option.text = city;
            option.value = city;
            cityDropdown.appendChild(option);
        }
    }
}

// Display available gyms based on selected city
function showGyms() {
    const state = document.getElementById("state").value;
    const city = document.getElementById("city").value;
    const gyms = gymData[state][city];
    const gymDiv = document.getElementById("gyms");

    if(!gyms) return;

    gymDiv.innerHTML = "<p style='color: var(--text-secondary); font-size: 12px; margin-bottom: 12px; text-transform: uppercase;'>Available Gyms</p>";

    gyms.forEach(gym => {
        let div = document.createElement("div");
        div.className = "gym";
        div.style.cssText = "padding: 12px; margin-bottom: 8px; border-radius: var(--radius-md); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all var(--transition-fast);";
        div.innerText = gym;

        div.onclick = function() {
            document.querySelectorAll("#gyms .gym").forEach(el => {
                el.style.borderColor = "rgba(255,255,255,0.1)";
                el.style.background = "rgba(255,255,255,0.05)";
            });
            div.style.borderColor = "var(--accent-neon-purple)";
            div.style.background = "rgba(176, 38, 255, 0.1)";
            selectedGym = gym;
            const gymName = document.getElementById('selected-gym-name');
            if (gymName) gymName.textContent = gym;
        };
        gymDiv.appendChild(div);
    });
}

// Confirm booking
function confirmBooking(btn) {
    if(selectedGym == "" || selectedSlot == "") {
        alert("Please select a gym and time slot!");
        return;
    }

    const bookingData = {
        zone: selectedGym,
        time: selectedSlot,
        date: document.querySelector('input[type="date"]').value,
        status: 'CONFIRMED'
    };

    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> PROCESSING...';
    btn.style.opacity = '0.8';

    setTimeout(() => {
        localStorage.setItem('upcomingSlot', JSON.stringify(bookingData));
        btn.innerHTML = 'BOOKED SUCCESSFULLY! <i class="fa-solid fa-check-circle"></i>';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 0 20px var(--success)';
        btn.style.opacity = '1';

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

// Initialize booking on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only init if on booking page
    if (window.location.pathname.includes('booking.html')) {
        initGymBooking();
    }

    // Initialize meal date field
    if (document.getElementById('mealDate')) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('mealDate').value = today;
    }
});


// ===== DIET & NUTRITION TRACKER =====

const foodDatabase = {
    "Idli": [120, "4g", "24g", "1g", "B"],
    "Dosa": [150, "3g", "20g", "5g", "B"],
    "Upma": [180, "5g", "30g", "6g", "B"],
    "Poha": [160, "4g", "28g", "4g", "B"],
    "Oats": [170, "6g", "29g", "3g", "B"],
    "Chapati": [120, "3g", "18g", "2g", "B"],
    "Rice": [200, "4g", "45g", "1g", "B"],
    "Dal": [150, "8g", "20g", "2g", "B"],
    "Paneer": [265, "18g", "6g", "20g", "A"],
    "Curd": [98, "5g", "11g", "4g", "B"],
    "Milk": [110, "8g", "12g", "4g", "D"],
    "Banana": [105, "1g", "27g", "0g", "C"],
    "Apple": [95, "0g", "25g", "0g", "C"],
    "Orange": [62, "1g", "15g", "0g", "C"],
    "Mango": [99, "1g", "25g", "0g", "A"],
    "Papaya": [59, "1g", "15g", "0g", "C"],
    "Watermelon": [45, "1g", "11g", "0g", "A"],
    "Carrot": [41, "1g", "10g", "0g", "A"],
    "Broccoli": [55, "4g", "11g", "1g", "C"],
    "Spinach": [23, "3g", "4g", "0g", "A"],
    "Tomato": [22, "1g", "5g", "0g", "C"],
    "Cucumber": [16, "1g", "4g", "0g", "C"],
    "Potato": [163, "4g", "37g", "0g", "C"],
    "Sweet Potato": [180, "4g", "41g", "0g", "A"],
    "Peanuts": [567, "26g", "16g", "49g", "E"],
    "Almonds": [579, "21g", "22g", "50g", "E"],
    "Cashews": [553, "18g", "30g", "44g", "E"],
    "Walnuts": [654, "15g", "14g", "65g", "E"],
    "Chickpeas": [164, "9g", "27g", "3g", "B"],
    "Kidney Beans": [127, "9g", "22g", "1g", "B"]
};

let mealData = {
    Breakfast: [],
    Lunch: [],
    Dinner: []
};

function addFood() {
    const foodInput = document.getElementById("foodSearch").value.trim();
    const mealType = document.getElementById("mealType").value;

    if (!foodInput) {
        alert("Please enter a food name");
        return;
    }

    let foodFound = null;

    // Search for food in database (case-insensitive partial match)
    for (let food in foodDatabase) {
        if (food.toLowerCase().includes(foodInput.toLowerCase())) {
            foodFound = food;
            break;
        }
    }

    if (!foodFound) {
        alert("Food not found in database. Try: Banana, Rice, Paneer, etc.");
        return;
    }

    const foodData = foodDatabase[foodFound];
    const calories = foodData[0];
    const protein = foodData[1];
    const carbs = foodData[2];
    const fats = foodData[3];
    const vitamin = foodData[4];

    if (!mealData[mealType]) {
        mealData[mealType] = [];
    }

    mealData[mealType].push({
        name: foodFound,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats,
        vitamin: vitamin
    });

    document.getElementById("foodSearch").value = "";
    updateMealDisplay(mealType);
}

function updateMealDisplay(mealType) {
    const container = document.getElementById(mealType.toLowerCase() + "Container");
    const caloriesDisplay = document.getElementById(mealType.toLowerCase() + "Calories");

    if (!mealData[mealType] || mealData[mealType].length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">No foods added yet</div>';
        caloriesDisplay.textContent = "0 kcal";
        return;
    }

    let totalCalories = 0;
    let html = "";

    mealData[mealType].forEach((food, index) => {
        totalCalories += food.calories;
        html += `
            <div class="food-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);">
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 4px;">${food.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">P: ${food.protein} | C: ${food.carbs} | F: ${food.fats}</div>
                </div>
                <div style="text-align: right; min-width: 100px;">
                    <div style="font-weight: 600; color: var(--accent-neon-green);">${food.calories} kcal</div>
                    <button onclick="removeFood('${mealType}', ${index})" style="font-size: 12px; color: var(--danger); background: none; border: none; cursor: pointer; margin-top: 4px;"><i class="fa-solid fa-trash"></i> Remove</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    caloriesDisplay.textContent = totalCalories + " kcal";
}

function removeFood(mealType, index) {
    mealData[mealType].splice(index, 1);
    updateMealDisplay(mealType);
}
