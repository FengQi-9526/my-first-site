// script.js 中的 showPage 函数
function showPage(pageId) {
    // 获取所有页面
    const pages = ['home', 'task', 'travel', 'study', 'advisor', 'discipline', 'studyPartner'];
    
    // 移除所有导航项的活动状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('nav-active');
    });
    
    // 高亮当前导航项
    document.getElementById(`nav-${pageId}`).classList.add('nav-active');
    
    // 处理页面切换
    pages.forEach(id => {
        const section = document.getElementById(id);
        
        if (id === pageId) {
            // 先设置为可见但不透明
            section.style.display = 'block';
            
            // 强制浏览器重新计算布局
            void section.offsetWidth;
            
            // 添加激活类触发动画
            setTimeout(() => {
                section.classList.add('active');
            }, 10);
        } else {
            // 移除激活类
            section.classList.remove('active');
            
            // 等待动画完成后隐藏
            setTimeout(() => {
                if (!section.classList.contains('active')) {
                    section.style.display = 'none';
                }
            }, 400); // 动画持续时间
        }
    });
}




    // 预加载所有页面，减少切换时的内容加载延迟
    document.addEventListener('DOMContentLoaded', function() {
        // 预先计算并缓存所有section的尺寸，减少重排
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (!section.classList.contains('active')) {
                // 临时使其可见以计算尺寸
                section.style.position = 'absolute';
                section.style.visibility = 'hidden';
                section.style.display = 'block';
                section.style.opacity = '0';
                
                // 触发重排以计算尺寸
                section.offsetHeight;
                
                // 恢复原样
                section.style.position = '';
                section.style.visibility = '';
                section.style.display = '';
                section.style.opacity = '';
            }
        });
    });


    // 任务管理功能
    document.getElementById('taskForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        const spinner = document.getElementById('taskSpinner');

        if (taskText) {
            // 显示加载动画
            spinner.style.display = 'block';
            
            // 模拟处理时间
            setTimeout(() => {
                const taskList = document.getElementById('TaskList');
                const li = document.createElement('li');
                li.textContent = taskText;
                taskList.appendChild(li);
                taskInput.value = '';
                spinner.style.display = 'none';
            }, 500);
        }
    });

    // 出行秘书功能
    document.getElementById('travelForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const destination = document.getElementById('destination').value.trim();
        const date = document.getElementById('date').value;
        const output = document.getElementById('travelOutput');
        const spinner = document.getElementById('travelSpinner');

        if (destination && date) {
            // 显示加载动画
            spinner.style.display = 'block';
            output.innerHTML = '';
            
            // 模拟数据处理时间
            setTimeout(() => {
                let suggestion = `📍出行目的地：${destination} <br>📅 出行时间：${date} <br>`;
                suggestion += `🗺️ 建议：请提前查询是否有直达公交或地铁。如路线复杂，可备好备用路线。<br>`;
                suggestion += `🌦️ 天气提醒：建议出行前查看天气，如有雨请带伞。<br>`;
                suggestion += `👕 穿搭建议：清晨出行建议穿戴舒适、防风保暖衣物。<br>`;
                output.innerHTML = suggestion;
                
                document.getElementById('destination').value = '';
                document.getElementById('date').value = '';
                spinner.style.display = 'none';
            }, 800);
        }
    });

    // 战略顾问功能
    document.getElementById('advisorForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const planInput = document.getElementById('planInput').value.trim();
        const output = document.getElementById('advisorOutput');
        const spinner = document.getElementById('advisorSpinner');

        if (planInput) {
            // 显示加载动画
            spinner.style.display = 'block';
            output.innerHTML = '';
            
            // 模拟数据处理时间
            setTimeout(() => {
                let feedback = '';
                if (planInput.includes('每天') || planInput.includes('早上')) {
                    feedback = '看起来你想建立一个规律的习惯，这是个好主意！但要注意能否长期坚持。建议设立起床提醒，保持前7天不间断。';
                } else if (planInput.length < 10) {
                    feedback = '这个计划太简略了，建议你描述得更具体一些，比如时间、频率等。';
                } else {
                    feedback = '你的计划看起来很棒！保持专注，你会看到成果的。';
                }
                output.innerHTML = `<p>${feedback}</p>`;
                document.getElementById('planInput').value = '';
                spinner.style.display = 'none';
            }, 700);
        }
    });

    // 学习规划师功能
    document.getElementById('studyForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const input = document.getElementById('studyInput').value.trim();
        const output = document.getElementById('studyPlan');
        const spinner = document.getElementById('studySpinner');

        if (input) {
            // 显示加载动画
            spinner.style.display = 'block';
            output.innerHTML = '';
            
            // 模拟处理时间
            setTimeout(() => {
                if (input.includes('讲故事')) {
                    output.innerHTML = `
                        <h3>🎯 60天讲故事计划（简版）</h3>
                        <ul>
                            <li><strong>第1-10天：</strong> 观察生活 + 阅读故事案例</li>
                            <li><strong>第11-20天：</strong> 学习三幕式结构（起-承-转-合）</li>
                            <li><strong>第21-30天：</strong> 模仿写作 1 篇短故事每3天</li>
                            <li><strong>第31-45天：</strong> 制作 1-3 分钟语音故事，练习讲述节奏</li>
                            <li><strong>第46-60天：</strong> 创作自己的原创故事 + 视频/语音呈现</li>
                        </ul>
                        <p>✨ 小贴士：每天写日记能让你对"如何打动人"有更深的理解哦！</p>
                    `;
                } else {
                    output.innerHTML = `<p>暂时只支持"讲故事"方向的计划。未来会支持更多学习主题哟～</p>`;
                }
                
                document.getElementById('studyInput').value = '';
                spinner.style.display = 'none';
            }, 900);
        }
    });

    // 纪律教练功能
    document.getElementById('disciplineForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const disciplineInput = document.getElementById('disciplineInput').value.trim();
        const output = document.getElementById('disciplineOutput');
        const spinner = document.getElementById('disciplineSpinner');

        if (disciplineInput) {
            // 显示加载动画
            spinner.style.display = 'block';
            output.innerHTML = '';
            
            // 模拟处理时间
            setTimeout(() => {
                output.innerHTML = `<p>🏃‍♂️ 别担心！我知道现在难，但起步就好。每次只需要坚持 5 分钟，之后再逐步增加时间，你会更有动力的！加油哦！</p>`;
                document.getElementById('disciplineInput').value = '';
                spinner.style.display = 'none';
            }, 600);
        }
    });

    // 学习伙伴功能
    document.getElementById('studyPartnerForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const studyPartnerInput = document.getElementById('studyPartnerInput').value.trim();
        const response = document.getElementById('studyPartnerResponse');
        const spinner = document.getElementById('studyPartnerSpinner');

        if (studyPartnerInput) {
            // 显示加载动画
            spinner.style.display = 'block';
            response.innerHTML = '';
            
            // 模拟处理时间
            setTimeout(() => {
                response.innerHTML = `<p>🔄 你想复习的内容是：${studyPartnerInput}。来，快速回顾一下这个知识点，确保你记得！</p>`;
                document.getElementById('studyPartnerInput').value = '';
                spinner.style.display = 'none';
            }, 750);
        }
    });
