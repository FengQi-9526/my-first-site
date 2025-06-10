// 全局交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 自动隐藏加载动画
    setTimeout(function() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 500);

    // 响应式导航栏
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('nav ul');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }
});

// 添加任务
function addTask(text, dueDate) {
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        important: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null
    };
    tasks.push(task);
    saveTasks();
    displayTasks();
}

// 切换任务状态
function toggleTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        displayTasks();
    }
}

// 切换重要状态
function toggleImportant(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.important = !task.important;
        saveTasks();
        displayTasks();
    }
}

// 删除任务
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    displayTasks();
}

function editTask(taskId) {
    editingTaskId = taskId;
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const taskElement = document.querySelector(`li[data-task-id="${taskId}"]`);
        const taskContent = taskElement.querySelector('.task-content');
        
        // 设置编辑模式的类
        taskContent.classList.add('editing');
        
        // 构造日期值
        const dateValue = task.dueDate ? task.dueDate.split('T')[0] : '';
        
        taskContent.innerHTML = `
            <div class="edit-container">
                <input type="text" class="edit-input" value="${task.text}">
                <div class="edit-date-container">
                    <input type="date" class="edit-date" value="${dateValue}">
                </div>
                <div class="edit-actions">
                    <button onclick="saveEdit(${taskId})" class="btn-save" title="保存">✔️</button>
                    <button onclick="cancelEdit(${taskId})" class="btn-cancel" title="取消">❌</button>
                </div>
            </div>
        `;

        // 自动聚焦到输入框
        const inputField = taskContent.querySelector('.edit-input');
        inputField.focus();
        inputField.select();
    }
}

function saveEdit(taskId) {
    const taskElement = document.querySelector(`li[data-task-id="${taskId}"]`);
    const newText = taskElement.querySelector('.edit-input').value.trim();
    const newDate = taskElement.querySelector('.edit-date').value;
    
    if (newText) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.text = newText;
            // 确保日期格式正确
            task.dueDate = newDate ? new Date(newDate).toISOString().split('T')[0] : null;
            editingTaskId = null;
            saveTasks();
            displayTasks();
        }
    }
}

function cancelEdit(taskId) {
    editingTaskId = null;
    displayTasks();
}

// 任务过滤
function filterTasks(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
        case 'today':
            return tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
            });
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'important':
            return tasks.filter(task => task.important);
        default:
            return tasks;
    }
}

// 显示任务列表
function displayTasks(filter = 'all') {
    const taskList = document.getElementById('TaskList');
    if (!taskList) return;

    taskList.innerHTML = '';
    const filteredTasks = filterTasks(filter);

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-task-id', task.id);
        
        const dueDateDisplay = task.dueDate ? 
            `<span class="due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                📅 ${formatDate(task.dueDate)}
            </span>` : '';
        
        li.innerHTML = `
            <div class="task-content ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onclick="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                ${dueDateDisplay}
                <div class="task-actions">
                    <button onclick="toggleImportant(${task.id})" class="btn-important" title="标记重要">
                        ${task.important ? '⭐' : '☆'}
                    </button>
                    <button onclick="editTask(${task.id})" class="btn-edit" title="编辑">✏️</button>
                    <button onclick="deleteTask(${task.id})" class="btn-delete" title="删除">❌</button>
                </div>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// 更新导航状态
function updateTaskNavActive(filter) {
    const navButtons = document.querySelectorAll('.task-nav .nav-btn');
    navButtons.forEach(button => {
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('taskInput');
            const dateInput = document.getElementById('taskDueDate');
            const text = input.value.trim();
            if (text) {
                addTask(text, dateInput.value);
                input.value = '';
                dateInput.value = '';
            }
        });
    }

    // 添加导航按钮事件监听
    const navButtons = document.querySelectorAll('.task-nav .nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            updateTaskNavActive(filter);
            displayTasks(filter);
        });
    });

    displayTasks('all');
});