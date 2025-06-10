// 辅助函数
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
}



function isOverdue(dateString) {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}

// 初始化任务数组和本地存储
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let editingTaskId = null;

function updateTaskStats() {
    const stats = {
        total: tasks.length,
        completed: tasks.filter(task => task.completed).length,
        pending: tasks.filter(task => !task.completed).length,
        important: tasks.filter(task => task.important).length
    };
    
    document.getElementById('totalTasks').textContent = stats.total;
    document.getElementById('completedTasks').textContent = stats.completed;
    document.getElementById('pendingTasks').textContent = stats.pending;
    document.getElementById('importantTasks').textContent = stats.important;
}

// 保存任务到localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 添加任务
function addTask(text, dueDate, priority, category) {
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        important: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null,
        priority: priority || 'medium',
        category: category || '其他'
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

// 编辑任务
function editTask(taskId) {
    editingTaskId = taskId;
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const taskElement = document.querySelector(`li[data-task-id="${taskId}"]`);
        const taskContent = taskElement.querySelector('.task-content');

        taskContent.classList.add('editing');
        const dateValue = task.dueDate ? task.dueDate.split('T')[0] : '';

        taskContent.innerHTML = `
            <div class="edit-container">
                <input type="text" class="edit-input" value="${task.text}">
                <input type="text" class="edit-category" list="categoryList" value="${task.category}">
                <select class="edit-priority">
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                </select>
                <input type="date" class="edit-date" value="${dateValue}">
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
    const newPriority = taskElement.querySelector('.edit-priority').value;
    const newCategory = taskElement.querySelector('.edit-category').value;

    if (newText) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.text = newText;
            task.dueDate = newDate ? new Date(newDate).toISOString().split('T')[0] : null;
            task.priority = newPriority;
            task.category = newCategory;
            editingTaskId = null;
            saveTasks();
            displayTasks();
        }
    }
}

// 取消编辑
function cancelEdit(taskId) {
    editingTaskId = null;
    displayTasks();
}

let currentFilter = 'all';
let currentCategory = 'all';

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    displayTasks();
}

function filterByCategory(category) {
    currentCategory = category;
    displayTasks();
}

function filterTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = tasks;
    
    switch (currentFilter) {
        case 'today':
            filtered = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
            });
            break;
        case 'week':
            filtered = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
            });
            break;
        case 'pending':
            filtered = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filtered = tasks.filter(task => task.completed);
            break;
        case 'important':
            filtered = tasks.filter(task => task.important);
            break;
        case 'high':
            filtered = tasks.filter(task => task.priority === 'high');
            break;
        case 'medium':
            filtered = tasks.filter(task => task.priority === 'medium');
            break;
        case 'low':
            filtered = tasks.filter(task => task.priority === 'low');
            break;
    }
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(task => task.category === currentCategory);
    }
    
    return filtered;
}

function displayTasks() {
    const taskList = document.getElementById('TaskList');
    if (!taskList) return;

    taskList.innerHTML = '';
    
    const filteredTasks = filterTasks(tasks);
    
    updateTaskStats();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <li class="no-tasks">
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>暂无任务</p>
                </div>
            </li>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-task-id', task.id);
        
        const createdAtDisplay = task.createdAt ? 
            `<span class="created-date">
                📅 创建于: ${formatDate(task.createdAt)}
            </span>` : '';

        const dueDateDisplay = task.dueDate ?
            `<span class="due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                ⏰ 截止: ${formatDate(task.dueDate)}
            </span>` : '';

        function getPriorityLabel(priority) {
            const labels = {
                high: '高优先级',
                medium: '中优先级',
                low: '低优先级'
            };
            return labels[priority] || '中优先级';
        }

        li.innerHTML = `
            <div class="task-content ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                    onclick="toggleTask(${task.id})">
                <span class="task-priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                <span class="task-category">${task.category}</span>
                <span class="task-text">${task.text}</span>
                <div class="task-dates">
                    ${createdAtDisplay}
                    ${dueDateDisplay}
                </div>
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

// 页面加载时初始化
// 优化后的菜单交互逻辑
function setupMenuListeners() {
    const filterBtn = document.querySelector('.filter-main-btn');
    const filterMenu = document.querySelector('.filter-menu');
    const overlay = document.querySelector('.filter-overlay');
    const filterItems = document.querySelectorAll('.filter-item');

    if (!filterBtn || !filterMenu) return;

    // 主菜单按钮点击事件
    filterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        filterMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // 子菜单交互逻辑
    filterItems.forEach(item => {
        const header = item.querySelector('.filter-item-header');
        const submenu = item.querySelector('.filter-submenu');

        if (!header || !submenu) return;

        // PC端悬停逻辑
        if (window.innerWidth > 768) {
            item.addEventListener('mouseenter', () => {
                submenu.classList.add('active');
            });
            item.addEventListener('mouseleave', () => {
                submenu.classList.remove('active');
            });
        } 
        // 移动端点击逻辑
        else {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                submenu.classList.toggle('active');
            });
        }
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', function() {
        filterMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.querySelectorAll('.filter-submenu').forEach(sub => {
            sub.classList.remove('active');
        });
    });

    // 窗口大小变化时重新绑定事件
    window.addEventListener('resize', setupMenuListeners);
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        setupMenuListeners();
        const taskForm = document.getElementById('taskForm');
        
        // 初始化筛选器状态
        setFilter('all');
        
        // 更新统计信息
        updateTaskStats();
        if (taskForm) {
            taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = document.getElementById('taskInput');
                const dateInput = document.getElementById('taskDueDate');
                const priorityInput = document.getElementById('taskPriority');
                const categoryInput = document.getElementById('taskCategory');
                
                const text = input.value.trim();
                if (text) {
                    addTask(
                        text,
                        dateInput.value,
                        priorityInput.value || 'medium',
                        categoryInput.value || '其他'
                    );
                    // 重置表单
                    [input, dateInput, priorityInput, categoryInput].forEach(el => el.value = '');
                }
            });
        }

        // 修复导航按钮事件监听
        document.querySelectorAll('.task-nav .nav-btn').forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.dataset.filter;
                console.log('筛选按钮点击:', filter);
                setFilter(filter);
                updateTaskNavActive(filter);
            });
        });

        // 获取筛选器相关元素
        const filterBtn = document.querySelector('.filter-main-btn');
        const filterMenu = document.querySelector('.filter-menu');
        const overlay = document.querySelector('.filter-overlay');
        
        if (filterBtn && filterMenu && overlay) {
            // 主按钮点击事件
            filterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('高级筛选按钮点击');
                
                const wasActive = this.classList.contains('active');
                console.log('之前状态:', wasActive ? '展开' : '收起');
                
                // 先显示遮罩层
                overlay.classList.add('active');
                overlay.style.opacity = '1';
                
                // 延迟显示菜单，确保遮罩层先显示
                setTimeout(() => {
                    if (!wasActive) {
                        this.classList.add('active');
                        filterMenu.classList.add('active');
                        console.log('设置新状态: 展开');
                        
                        // 移动端特殊处理
                        if (window.innerWidth <= 768) {
                            filterMenu.style.transform = 'translateY(0)';
                            console.log('移动端菜单位置: 显示');
                        }
                    } else {
                        this.classList.remove('active');
                        filterMenu.classList.remove('active');
                        overlay.classList.remove('active');
                        console.log('设置新状态: 收起');
                        
                        if (window.innerWidth <= 768) {
                            filterMenu.style.transform = 'translateY(100%)';
                            console.log('移动端菜单位置: 隐藏');
                        }
                    }
                }, 50);
            });
            
            // 点击遮罩层关闭菜单
            overlay.addEventListener('click', function() {
                filterBtn.classList.remove('active');
                filterMenu.classList.remove('active');
                this.classList.remove('active');
                if (window.innerWidth <= 768) {
                    filterMenu.style.transform = 'translateY(100%)';
                }
            });
            
            // 点击页面其他地方关闭菜单
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.filter-wrapper')) {
                    filterBtn.classList.remove('active');
                    filterMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    if (window.innerWidth <= 768) {
                        filterMenu.style.transform = 'translateY(100%)';
                    }
                }
            });
            
            // 增强PC端子菜单悬停逻辑
            function initPCHover() {
                console.log('初始化PC端悬停事件监听器');
                const items = document.querySelectorAll('.filter-item');
                console.log(`找到${items.length}个筛选项`);
                
                items.forEach(item => {
                    const submenu = item.querySelector('.filter-submenu');
                    if (!submenu) {
                        console.warn('未找到子菜单元素', item);
                        return;
                    }

                    // 确保移除所有可能重复的监听器
                    item.removeEventListener('mouseenter', handleMouseEnter);
                    item.removeEventListener('mouseleave', handleMouseLeave);
                    item.removeEventListener('mouseover', handleMouseEnter);
                    item.removeEventListener('mouseout', handleMouseLeave);

                    // 添加更可靠的事件监听
                    item.addEventListener('mouseenter', handleMouseEnter, {capture: true});
                    item.addEventListener('mouseleave', handleMouseLeave, {capture: true});
                    item.addEventListener('mouseover', handleMouseEnter);
                    item.addEventListener('mouseout', handleMouseLeave);
                    
                    console.log('已为元素添加悬停监听器', item);
                });
            }

            function handleMouseEnter() {
                const submenu = this.querySelector('.filter-submenu');
                if (submenu) {
                    submenu.style.display = 'block';
                    console.log('PC端悬停显示子菜单');
                }
            }

            function handleMouseLeave() {
                const submenu = this.querySelector('.filter-submenu');
                if (submenu) {
                    submenu.style.display = 'none';
                    console.log('PC端离开隐藏子菜单');
                }
            }

            // 初始绑定
            if (window.innerWidth > 768) {
                initPCHover();
            }

            // 窗口大小变化时重新绑定
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    initPCHover();
                } else {
                    // 移动端移除PC端事件
                    document.querySelectorAll('.filter-item').forEach(item => {
                        item.removeEventListener('mouseenter', handleMouseEnter);
                        item.removeEventListener('mouseleave', handleMouseLeave);
                    });
                }
            });

            // 确保设备切换时重置状态
            window.addEventListener('resize', function() {
                const isMobile = window.innerWidth <= 768;
                document.querySelectorAll('.filter-submenu').forEach(submenu => {
                    submenu.classList.remove('show', 'hide', 'active');
                    if (isMobile) {
                        submenu.style.display = '';
                    }
                });
            });

            // 移动端子菜单点击显示
            if (window.innerWidth <= 768) {
                document.querySelectorAll('.filter-item-header').forEach(header => {
                    header.addEventListener('click', function(e) {
                        e.preventDefault();
                        const submenu = this.nextElementSibling;
                        submenu.classList.toggle('active');
                    });
                });
            }
        }

        // 显示任务
        displayTasks('all');
        console.log('页面初始化完成');
        
    } catch (error) {
        StyleTestUtils.log(`初始化失败: ${error.message}`, 'error');
    }
});

        // 简化子菜单交互
        document.querySelectorAll('.filter-item-header').forEach(header => {
            header.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const submenu = this.nextElementSibling;
                    submenu.classList.toggle('active');
                }
            });
        });

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