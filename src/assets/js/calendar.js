// calendar.js - Versión mejorada
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    
    if (calendarEl) {
        // Cargar eventos y renderizar calendario
        fetch('data/eventos.json')
            .then(response => response.json())
            .then(events => {
                renderCalendar(new Date().getFullYear(), new Date().getMonth(), events);
                setupCalendarNavigation(events);
            })
            .catch(error => console.error('Error al cargar eventos:', error));
    }
});

function isEventFinalizado(event) {
    const now = new Date();
    const eventDate = event.date ? new Date(event.date) : null;
    if (!eventDate) return false;
    // Si el evento tiene fecha de fin, usar esa fecha
    if (event.endDate) {
        const endDate = new Date(event.endDate);
        if (event.endTime) {
            const [endHour, endMinute] = event.endTime.split(':');
            endDate.setHours(parseInt(endHour), parseInt(endMinute));
            return now > endDate;
        }
        const nextDay = new Date(endDate);
        nextDay.setDate(endDate.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        return now >= nextDay;
    }
    if (event.time) {
        const [startHour, startMinute] = event.time.split(':');
        eventDate.setHours(parseInt(startHour), parseInt(startMinute));
        if (now.toDateString() === eventDate.toDateString()) {
            return now > eventDate;
        }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
}

function renderCalendar(year, month, events) {
    const calendarEl = document.getElementById('calendar');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Obtener primer día del mes y cuántos días tiene
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Filtrar eventos para este mes
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    // Crear encabezado del calendario
    let calendarHTML = `
        <div class="flex justify-between items-center mb-4">
            <button class="prev-month px-3 py-1 rounded hover:bg-gray-100">&lt;</button>
            <h3 class="text-lg font-semibold">${monthNames[month]} ${year}</h3>
            <button class="next-month px-3 py-1 rounded hover:bg-gray-100">&gt;</button>
        </div>
        <div class="grid grid-cols-7 gap-1">
            <div class="text-center font-medium py-2 text-gray-600">Dom</div>
            <div class="text-center font-medium py-2 text-gray-600">Lun</div>
            <div class="text-center font-medium py-2 text-gray-600">Mar</div>
            <div class="text-center font-medium py-2 text-gray-600">Mié</div>
            <div class="text-center font-medium py-2 text-gray-600">Jue</div>
            <div class="text-center font-medium py-2 text-gray-600">Vie</div>
            <div class="text-center font-medium py-2 text-gray-600">Sáb</div>
    `;
    
    // Espacios vacíos para días del mes anterior
    let dayOfWeek = firstDay.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
        calendarHTML += `<div class="h-24 border border-gray-200"></div>`;
    }
    
    // Días del mes
    const today = new Date();
    const currentDate = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDate && month === currentMonth && year === currentYear;
        const dayEvents = monthEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day;
        });
        
        calendarHTML += `
            <div class="h-24 border border-gray-200 p-1 ${isToday ? 'bg-indigo-50' : ''}">
                <div class="text-right text-sm ${isToday ? 'font-bold text-indigo-700' : ''}">${day}</div>
                ${dayEvents.map(event => {
                    const finalizado = isEventFinalizado(event);
                    return `<a href="evento-detalle.html?id=${event.id}"
                        class="block text-xs mt-1 p-1 rounded truncate"
                        style="${finalizado ? 'background:#e5e7eb;color:#6b7280;pointer-events:none;cursor:default;' : 'background:#c7d2fe;color:#3730a3;'}">
                        ${event.name}
                    </a>`;
                }).join('')}
            </div>
        `;
        
        dayOfWeek++;
        if (dayOfWeek > 6) {
            dayOfWeek = 0;
        }
    }
    
    calendarHTML += `</div>`;
    calendarEl.innerHTML = calendarHTML;
}

function setupCalendarNavigation(events) {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('prev-month')) {
            navigateCalendar(-1, events);
        }
        
        if (e.target.classList.contains('next-month')) {
            navigateCalendar(1, events);
        }
    });
}

function navigateCalendar(direction, events) {
    const currentTitle = document.querySelector('#calendar h3').textContent;
    const [month, year] = currentTitle.split(' ');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = monthNames.indexOf(month);
    
    let newMonth = monthIndex + direction;
    let newYear = parseInt(year);
    
    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }
    
    renderCalendar(newYear, newMonth, events);
}