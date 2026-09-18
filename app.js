let currentLang = localStorage.getItem("nurma_lang") || "ar";
let currentLessonId = 1;
let lessonsData = [];

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("nurma_lang", lang);
    document.getElementById("html-root").setAttribute("lang", lang);
    document.getElementById("html-root").setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    await loadLessonsData();
}

async function initApp() {
    document.getElementById("html-root").setAttribute("lang", currentLang);
    document.getElementById("html-root").setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
    await loadLessonsData();
}

async function loadLessonsData() {
    const fileName = currentLang === "ar" ? "lessons_ar.json" : "lessons_en.json";
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error("تعذر تحميل ملف الدروس");
        lessonsData = await response.json();
        renderSidebar();
        loadLesson(currentLessonId);
        updateProgress();
    } catch (error) {
        console.error(error);
        document.getElementById("lesson-content").innerHTML = `<h2>خطأ في التحميل</h2><p>تأكد من فتح الموقع عبر خادر محلي (Live Server) أو عبر GitHub Pages لكي يتم قراءة ملفات الـ JSON بنجاح.</p>`;
    }
}

function renderSidebar() {
    const list = document.getElementById("lessons-list");
    list.innerHTML = "";
    
    document.getElementById("sidebar-title").textContent = currentLang === "ar" ? "فهرس المنهج الشامل" : "Masterclass Syllabus";

    lessonsData.forEach(lesson => {
        const li = document.createElement("li");
        li.textContent = lesson.title;
        if (lesson.id === currentLessonId) li.classList.add("active");
        if (localStorage.getItem(`nurma_done_${lesson.id}`)) li.classList.add("completed");

        li.addEventListener("click", () => {
            currentLessonId = lesson.id;
            renderSidebar();
            loadLesson(currentLessonId);
        });
        list.appendChild(li);
    });
}

function loadLesson(id) {
    const lesson = lessonsData.find(l => l.id === id);
    if (!lesson) return;

    const contentArea = document.getElementById("lesson-content");
    const doneText = currentLang === "ar" ? "إتمام الدرس وحفظ التقدم ✓" : "Complete Lesson ✓";
    
    contentArea.innerHTML = `
        <h2>${lesson.title}</h2>
        <div>${lesson.body}</div>
        <button class="action-btn" onclick="completeLesson(${id})">${doneText}</button>
    `;
}

function completeLesson(id) {
    localStorage.setItem(`nurma_done_${id}`, "true");
    renderSidebar();
    updateProgress();
    alert(currentLang === "ar" ? "رائع! تم حفظ تقدمك بنجاح." : "Awesome! Progress saved.");
}

function updateProgress() {
    if (lessonsData.length === 0) return;
    let completed = lessonsData.filter(l => localStorage.getItem(`nurma_done_${l.id}`)).length;
    let pct = Math.round((completed / lessonsData.length) * 100);
    const text = currentLang === "ar" ? `التقدم: ${pct}%` : `Progress: ${pct}%`;
    document.getElementById("progress-indicator").textContent = text;
}