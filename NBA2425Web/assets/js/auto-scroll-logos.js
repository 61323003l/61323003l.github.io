$(function() { // 確保 DOM 載入完成後執行

    const slider = document.getElementById('team-logo-slider');
    let scrollInterval; // 用來儲存滾動計時器

    if (slider) {
        // 設定滾動速度 (數字越小，速度越快)
        const scrollSpeed = 5; // 每次滾動的像素數
        const intervalTime = 50; // 滾動間隔 (毫秒)

        // 設定滑動方向 (1 為向右，-1 為向左)
        let scrollDirection = 1;

        // 開始自動滾動的函數
        function startAutoScroll() {
            if (scrollInterval) return; // 如果已經在滾動，則不再開始

            scrollInterval = setInterval(() => {
                // 檢查是否到達末尾或開頭
                if (scrollDirection === 1) { // 向右滾動
                    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - scrollSpeed) {
                        // 如果接近或到達最右邊，則改變方向向左
                        scrollDirection = -1;
                    }
                } else { // 向左滾動
                    if (slider.scrollLeft <= scrollSpeed) {
                        // 如果接近或到達最左邊，則改變方向向右
                        scrollDirection = 1;
                    }
                }

                // 執行滾動
                slider.scrollLeft += scrollDirection * scrollSpeed;
            }, intervalTime);
        }

        // 停止自動滾動的函數
        function stopAutoScroll() {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }

        // 預設在載入時開始自動滾動
        startAutoScroll();

        // 當滑鼠移入時停止自動滾動，移出時繼續
        // 這樣使用者可以點擊或仔細查看
        slider.addEventListener('mouseenter', stopAutoScroll);
        slider.addEventListener('mouseleave', startAutoScroll);

        // 如果使用者手動拖曳滾動了，也停止自動滾動
        // 偵測鼠標按下事件
        slider.addEventListener('mousedown', stopAutoScroll);
        // 偵測觸摸開始事件 (針對觸控裝置)
        slider.addEventListener('touchstart', stopAutoScroll);
    }
});