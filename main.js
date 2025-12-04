function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuButton = document.querySelector(".menu-button");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (window.innerWidth <= 992) {
    menuButton.style.display = sidebar.classList.contains("active")
      ? "none"
      : "block";
  }
}

function toggleSidebarIfMobile() {
  if (window.innerWidth <= 992) {
    toggleSidebar();
  }
}

let students = JSON.parse(localStorage.getItem("studentsDB") || "[]");
if (students.length === 0) {
  students = [
    { name: "Ali", roll: "101" },
    { name: "Hamza", roll: "102" },
    { name: "Ahmed", roll: "103" },
    { name: "Aisha", roll: "104" },
  ];
  localStorage.setItem("studentsDB", JSON.stringify(students));
}

function loadDays() {
  let dayDropdown = document.getElementById("daySelect");
  let statusDropdown = document.getElementById("statusDaySelect");
  dayDropdown.innerHTML = "";
  statusDropdown.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    dayDropdown.innerHTML += `<option value="${i}">Day ${i}</option>`;
    statusDropdown.innerHTML += `<option value="${i}">Day ${i}</option>`;
  }
  loadAttendanceUI();
  checkStatus();
}

function loadAttendanceUI() {
  let container = document.getElementById("attendanceList");
  container.innerHTML = "";
  let day = document.getElementById("daySelect").value || "1";
  let attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceDB") || "{}"
  );
  let saved = attendanceRecords[day] || [];
  if (students.length === 0) {
    container.innerHTML =
      "<p class='text-center text-muted p-4'>No students found. Use 'Add Student' button.</p>";
    return;
  }
  students.forEach((s) => {
    let record = saved.find((r) => r.roll === s.roll);
    let selected = record ? record.present : "";

    let cardClass = "";
    if (selected === "present") {
      cardClass = "border-left: 5px solid var(--success-color);";
    } else if (selected === "absent") {
      cardClass = "border-left: 5px solid var(--danger-color);";
    }

    container.innerHTML += `
      <div class="student-card" style="${cardClass}" data-roll="${
      s.roll
    }" data-name="${s.name.toLowerCase()}">
        <div><h6 class="m-0">${s.name}</h6><small>Roll: ${s.roll}</small></div>
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm w-auto" id="att-${
            s.roll
          }" onchange="updateCardStyle(this, '${s.roll}')">
            <option value="" ${
              selected == "" ? "selected" : ""
            }>-- Select Status --</option>
            <option value="present" ${
              selected == "present" ? "selected" : ""
            } class="text-success">Present</option>
            <option value="absent" ${
              selected == "absent" ? "selected" : ""
            } class="text-danger">Absent</option>
          </select>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteStudent('${
            s.roll
          }')" title="Delete Student"><i class="bi bi-trash-fill"></i></button>
        </div>
      </div>
    `;
  });
}

function updateCardStyle(selectElement) {
  const card = selectElement.closest(".student-card");
  card.style.borderLeft = "5px solid var(--primary-color)";

  if (selectElement.value === "present") {
    card.style.borderLeft = "5px solid var(--success-color)";
  } else if (selectElement.value === "absent") {
    card.style.borderLeft = "5px solid var(--danger-color)";
  }
}

function filterStudents() {
  let val = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".student-card").forEach((card) => {
    let nameMatch = card.dataset.name.includes(val);
    let rollMatch = card.dataset.roll.includes(val);
    card.style.display = nameMatch || rollMatch ? "flex" : "none";
  });
}

function addStudent() {
  let name = prompt("Enter Student Name:");
  if (!name || name.trim() == "") return alert("Name required!");
  let roll;
  while (true) {
    roll = prompt(`Enter Roll Number for ${name}:`);
    if (!roll || roll.trim() == "") return alert("Roll required!");
    if (students.some((s) => s.roll === roll.trim()))
      alert("Roll exists, enter unique!");
    else break;
  }
  students.push({ name: name.trim(), roll: roll.trim() });
  localStorage.setItem("studentsDB", JSON.stringify(students));
  loadAttendanceUI();
  checkStatus();
}

function deleteStudent(roll) {
  if (
    !confirm(
      "Are you sure you want to delete this student and all their attendance records?"
    )
  )
    return;
  students = students.filter((s) => s.roll !== roll);
  localStorage.setItem("studentsDB", JSON.stringify(students));
  let attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceDB") || "{}"
  );
  for (let day in attendanceRecords) {
    attendanceRecords[day] = attendanceRecords[day].filter(
      (r) => r.roll !== roll
    );
  }
  localStorage.setItem("attendanceDB", JSON.stringify(attendanceRecords));
  loadAttendanceUI();
  checkStatus();
}

function saveAttendance() {
  let day = document.getElementById("daySelect").value;
  if (!day) return alert("Select a day before saving!");
  if (students.length == 0) return alert("No students to save attendance for!");

  let notMarkedCount = 0;
  let todayData = students.map((s) => {
    const status = document.getElementById(`att-${s.roll}`).value;
    if (status === "") notMarkedCount++;
    return {
      roll: s.roll,
      present: status,
    };
  });

  if (notMarkedCount > 0) {
    if (
      !confirm(
        `Warning: ${notMarkedCount} student(s) status is not marked. Save anyway?`
      )
    ) {
      return;
    }
  }

  let attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceDB") || "{}"
  );
  attendanceRecords[day] = todayData;
  localStorage.setItem("attendanceDB", JSON.stringify(attendanceRecords));
  alert(`Attendance for Day ${day} successfully saved!`);
  checkStatus();
}

function checkStatus() {
  let day = document.getElementById("statusDaySelect").value;
  let attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceDB") || "{}"
  );
  let todayData = attendanceRecords[day] || [];
  let total = students.length,
    present = 0,
    absent = 0;
  todayData.forEach((r) => {
    if (r.present == "present") present++;
    else if (r.present == "absent") absent++;
  });
  let notMarked = total - present - absent;

  document.getElementById("statusOutput").innerHTML = `
          <h6 class="text-primary mb-3"><i class="bi bi-calendar-day me-2"></i> Attendance Summary for Day ${day}</h6>
          <p class="mb-1"><strong>Total Students:</strong> ${total}</p>
          <hr>
          <p class="text-success mb-1"><strong>Present:</strong> ${present} / ${total} <i class="bi bi-check-circle-fill"></i></p>
          <p class="text-danger mb-1"><strong>Absent:</strong> ${absent} / ${total} <i class="bi bi-x-circle-fill"></i></p>
          <p class="text-secondary mb-0"><strong>Not Marked:</strong> ${notMarked} <i class="bi bi-question-circle-fill"></i></p>
      `;
}

function showDashboard(e) {
  if (e) e.preventDefault();
  document.getElementById("dashboardSection").style.display = "block";
  document.getElementById("statusSection").style.display = "none";
  document.getElementById("dashboard-link").classList.add("active");
  document.getElementById("status-link").classList.remove("active");
}
function showStatus(e) {
  if (e) e.preventDefault();
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("statusSection").style.display = "block";
  document.getElementById("status-link").classList.add("active");
  document.getElementById("dashboard-link").classList.remove("active");
  checkStatus();
}

function logout() {
  alert("Logging out...");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
  loadDays();
  document
    .getElementById("daySelect")
    .addEventListener("change", loadAttendanceUI);
  document
    .getElementById("statusDaySelect")
    .addEventListener("change", checkStatus);
});
