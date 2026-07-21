import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

function showBootShell(message: string, isError = false) {
  $('#app').html(`
    <div id="garden-mvu-root">
      <div class="mvu-status-bar garden-boot-shell${isError ? ' is-error' : ''}">
        <div class="garden-boot-msg">${message}</div>
      </div>
    </div>
  `);
}

$(async () => {
  showBootShell('花园终端同步中...');

  try {
    await waitGlobalInitialized('Mvu');
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), {
      timeout: 120_000,
      intervalBetweenAttempts: 50,
    });
    createApp(App).use(createPinia()).mount('#app');
  } catch (error) {
    console.error('[花园状态栏] 启动失败', error);
    showBootShell('花园终端启动失败: 等待 MVU / stat_data 超时。请确认已启用「花园 MVU」「花园变量结构」脚本。', true);
  }
});
