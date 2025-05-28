$(function() { // 確保 DOM 載入完成後執行

    const playerInput = $('#player-name-input');
    const autocompleteResults = $('#autocomplete-results');
    let players = []; // 用來儲存所有球員姓名

    // --- 載入球員數據 ---
    // 假設您的 CSV 檔案名為 'players.csv'，放在網站根目錄下
    // 如果是 JSON 檔案，載入方式會有所不同
    function loadPlayersFromCSV(callback) {
        $.ajax({
            url: 'player_names.csv', // 確保這裡的檔案路徑正確
            dataType: 'text', // 指定為文本類型
            success: function(data) {
                // 簡單的 CSV 解析：按行分割，取第一列作為姓名
                const lines = data.split('\n');
                const playerNames = [];
                for (let i = 1; i < lines.length; i++) { // 從第二行開始讀取數據（跳過標題行）
                    const line = lines[i].trim();
                    if (line) {
                        const columns = line.split(','); // 假設姓名在第一列
                        if (columns.length > 0) {
                            playerNames.push(columns[0].trim()); // 將第一列作為球員姓名
                        }
                    }
                }
                callback(playerNames);
            },
            error: function(xhr, status, error) {
                console.error("載入 players.csv 失敗:", status, error);
                // 可以在這裡顯示錯誤訊息給使用者
                autocompleteResults.html('<div>載入球員數據失敗。</div>');
            }
        });
    }

    // 初始化時載入球員數據
    loadPlayersFromCSV(function(loadedPlayers) {
        players = loadedPlayers;
        console.log("球員數據載入完成，共", players.length, "位球員。");
    });

    // --- 自動完成核心邏輯 ---

    let currentFocus = -1; // 用於鍵盤導航

    playerInput.on('input', function() {
        const val = this.value;
        closeAllLists(); // 每次輸入時關閉所有建議列表

        if (!val) { return false; } // 如果輸入框為空，則不顯示建議

        currentFocus = -1; // 重置鍵盤焦點

        const fragment = document.createDocumentFragment(); // 使用 DocumentFragment 優化 DOM 操作

        let matchCount = 0; // 限制顯示的建議數量

        // 遍歷所有球員，找到匹配項
        for (let i = 0; i < players.length; i++) {
            // 轉為小寫進行不區分大小寫的比對
            if (players[i].toLowerCase().includes(val.toLowerCase())) {

                // 限制顯示的建議數量，例如最多顯示 10 個
                if (matchCount >= 10) break;
                matchCount++;

                const b = document.createElement("div");
                // 用粗體標示匹配的文字部分
                const index = players[i].toLowerCase().indexOf(val.toLowerCase());
                b.innerHTML = players[i].substr(0, index) +
                    "<strong>" + players[i].substr(index, val.length) + "</strong>" +
                    players[i].substr(index + val.length);

                b.innerHTML += "<input type='hidden' value='" + players[i] + "'>"; // 用隱藏的 input 儲存完整姓名

                // 點擊建議項目時的事件處理
                b.addEventListener("click", function(e) {
                    playerInput.val(this.getElementsByTagName("input")[0].value); // 將完整姓名填充到輸入框
                    closeAllLists(); // 關閉建議列表
                    // 可選：在這裡觸發搜尋或自動提交表單
                    // $('#player-search-form').submit(); 
                });
                fragment.appendChild(b);
            }
        }
        autocompleteResults.append(fragment);
    });

    // 鍵盤導航 (上、下箭頭和 Enter 鍵)
    playerInput.on('keydown', function(e) {
        let x = autocompleteResults.find("div"); // 獲取所有建議項目
        if (x.length === 0) return; // 沒有建議時不做任何操作

        if (e.keyCode == 40) { // 下箭頭
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // 上箭頭
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter 鍵
            e.preventDefault(); // 阻止表單提交
            if (currentFocus > -1) {
                if (x[currentFocus]) x[currentFocus].click(); // 模擬點擊當前選中的建議
            } else {
                // 如果沒有選中建議，但按了 Enter，可以考慮觸發搜尋
                $('#search-player-button').click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x); // 先移除所有活躍狀態
        if (currentFocus >= x.length) currentFocus = 0; // 循環到第一個
        if (currentFocus < 0) currentFocus = (x.length - 1); // 循環到最後一個
        $(x[currentFocus]).addClass("autocomplete-active"); // 添加活躍 class

        // 確保選中的項目在可見區域內
        const activeItem = $(x[currentFocus]);
        const resultsScrollTop = autocompleteResults.scrollTop();
        const resultsHeight = autocompleteResults.innerHeight();
        const itemTop = activeItem.position().top + resultsScrollTop;
        const itemHeight = activeItem.outerHeight();

        if (itemTop < resultsScrollTop) { // 如果項目在可視區域上方
            autocompleteResults.scrollTop(itemTop);
        } else if (itemTop + itemHeight > resultsScrollTop + resultsHeight) { // 如果項目在可視區域下方
            autocompleteResults.scrollTop(itemTop + itemHeight - resultsHeight);
        }
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            $(x[i]).removeClass("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        // 關閉所有自動完成列表，除了當前點擊的元素
        $(".autocomplete-items").each(function(index, el) {
            if (elmnt != el && elmnt != playerInput[0]) {
                $(el).empty(); // 清空建議列表
            }
        });
    }

    // 當點擊輸入框之外的任何地方時，關閉建議列表
    $(document).on("click", function(e) {
        closeAllLists(e.target);
    });

    // 阻止表單預設提交，我們將用 JS 處理搜尋
    $('#player-search-form').on('submit', function(e) {
        e.preventDefault();
        const playerName = playerInput.val();
        if (playerName) {
            console.log("搜尋球員:", playerName);
            // 在這裡可以觸發顯示球員詳細數據的邏輯
            // 例如：showPlayerDetailPage(playerName);
            alert(`正在搜尋球員：${playerName}`); // 暫時代替
        }
    });
});