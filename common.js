// 江苏专转本资讯网 - 公共头部/底部模块 + 用户认证
(function() {
    var pages = [
        { href: 'index.html',    label: '首页' },
        { href: 'policy.html',   label: '政策文件' },
        { href: 'school.html',   label: '院校库' },
        { href: 'score.html',    label: '分数线查询' },
        { href: 'resource.html', label: '真题资料' },
        { href: 'volunteer.html',label: '志愿填报工具' },
        { href: 'study.html',    label: '备考干货' },
        { href: 'community.html',label: '问答社区' }
    ];

    var current = location.pathname.split('/').pop() || 'index.html';

    // 生成导航链接
    var navHTML = '';
    for (var i = 0; i < pages.length; i++) {
        var cls = (pages[i].href === current) ? ' class="active"' : '';
        navHTML += '<a href="' + pages[i].href + '"' + cls + '>' + pages[i].label + '</a>';
    }

    // 渲染头部（含登录区域占位）
    var header = document.getElementById('header');
    if (header) {
        header.innerHTML =
            '<h1>江苏专转本资讯平台</h1>' +
            '<div class="nav-wrapper">' +
                '<div class="nav">' + navHTML + '</div>' +
                '<div class="auth-area" id="authArea"><span class="auth-loading">加载中...</span></div>' +
            '</div>';
    }

    // 渲染底部
    var footer = document.getElementById('footer');
    if (footer) {
        footer.innerHTML = '<p>江苏专转本资讯网 | 仅供备考参考 | 所有政策以江苏省教育考试院官方发布为准</p>';
    }

    // 注入登录模态框
    var modalHTML =
        '<div class="auth-overlay" id="authOverlay" style="display:none">' +
            '<div class="auth-modal">' +
                '<span class="auth-close" id="authClose">&times;</span>' +
                '<div class="auth-tabs">' +
                    '<span class="auth-tab active" data-tab="login">登录</span>' +
                    '<span class="auth-tab" data-tab="register">注册</span>' +
                '</div>' +
                '<div class="auth-error" id="authError" style="display:none"></div>' +
                // 登录表单
                '<form id="loginForm" class="auth-form" onsubmit="return false">' +
                    '<input type="email" id="loginEmail" placeholder="邮箱地址" required>' +
                    '<input type="password" id="loginPassword" placeholder="密码" required minlength="6">' +
                    '<button type="submit" id="loginBtn">登 录</button>' +
                    '<a class="auth-link" id="forgotLink">忘记密码？发送重置邮件</a>' +
                '</form>' +
                // 注册表单
                '<form id="registerForm" class="auth-form" style="display:none" onsubmit="return false">' +
                    '<input type="text" id="regNickname" placeholder="昵称（选填）" maxlength="20">' +
                    '<input type="email" id="regEmail" placeholder="邮箱地址" required>' +
                    '<input type="password" id="regPassword" placeholder="密码（至少6位）" required minlength="6">' +
                    '<button type="submit" id="regBtn">注 册</button>' +
                '</form>' +
                '<div class="auth-success" id="authSuccess" style="display:none"></div>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // ========== 认证逻辑 ==========
    var authArea = document.getElementById('authArea');
    var overlay = document.getElementById('authOverlay');
    var authError = document.getElementById('authError');
    var authSuccess = document.getElementById('authSuccess');

    // Supabase 就绪后更新 UI
    window.onSupabaseReady = function() {
        checkSession();
    };

    // 如果 Supabase SDK 早已加载
    if (window.supabaseClient) {
        checkSession();
    }

    function checkSession() {
        var client = window.supabaseClient;
        if (!client) {
            authArea.innerHTML = '<span class="auth-placeholder">未连接</span>';
            return;
        }
        client.auth.getSession().then(function(res) {
            var session = res.data.session;
            if (session && session.user) {
                renderLoggedIn(session.user);
            } else {
                renderLoggedOut();
            }
        }).catch(function() {
            renderLoggedOut();
        });
    }

    function renderLoggedOut() {
        authArea.innerHTML = '<button class="btn-auth" id="btnLogin">登 录</button>';
        document.getElementById('btnLogin').onclick = function() { showModal('login'); };
    }

    function renderLoggedIn(user) {
        var email = user.email || '';
        var name = email.split('@')[0];
        // 从 user_metadata 取昵称
        if (user.user_metadata && user.user_metadata.nickname) {
            name = user.user_metadata.nickname;
        }
        authArea.innerHTML =
            '<a href="profile.html" class="auth-user" style="text-decoration:none">' + escHtml(name) + '</a>' +
            '<button class="btn-auth btn-logout" id="btnLogout">退出</button>';
        document.getElementById('btnLogout').onclick = function() { doLogout(); };
    }

    function showModal(tab) {
        overlay.style.display = 'flex';
        authError.style.display = 'none';
        authSuccess.style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('regNickname').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        switchTab(tab);
    }

    function switchTab(tab) {
        var tabs = document.querySelectorAll('.auth-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
            if (tabs[i].getAttribute('data-tab') === tab) {
                tabs[i].classList.add('active');
            }
        }
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
        authError.style.display = 'none';
    }

    // 事件绑定
    document.getElementById('authClose').onclick = function() { overlay.style.display = 'none'; };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };

    document.querySelectorAll('.auth-tab').forEach(function(tab) {
        tab.onclick = function() { switchTab(this.getAttribute('data-tab')); };
    });

    // 登录
    document.getElementById('loginBtn').onclick = function() {
        var email = document.getElementById('loginEmail').value.trim();
        var password = document.getElementById('loginPassword').value;
        if (!email || !password) { showError('请填写邮箱和密码'); return; }
        var btn = document.getElementById('loginBtn');
        btn.textContent = '登录中...';
        btn.disabled = true;
        window.supabaseClient.auth.signInWithPassword({ email: email, password: password })
            .then(function(res) {
                if (res.error) { showError(res.error.message); btn.textContent = '登 录'; btn.disabled = false; return; }
                overlay.style.display = 'none';
                renderLoggedIn(res.data.user);
            })
            .catch(function(err) { showError(err.message); btn.textContent = '登 录'; btn.disabled = false; });
    };

    // 注册
    document.getElementById('regBtn').onclick = function() {
        var nickname = document.getElementById('regNickname').value.trim();
        var email = document.getElementById('regEmail').value.trim();
        var password = document.getElementById('regPassword').value;
        if (!email || !password) { showError('请填写邮箱和密码'); return; }
        var btn = document.getElementById('regBtn');
        btn.textContent = '注册中...';
        btn.disabled = true;
        var options = {};
        if (nickname) { options.data = { nickname: nickname }; }
        window.supabaseClient.auth.signUp({ email: email, password: password, options: options })
            .then(function(res) {
                if (res.error) { showError(res.error.message); btn.textContent = '注 册'; btn.disabled = false; return; }
                if (res.data.user && res.data.user.identities && res.data.user.identities.length === 0) {
                    showError('该邮箱已被注册，请直接登录');
                    btn.textContent = '注 册';
                    btn.disabled = false;
                    return;
                }
                // 注册成功
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'none';
                authSuccess.style.display = 'block';
                authSuccess.innerHTML = '注册成功！请检查邮箱 <b>' + escHtml(email) + '</b> 中的确认邮件（可能被归入垃圾邮件），确认后即可登录。';
                btn.textContent = '注 册';
                btn.disabled = false;
            })
            .catch(function(err) { showError(err.message); btn.textContent = '注 册'; btn.disabled = false; });
    };

    // 忘记密码
    document.getElementById('forgotLink').onclick = function() {
        var email = document.getElementById('loginEmail').value.trim();
        if (!email) { showError('请先在上方输入邮箱地址'); return; }
        window.supabaseClient.auth.resetPasswordForEmail({ email: email })
            .then(function(res) {
                if (res.error) { showError(res.error.message); return; }
                authSuccess.style.display = 'block';
                authSuccess.innerHTML = '密码重置邮件已发送至 <b>' + escHtml(email) + '</b>，请查收（可能被归入垃圾邮件）。';
            });
    };

    // 退出
    function doLogout() {
        window.supabaseClient.auth.signOut().then(function() {
            renderLoggedOut();
        });
    }

    function showError(msg) {
        authError.textContent = msg;
        authError.style.display = 'block';
    }

    function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // 注册快捷键：按 Enter 提交
    document.getElementById('loginPassword').onkeydown = function(e) {
        if (e.key === 'Enter') document.getElementById('loginBtn').click();
    };
    document.getElementById('regPassword').onkeydown = function(e) {
        if (e.key === 'Enter') document.getElementById('regBtn').click();
    };
})();
