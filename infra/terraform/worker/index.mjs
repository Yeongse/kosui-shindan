/**
 * 静的サイト配信用の最小 Worker。
 * リクエストはまず静的アセット（out/）から解決され、一致しなかったものだけがここに来る。
 * ここでも ASSETS に委ねることで、assets.config.not_found_handling（404-page）が適用される。
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
