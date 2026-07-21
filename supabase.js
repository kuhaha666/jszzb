// Supabase 客户端初始化
// 替换为你的 Supabase 项目 URL 和 anon key
// 获取方式：Supabase 控制台 → Project Settings → API
var SUPABASE_URL = 'https://uoaiexageougvfwqoegv.supabase.co';
var SUPABASE_KEY = 'sb_publishable_qAGs09s-BQfAdITeshWXXQ_cnDZfVNW';

// 从 CDN 加载 Supabase SDK
(function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function() {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // 触发登录状态检查
        if (window.onSupabaseReady) window.onSupabaseReady();
    };
    document.head.appendChild(script);
})();
