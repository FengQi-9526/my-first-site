document.getElementById("travelForm").addEventListener("submit", function(event) {
  event.preventDefault(); // 阻止表单自动提交

  const from = document.getElementById("fromLocation").value.trim();
  const to = document.getElementById("toLocation").value.trim();
  const time = document.getElementById("travelTime").value;

  // 模拟路线推荐（后期可以接入API）
  const route = `推荐路线：从 ${from} 前往 ${to}，可选择高铁或打车，预计耗时约 2 小时。`;

  // 模拟天气建议（以后可以接 API）
  const weather = `穿衣建议：当前气温 22℃，建议穿薄外套。记得带伞哦 ☂️。`;

  // 显示结果
  document.getElementById("routeSuggestion").textContent = route;
  document.getElementById("weatherAdvice").textContent = weather;
});
