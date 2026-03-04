function doGet(e) {
  return ContentService.createTextOutput("GAS Connection OK").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 重複書き込みによるエラーを防止

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // 指定のシート名を探し、なければ1枚目のシートを使用
    var sheet = ss.getSheetByName("社員/アルバイト面接書") || ss.getSheets()[0];
    
    // Reactから送信されたデータ
    var data = e.parameter;
    
    // 【完全版】全55項目をシートの列順序に合わせてマッピングします。
    // 上から順番に、スプレッドシートのA列、B列、C列...と書き込まれます。
    var orderedFields = [
      { key: "timestamp", label: "送信日時" },
      { key: "name", label: "お名前" },
      { key: "kana", label: "かな" },
      { key: "gender", label: "性別" },
      { key: "bloodType", label: "血液型" },
      { key: "birthYear", label: "生年月日(年)" },
      { key: "birthMonth", label: "生年月日(月)" },
      { key: "birthDay", label: "生年月日(日)" },
      { key: "age", label: "年齢" },
      { key: "zodiac", label: "干支" },
      { key: "phone", label: "携帯番号" },
      { key: "address", label: "現住所" },
      { key: "domicile", label: "本籍地" },
      { key: "height", label: "身長" },
      { key: "weight", label: "体重" },
      { key: "jobDay", label: "現在の職業[日中]" },
      { key: "jobNight", label: "現在の職業[夜間]" },
      { key: "education", label: "学校名.学年/最終学歴" },
      { key: "nightJobExp", label: "夜職の経験" },
      { key: "livingStatus", label: "お住まい" },
      { key: "livingStatusCustom", label: "具体的な住まい" },
      { key: "language", label: "語学" },
      { key: "languageCustom", label: "具体的な語学" },
      { key: "emergencyName", label: "緊急連絡先:氏名" },
      { key: "emergencyRelationship", label: "緊急連絡先:続柄" },
      { key: "emergencyPhone", label: "緊急連絡先:電話番号" },
      { key: "emergencyAddress", label: "緊急連絡先:住所" },
      { key: "hireCondition", label: "採用条件" },
      { key: "applyMethod", label: "応募方法" },
      { key: "introducer", label: "紹介者名" },
      { key: "applyMethodCustom", label: "具体的な応募経由" },
      { key: "daysPerWeek", label: "週何回入れますか" },
      { key: "availableDays", label: "何曜日入れますか" },
      { key: "workTime", label: "勤務時間" },
      { key: "workTimeCustom", label: "具体的な時間" },
      { key: "debt", label: "借金" },
      { key: "transport", label: "交通手段" },
      { key: "transportCustom", label: "具体的な交通手段" },
      { key: "tattoo", label: "刺青・タトゥー" },
      { key: "tattooDetail", label: "タトゥーの部位,大きさ" },
      
      // 以下、職歴①〜③の全15項目
      { key: "workHistory1Name", label: "職歴①:勤務先" },
      { key: "workHistory1Wage", label: "職歴①:時給" },
      { key: "workHistory1Period", label: "職歴①:期間" },
      { key: "workHistory1QuitDate", label: "職歴①:退店日" },
      { key: "workHistory1QuitReason", label: "職歴①:退店理由" },
      
      { key: "workHistory2Name", label: "職歴②:勤務先" },
      { key: "workHistory2Wage", label: "職歴②:時給" },
      { key: "workHistory2Period", label: "職歴②:期間" },
      { key: "workHistory2QuitDate", label: "職歴②:退店日" },
      { key: "workHistory2QuitReason", label: "職歴②:退店理由" },
      
      { key: "workHistory3Name", label: "職歴③:勤務先" },
      { key: "workHistory3Wage", label: "職歴③:時給" },
      { key: "workHistory3Period", label: "職歴③:期間" },
      { key: "workHistory3QuitDate", label: "職歴③:退店日" },
      { key: "workHistory3QuitReason", label: "職歴③:退店理由" }
    ];

    var lastCol = sheet.getLastColumn();
    
    // シートの1行目が空（初めての書き込みや真っ白な状態）の場合は、自動で日本語の見出しを作成する
    if (lastCol === 0) {
      var headers = orderedFields.map(function(field) { return field.label; });
      sheet.appendRow(headers);
    }

    // 定義した順番（orderedFields）通りに、Reactのデータ（data）を抽出して配列にする
    var newRow = orderedFields.map(function(field) {
      var val = data[field.key];
      return val !== undefined ? val : ""; // データが存在しない場合は空文字を入れる
    });

    // 1行分のデータをシートに書き込み
    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
