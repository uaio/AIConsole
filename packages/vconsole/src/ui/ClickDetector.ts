/**
 * 连击检测器
 * 检测在指定时间窗口内的多次点击
 */
export class ClickDetector {
  private clicks: number[] = [];
  private readonly windowMs: number;
  private readonly callback: () => void;

  /**
   * @param windowMs 时间窗口（毫秒）
   * @param callback 达到连击条件时的回调
   * @param requiredClicks 需要的点击次数，默认 3
   */
  constructor(
    windowMs: number,
    callback: () => void,
    private readonly requiredClicks: number = 3
  ) {
    this.windowMs = windowMs;
    this.callback = callback;
  }

  /**
   * 注册一次点击
   * 如果在时间窗口内达到所需点击次数，触发回调
   */
  registerClick(): void {
    const now = Date.now();
    this.clicks.push(now);

    // 清理超出时间窗口的点击记录
    this.clicks = this.clicks.filter(click => now - click < this.windowMs);

    // 检查是否达到连击条件
    if (this.clicks.length >= this.requiredClicks) {
      this.callback();
      this.reset();
    }
  }

  /**
   * 重置点击计数
   */
  reset(): void {
    this.clicks = [];
  }
}
