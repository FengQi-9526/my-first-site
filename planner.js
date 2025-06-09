function generatePlan() {
  const topic = document.getElementById("topicInput").value.trim();
  const planResult = document.getElementById("planResult");

  if (!topic) {
    planResult.innerHTML = "<p>请先输入你想学习的主题。</p>";
    return;
  }

  // 模拟学习建议（将来可以替换成 ChatGPT 接口）
  const samplePlans = {
    "讲故事": {
      books: ["《故事》 by Robert McKee", "《故事经济学》"],
      videos: ["B站：如何讲一个吸引人的故事", "YouTube: Pixar讲故事法则"],
      practice: "每天写一个100字的故事，并分享给朋友"
    },
    "英语听力": {
      books: ["《英语语感启蒙》", "《赖世雄美语音标》"],
      videos: ["B站：每日英语听力", "TED演讲练习"],
      practice: "每天听10分钟材料并复述内容"
    },
    "前端开发": {
      books: ["《JavaScript DOM编程艺术》", "《你不知道的JavaScript》"],
      videos: ["黑马程序员HTML/CSS", "B站：前端入门全套"],
      practice: "每周完成一个小网页练习项目"
    }
  };

  let plan = samplePlans[topic];

  if (!plan) {
    plan = {
      books: ["（暂无推荐书籍）"],
      videos: ["（暂无推荐视频）"],
      practice: "（暂无练习建议）"
    };
  }

  planResult.innerHTML = `
    <h3>📘 推荐书籍</h3>
    <ul>${plan.books.map(book => `<li>${book}</li>`).join("")}</ul>
    <h3>🎥 推荐视频</h3>
    <ul>${plan.videos.map(video => `<li>${video}</li>`).join("")}</ul>
    <h3>✍️ 实践任务</h3>
    <p>${plan.practice}</p>
  `;
}
