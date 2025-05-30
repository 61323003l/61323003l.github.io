/*
    Dimension by HTML5 UP
    html5up.net | @ajlkn
    Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main = $('#main'),
        $main_articles = $main.children('article');

    var $searchForm = $('#search-form'); // 新增：獲取搜尋表單元素

    // Breakpoints.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
            // 頁面載入完成後，根據 URL hash 決定顯示哪個儀表板或文章
            // 這裡不再直接調用 $main._show，而是讓 hashchange 事件處理
            // 因為 hashchange 包含了更複雜的儀表板初始化邏輯
            if (location.hash !== '' && location.hash !== '#') {
                // 手動觸發 hashchange 事件來處理初始 URL
                $window.trigger('hashchange');
            } else {
                // 如果沒有 hash，保持預設的首頁顯示，或者您希望的初始狀態
                // 並呼叫 initDashboard (如果存在)
                if (window.initTeamDashboard) {
                    window.initTeamDashboard();
                    console.log("main.js: 首次載入時呼叫 initTeamDashboard() (無 hash)");
                }
                if (window.initPlayerDashboard) {
                    window.initPlayerDashboard();
                    console.log("main.js: 首次載入時呼叫 initPlayerDashboard() (無 hash)");
                }
                // 這裡可以選擇是否顯示 intro
                $main._show('intro', true); // 顯示 intro 文章
            }
        }, 100);
    });

    // Fix: Flexbox min-height bug on IE.
    if (browser.name == 'ie') {

        var flexboxFixTimeoutId;

        $window.on('resize.flexbox-fix', function() {

            clearTimeout(flexboxFixTimeoutId);

            flexboxFixTimeoutId = setTimeout(function() {

                if ($wrapper.prop('scrollHeight') > $window.height())
                    $wrapper.css('height', 'auto');
                else
                    $wrapper.css('height', '100vh');

            }, 250);

        }).triggerHandler('resize.flexbox-fix');

    }

    // Nav.
    var $nav = $header.children('nav'),
        $nav_li = $nav.find('li');

    // Add "middle" alignment classes if we're dealing with an even number of items.
    if ($nav_li.length % 2 == 0) {

        $nav.addClass('use-middle');
        $nav_li.eq(($nav_li.length / 2)).addClass('is-middle');

    }

    // Main.
    var delay = 325,
        locked = false;

    // Methods.
    $main._show = function(id, initial) {

        var $article = $main_articles.filter('#' + id);

        // No such article? Bail.
        if ($article.length == 0)
            return;

        // Handle lock.

        // Already locked? Speed through "show" steps w/o delays.
        if (locked || (typeof initial != 'undefined' && initial === true)) {

            // Mark as switching.
            $body.addClass('is-switching');

            // Mark as visible.
            $body.addClass('is-article-visible');

            // Deactivate all articles (just in case one's already active).
            $main_articles.removeClass('active');

            // Hide header, footer.
            $header.hide();
            $footer.hide();

            // Show main, article.
            $main.show();
            $article.show();

            // Activate article.
            $article.addClass('active');

            // Unlock.
            locked = false;

            // Unmark as switching.
            setTimeout(function() {
                $body.removeClass('is-switching');
            }, (initial ? 1000 : 0));

            return;

        }

        // Lock.
        locked = true;

        // Article already visible? Just swap articles.
        if ($body.hasClass('is-article-visible')) {

            // Deactivate current article.
            var $currentArticle = $main_articles.filter('.active');

            $currentArticle.removeClass('active');

            // Show article.
            setTimeout(function() {

                // Hide current article.
                $currentArticle.hide();

                // Show article.
                $article.show();

                // Activate article.
                setTimeout(function() {

                    $article.addClass('active');

                    // Window stuff.
                    $window
                        .scrollTop(0)
                        .triggerHandler('resize.flexbox-fix');

                    // Unlock.
                    setTimeout(function() {
                        locked = false;
                    }, delay);

                }, 25);

            }, delay);

        }

        // Otherwise, handle as normal.
        else {

            // Mark as visible.
            $body
                .addClass('is-article-visible');

            // Show article.
            setTimeout(function() {

                // Hide header, footer.
                $header.hide();
                $footer.hide();

                // Show main, article.
                $main.show();
                $article.show();

                // Activate article.
                setTimeout(function() {

                    $article.addClass('active');

                    // Window stuff.
                    $window
                        .scrollTop(0)
                        .triggerHandler('resize.flexbox-fix');

                    // Unlock.
                    setTimeout(function() {
                        locked = false;
                    }, delay);

                }, 25);

            }, delay);

        }

    };

    $main._hide = function(addState) {

        var $article = $main_articles.filter('.active');

        // Article not visible? Bail.
        if (!$body.hasClass('is-article-visible'))
            return;

        // Add state?
        if (typeof addState != 'undefined' &&
            addState === true)
            history.pushState(null, null, '#');

        // Handle lock.

        // Already locked? Speed through "hide" steps w/o delays.
        if (locked) {

            // Mark as switching.
            $body.addClass('is-switching');

            // Deactivate article.
            $article.removeClass('active');

            // Hide article, main.
            $article.hide();
            $main.hide();

            // Show footer, header.
            $footer.show();
            $header.show();

            // Unmark as visible.
            $body.removeClass('is-article-visible');

            // Unlock.
            locked = false;

            // Unmark as switching.
            $body.removeClass('is-switching');

            // Window stuff.
            $window
                .scrollTop(0)
                .triggerHandler('resize.flexbox-fix');

            return;

        }

        // Lock.
        locked = true;

        // Deactivate article.
        $article.removeClass('active');

        // Hide article.
        setTimeout(function() {

            // Hide article, main.
            $article.hide();
            $main.hide();

            // Show footer, header.
            $footer.show();
            $header.show();

            // Unmark as visible.
            setTimeout(function() {

                $body.removeClass('is-article-visible');

                // Window stuff.
                $window
                    .scrollTop(0)
                    .triggerHandler('resize.flexbox-fix');

                // Unlock.
                setTimeout(function() {
                    locked = false;
                }, delay);

            }, 25);

        }, delay);


    };

    // Articles.
    $main_articles.each(function() {

        var $this = $(this);

        // Close.
        $('<div class="close">Close</div>')
            .appendTo($this)
            .on('click', function() {
                location.hash = '';
            });

        // Prevent clicks from inside article from bubbling.
        $this.on('click', function(event) {
            event.stopPropagation();
        });

    });

    // Events.
    $body.on('click', function(event) {
        // 如果點擊的目標或其任何祖先元素是 #team-logo-slider，則不執行任何操作。
        // 這會允許 #team-logo-slider 內部元素執行其原生行為，例如滾動。
        if ($(event.target).closest('#team-logo-slider').length > 0) {
            return; // 退出函數，不執行後續的隱藏邏輯
        }

        // Article visible? Hide.
        if ($body.hasClass('is-article-visible'))
            $main._hide(true);
    });

    $window.on('keyup', function(event) {

        switch (event.keyCode) {

            case 27:

                // Article visible? Hide.
                if ($body.hasClass('is-article-visible'))
                    $main._hide(true);

                break;

            default:
                break;

        }

    });

    // --- 修改：處理 URL Hash 變化事件 ---
    $window.on('hashchange', function(event) {
        const hash = window.location.hash;
        console.log("main.js: handleHashChange: 當前 URL Hash:", hash); // 方便除錯

        // 預防預設行為，尤其是在 URL 中有參數時
        event.preventDefault();
        event.stopPropagation();
        $main_articles.hide();

        // 判斷是否需要隱藏當前文章 (回到首頁)
        if (hash === '' || hash === '#') {
            // 當回到首頁時，確保 #main 容器和 #wrapper 是顯示的
            // 由於 _hide(true) 可能也作用於 #main，我們需要明確地重新顯示它們
            $wrapper.show(); // 確保整個 wrapper 是顯示的
            $header.show(); // 確保 header 是顯示的
            $footer.show(); // 確保 footer 是顯示的
            $main.show(); // 確保 main 容器是顯示的

            // 如果你的 _hide(true) 函數會處理一些動畫或狀態，可以保留它
            // 但在這裡，我們優先確保 DOM 元素的顯示狀態
            // $main._hide(true); // 這行可能不需要，或者它的作用是設置 class 來控制動畫，而非直接 display: none;
            // 如果你確定 _hide(true) 導致 #main 隱藏了，那上面 show() 的方式是直接解決
            // 如果 _hide(true) 會導致 preload 類別的添加，那它可能仍有必要
            // 先暫時保留，如果還不行再移除或調整。

            // 頁面回到首頁時，可能需要清除一些特定於頁面的類別
            $body.removeClass('is-article-visible'); // 如果你有此類別來隱藏主頁內容
            console.log("main.js: 返回首頁，主介面應已顯示。");

        }
        // 檢查是否是團隊儀表板
        else if (hash === '#team-dashboard') {
            $('#team-dashboard').show(); // 顯示團隊儀表板 (直接指定 ID 顯示)
            $main._show('team-dashboard'); // 顯示團隊儀表板
            // 確保團隊儀表板初始化並顯示
            if (window.initTeamDashboard) {
                window.initTeamDashboard();
                console.log("main.js: 呼叫 initTeamDashboard()");
            } else {
                console.error("main.js: initTeamDashboard 函數未定義。");
            }
        }
        // 檢查是否是球員儀表板 (可能帶有參數)
        else if (hash.startsWith('#player-dashboard')) {
            $('#player-dashboard').show(); // 顯示球員儀表板 (直接指定 ID 顯示)
            $main._show('player-dashboard'); // 顯示球員儀表板
            const playerName = window.getUrlParameter('player'); // 從 URL 獲取 player 參數

            if (playerName) {
                // 呼叫 player-dashboard.js 中的更新函數
                if (window.updatePlayerDisplay) {
                    window.updatePlayerDisplay(playerName);
                    console.log(`main.js: 呼叫 updatePlayerDisplay('${playerName}')`);
                } else {
                    console.error("main.js: updatePlayerDisplay 函數未定義。");
                }
            } else {
                // 如果 hash 是 #player-dashboard 但沒有 player 參數
                // 可以在這裡顯示一個提示訊息，或保持預設狀態
                $('#playerNameDisplay').text("請輸入球員名稱進行搜尋。"); // 假設有此元素
                console.warn("main.js: URL Hash 為 #player-dashboard 但未找到球員名字參數。");
            }
        }
        // 處理其他一般文章連結 (例如 #contact, #about 等)
        else if ($main_articles.filter(hash).length > 0) {
            $(hash).show(); // 顯示對應文章 (直接指定 ID 顯示)
            $main._show(hash.substr(1)); // 顯示對應文章
        }
    });

    // Scroll restoration.
    // This prevents the page from scrolling back to the top on a hashchange.
    if ('scrollRestoration' in history)
        history.scrollRestoration = 'manual';
    else {

        var oldScrollPos = 0,
            scrollPos = 0,
            $htmlbody = $('html,body');

        $window
            .on('scroll', function() {

                oldScrollPos = scrollPos;
                scrollPos = $htmlbody.scrollTop();

            })
            .on('hashchange', function() {
                $window.scrollTop(oldScrollPos);
            });

    }

    // --- 新增：處理搜尋表單提交事件 ---
    $searchForm.on('submit', function(event) {
        event.preventDefault(); // 阻止表單預設提交行為

        const playerName = $('#player-search-input').val().trim(); // 獲取輸入框的值

        if (playerName) {
            // 更新 URL hash，觸發 hashchange 事件，並將球員名稱作為參數
            // 使用 encodeURIComponent 確保球員名稱中的特殊字元被正確編碼
            window.location.hash = `#player-dashboard?player=${encodeURIComponent(playerName)}`;
            // 這裡不需要直接調用 updatePlayerDisplay，因為 hashchange 會處理
        } else {
            // 如果搜尋框為空，可以給用戶一些提示
            // 假設您在 player-dashboard.html 有一個顯示球員名稱的元素，ID 為 playerNameDisplay
            $('#playerNameDisplay').text("請輸入球員名稱進行搜尋。");
            // 隱藏球員儀表板，如果它正在顯示
            // 由於您的 _show/_hide 邏輯是基於 is-article-visible，這裡可能需要額外調整
            // 或者依賴 hashchange 處理沒有參數的 #player-dashboard
            $main._hide(true); // 隱藏當前可見的文章
            // 如果您需要更精細地控制，例如只隱藏 player-dashboard 但不回到首頁
            // 這邊的邏輯可能需要與 handleHashChange 配合
        }
    });

    // Initialize.

    // Hide main, articles.
    $main.hide();
    $main_articles.hide();

    // 初始化儀表板相關函數 (在 window.on('load') 之前執行，確保函數可用)
    // 這些函數應該由 team-dashboard.js 和 player-dashboard.js 暴露到 window 物件上
    if (!window.initTeamDashboard) {
        window.initTeamDashboard = function() { console.warn("initTeamDashboard 尚未載入或定義。"); };
    }
    if (!window.initPlayerDashboard) {
        window.initPlayerDashboard = function() { console.warn("initPlayerDashboard 尚未載入或定義。"); };
    }
    if (!window.updatePlayerDisplay) {
        window.updatePlayerDisplay = function(playerName) { console.warn(`updatePlayerDisplay 尚未載入或定義，無法顯示 ${playerName}。`); };
    }
    if (!window.getUrlParameter) {
        window.getUrlParameter = function(name) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(window.location.hash);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        console.log("main.js: getUrlParameter 函數已在 main.js 中定義為後備方案。");
    }

    // 原始的 Initial article 邏輯現在已由 $window.on('load') 處理
    // 這裡可以移除，因為 load 事件中的邏輯會處理首次載入的 hash
    // 但為安全起見，如果 load 事件中的邏輯不夠，可以考慮將其保留
    // 但由於已經在 load 事件中觸發 hashchange，這裡就不再需要了
    // 因此，可以直接移除此區塊。

})(jQuery);